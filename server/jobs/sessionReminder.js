const mongoose = require("mongoose");
const Request = require("../apis/Request/requestModel");
const Session = require("../apis/Session/sessionModel");
const User = require("../apis/Users/userModel");
const Wallet = require("../apis/Wallet/walletModel");
const Transaction = require("../apis/Wallet/transactionModel");
const { sendEmail } = require("../utilities/emailService");
const { sessionReminder } = require("../utilities/emailTemplates");
const { releaseCredits, transferCredits } = require("../services/creditService");

let isAutoCompleting = false;

function getStartDateTime(session) {
  const startTime = session.date ? new Date(session.date) : new Date();
  if (session.time) {
    const [h, m] = session.time.split(":").map(Number);
    startTime.setHours(h || 0, m || 0, 0, 0);
  }
  return startTime;
}

// ── autoCompleteSessions helpers ─────────────────────────────────────────

const getEndTime = (session) => {
  const startTime = getStartDateTime(session);
  return new Date(startTime.getTime() + (session.duration || 60) * 60000);
};

const creditMentorForRequest = async (req, session) => {
  if (req.paymentStatus !== "paid" || !session.price || session.price <= 0) return;
  let wallet = await Wallet.findOne({ userId: req.mentorId });
  if (!wallet) wallet = await Wallet.create({ userId: req.mentorId });
  await Transaction.create({
    walletId: wallet._id,
    userId: req.mentorId,
    type: "earning",
    amount: session.price,
    balanceBefore: wallet.balance,
    balanceAfter: wallet.balance + session.price,
    reference: String(req._id),
    referenceModel: "Request",
    description: "Earnings from auto-completed session",
    status: "completed",
  });
  wallet.balance += session.price;
  wallet.totalEarned += session.price;
  await wallet.save();
};

const transferSessionCredits = async (req) => {
  if (req.bookingSource !== "credits" || req.creditsLocked <= 0) return null;
  const mongoSession = await mongoose.startSession();
  try {
    mongoSession.startTransaction();
    await transferCredits(req.learnerId, req.mentorId, req.creditsLocked, req._id, mongoSession);
    await Request.findByIdAndUpdate(req._id, { requestStatus: "completed", creditsLocked: 0 }, { session: mongoSession });
    await mongoSession.commitTransaction();
  } catch (creditErr) {
    await mongoSession.abortTransaction().catch(() => {});
    console.error("Credit transfer failed in auto-complete:", creditErr.message);
  } finally {
    mongoSession.endSession();
  }
  return { creditsLocked: 0 };
};

const refundPaymentForRequest = async (req, session) => {
  if (req.paymentStatus !== "paid" || !session.price || session.price <= 0) return;
  let wallet = await Wallet.findOne({ userId: req.learnerId });
  if (!wallet) wallet = await Wallet.create({ userId: req.learnerId });
  await Transaction.create({
    walletId: wallet._id,
    userId: req.learnerId,
    type: "refund",
    amount: session.price,
    balanceBefore: wallet.balance,
    balanceAfter: wallet.balance + session.price,
    reference: String(req._id),
    referenceModel: "Request",
    description: "Refund — mentor did not start the session",
    status: "completed",
  });
  wallet.balance += session.price;
  await wallet.save();
};

const releaseSessionCredits = async (req) => {
  if (req.bookingSource !== "credits" || req.creditsLocked <= 0) return null;
  const mongoSession = await mongoose.startSession();
  try {
    mongoSession.startTransaction();
    await releaseCredits(req.learnerId, req.creditsLocked, mongoSession);
    await Transaction.create([{
      userId: req.learnerId,
      type: "credit_refunded",
      amount: req.creditsLocked,
      reference: String(req._id),
      referenceModel: "Request",
      description: "Credits refunded — mentor did not start the session",
      status: "completed",
    }], { session: mongoSession });
    await Request.findByIdAndUpdate(req._id, { requestStatus: "cancelled", creditsLocked: 0 }, { session: mongoSession });
    await mongoSession.commitTransaction();
  } catch (creditErr) {
    await mongoSession.abortTransaction().catch(() => {});
    console.error("Credit release failed in auto-cancel:", creditErr.message);
  } finally {
    mongoSession.endSession();
  }
  return { creditsLocked: 0 };
};

const processStartedRequest = async (req, session) => {
  await creditMentorForRequest(req, session);
  const creditResult = await transferSessionCredits(req);
  if (!creditResult) {
    await Request.findByIdAndUpdate(req._id, { requestStatus: "completed" });
  }
};

const processUnstartedRequest = async (req, session) => {
  await refundPaymentForRequest(req, session);
  const creditResult = await releaseSessionCredits(req);
  if (!creditResult) {
    await Request.findByIdAndUpdate(req._id, { requestStatus: "cancelled" });
  }
};

