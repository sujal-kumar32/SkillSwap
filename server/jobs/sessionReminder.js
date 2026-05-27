const Request = require("../apis/Request/requestModel");
const Session = require("../apis/Session/sessionModel");
const User = require("../apis/Users/userModel");
const { sendEmail } = require("../utilities/emailService");
const { sessionReminder } = require("../utilities/emailTemplates");

let isAutoCompleting = false;

function getStartDateTime(session) {
  const startTime = session.date ? new Date(session.date) : new Date();
  if (session.time) {
    const [h, m] = session.time.split(":").map(Number);
    startTime.setHours(h || 0, m || 0, 0, 0);
  }
  return startTime;
}

async function autoCompleteSessions() {
  if (isAutoCompleting) return;
  isAutoCompleting = true;
  try {
    const now = new Date();
    const Wallet = require("../apis/Wallet/walletModel");
    const Transaction = require("../apis/Wallet/transactionModel");

    // Mark ongoing sessions that have ended
    const ongoingSessions = await Session.find({ status: "ongoing" }).lean();
    for (const session of ongoingSessions) {
      if (!session.date) continue;
      const startTime = getStartDateTime(session);
      const endTime = new Date(startTime.getTime() + (session.duration || 60) * 60000);

      if (now >= endTime) {
        const requests = await Request.find({
          sessionId: session._id,
          requestStatus: "accepted",
        }).lean();

        let hadStarted = false;
        for (const req of requests) {
          if (req.startedAt) {
            hadStarted = true;
            await Request.findByIdAndUpdate(req._id, { requestStatus: "completed" });
            if (req.paymentStatus === "paid" && session.price > 0) {
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
            }
          } else {
            await Request.findByIdAndUpdate(req._id, { requestStatus: "cancelled" });
            if (req.paymentStatus === "paid" && session.price > 0) {
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
            }
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
    }

    // Mark active sessions that have started as ongoing
    const activeSessions = await Session.find({ status: "active" }).lean();
    for (const session of activeSessions) {
      if (!session.date) continue;
      const startTime = getStartDateTime(session);
      if (now >= startTime && now < new Date(startTime.getTime() + (session.duration || 60) * 60000)) {
        await Session.findByIdAndUpdate(session._id, { status: "ongoing" });
        console.log(`Session "${session.title}" (${session._id}) is now ongoing`);
      }
    }
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

      const startTime = getStartDateTime(session);
      const diffMs = startTime.getTime() - now.getTime();
      const diffMin = diffMs / 60000;

      const alreadySent = req.reminderSent || [];

      if (diffMin > 1380 && diffMin < 1500 && !alreadySent.includes("24h")) {
        const learnerTemplate = sessionReminder(
          req.learnerId?.name || "Learner",
          session.title,
          session.date,
          session.time,
          req.mentorId?.name || "Mentor",
          session.meetLink
        );
        const mentorTemplate = sessionReminder(
          req.mentorId?.name || "Mentor",
          session.title,
          session.date,
          session.time,
          "",
          session.meetLink
        );

        if (req.learnerId?.email) {
          sendEmail({
            to: req.learnerId.email,
            subject: `Reminder: "${session.title}" is tomorrow!`,
            html: learnerTemplate,
          }).catch((err) => console.error("24h reminder to learner failed:", err.message));
        }

        if (req.mentorId?.email) {
          sendEmail({
            to: req.mentorId.email,
            subject: `Reminder: "${session.title}" is tomorrow!`,
            html: mentorTemplate,
          }).catch((err) => console.error("24h reminder to mentor failed:", err.message));
        }

        req.reminderSent.push("24h");
        await req.save();
        console.log(`24h reminder sent for session "${session.title}" (request ${req._id})`);
      }

      if (diffMin > 50 && diffMin < 70 && !alreadySent.includes("1h")) {
        const learnerTemplate = sessionReminder(
          req.learnerId?.name || "Learner",
          session.title,
          session.date,
          session.time,
          req.mentorId?.name || "Mentor",
          session.meetLink
        );
        const mentorTemplate = sessionReminder(
          req.mentorId?.name || "Mentor",
          session.title,
          session.date,
          session.time,
          "",
          session.meetLink
        );

        if (req.learnerId?.email) {
          sendEmail({
            to: req.learnerId.email,
            subject: `⏰ "${session.title}" starts in 1 hour!`,
            html: learnerTemplate,
          }).catch((err) => console.error("1h reminder to learner failed:", err.message));
        }

        if (req.mentorId?.email) {
          sendEmail({
            to: req.mentorId.email,
            subject: `⏰ "${session.title}" starts in 1 hour!`,
            html: mentorTemplate,
          }).catch((err) => console.error("1h reminder to mentor failed:", err.message));
        }

        req.reminderSent.push("1h");
        await req.save();
        console.log(`1h reminder sent for session "${session.title}" (request ${req._id})`);
      }
    }
  } catch (err) {
    console.error("Session reminder cron error:", err.message);
  }
}

module.exports = { checkSessionReminders, autoCompleteSessions };