const completeOngoingSessions = async (now) => {
  const ongoingSessions = await Session.find({ status: "ongoing" }).lean();
  for (const session of ongoingSessions) {
    if (!session.date) continue;
    if (now < getEndTime(session)) continue;

    const requests = await Request.find({ sessionId: session._id, requestStatus: "accepted" }).lean();
    let hadStarted = false;
    for (const req of requests) {
      if (req.startedAt) {
        hadStarted = true;
        await processStartedRequest(req, session);
      } else {
        await processUnstartedRequest(req, session);
      }
    }

    if (hadStarted) {
      await Session.findByIdAndUpdate(session._id, { status: "completed" });
      console.log(`Auto-completed session "${session.title}" (${session._id})`);
    } else {
      await Session.findByIdAndUpdate(session._id, { status: "cancelled" });
      console.log(`Auto-cancelled session "${session.title}" (${session._id}) — mentor never started`);
    }
  }
};

const activateSessions = async (now) => {
  const activeSessions = await Session.find({ status: "active" }).lean();
  for (const session of activeSessions) {
    if (!session.date) continue;
    const startTime = getStartDateTime(session);
    if (now >= startTime && now < getEndTime(session)) {
      await Session.findByIdAndUpdate(session._id, { status: "ongoing" });
      console.log(`Session "${session.title}" (${session._id}) is now ongoing`);
    }
  }
};

const cancelExpiredSessions = async (now) => {
  const activeSessions = await Session.find({ status: "active" }).lean();
  for (const session of activeSessions) {
    if (!session.date) continue;
    if (now < getEndTime(session)) continue;
    const bookingCount = await Request.countDocuments({ sessionId: session._id });
    if (bookingCount === 0) {
      await Session.findByIdAndUpdate(session._id, { status: "cancelled" });
      console.log(`Auto-cancelled expired session "${session.title}" (${session._id}) — no bookings`);
    }
  }
};

// ── checkSessionReminders helpers ────────────────────────────────────────

const shouldSend24h = (diffMin, alreadySent) => diffMin > 1380 && diffMin < 1500 && !alreadySent.includes("24h");
const shouldSend1h = (diffMin, alreadySent) => diffMin > 50 && diffMin < 70 && !alreadySent.includes("1h");

const sendReminderEmail = (to, subject, html) => {
  if (!to) return;
  sendEmail({ to, subject, html }).catch((err) => console.error("Reminder email failed:", err.message));
};

const process24hReminder = async (req, session) => {
  const learnerHtml = sessionReminder(req.learnerId?.name || "Learner", session.title, session.date, session.time, req.mentorId?.name || "Mentor", session.meetLink);
  const mentorHtml = sessionReminder(req.mentorId?.name || "Mentor", session.title, session.date, session.time, "", session.meetLink);
  const subject = `Reminder: "${session.title}" is tomorrow!`;
  sendReminderEmail(req.learnerId?.email, subject, learnerHtml);
  sendReminderEmail(req.mentorId?.email, subject, mentorHtml);
  req.reminderSent.push("24h");
  await req.save();
  console.log(`24h reminder sent for session "${session.title}" (request ${req._id})`);
};

const process1hReminder = async (req, session) => {
  const learnerHtml = sessionReminder(req.learnerId?.name || "Learner", session.title, session.date, session.time, req.mentorId?.name || "Mentor", session.meetLink);
  const mentorHtml = sessionReminder(req.mentorId?.name || "Mentor", session.title, session.date, session.time, "", session.meetLink);
  const subject = `⏰ "${session.title}" starts in 1 hour!`;
  sendReminderEmail(req.learnerId?.email, subject, learnerHtml);
  sendReminderEmail(req.mentorId?.email, subject, mentorHtml);
  req.reminderSent.push("1h");
  await req.save();
  console.log(`1h reminder sent for session "${session.title}" (request ${req._id})`);
};

async function autoCompleteSessions() {
  if (isAutoCompleting) return;
  isAutoCompleting = true;
  try {
    const now = new Date();
    await completeOngoingSessions(now);
    await activateSessions(now);
    await cancelExpiredSessions(now);
  } catch (err) {
    console.error("Auto-complete cron error:", err.message);
  } finally {
    isAutoCompleting = false;
  }
}

async function checkSessionReminders() {
  try {
    const now = new Date();

    const requests = await Request.find({ requestStatus: "accepted" })
      .populate("sessionId")
      .populate("learnerId", "name email")
      .populate("mentorId", "name email");

    for (const req of requests) {
      const session = req.sessionId;
      if (!session || session.status !== "active") continue;

      const diffMin = (getStartDateTime(session).getTime() - now.getTime()) / 60000;
      const alreadySent = req.reminderSent || [];

      if (shouldSend24h(diffMin, alreadySent)) {
        await process24hReminder(req, session);
      }

      if (shouldSend1h(diffMin, alreadySent)) {
        await process1hReminder(req, session);
      }
    }
  } catch (err) {
    console.error("Session reminder cron error:", err.message);
  }
}

module.exports = { checkSessionReminders, autoCompleteSessions };
