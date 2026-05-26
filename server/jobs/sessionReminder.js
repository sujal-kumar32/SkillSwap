const Request = require("../apis/Request/requestModel");
const Session = require("../apis/Session/sessionModel");
const User = require("../apis/Users/userModel");
const { sendEmail } = require("../utilities/emailService");
const { sessionReminder } = require("../utilities/emailTemplates");

function getStartDateTime(session) {
  const startTime = session.date ? new Date(session.date) : new Date();
  if (session.time) {
    const [h, m] = session.time.split(":").map(Number);
    startTime.setHours(h || 0, m || 0, 0, 0);
  }
  return startTime;
}

async function autoCompleteSessions() {
  try {
    const now = new Date();
    const activeSessions = await Session.find({ status: "active" }).lean();

    for (const session of activeSessions) {
      if (!session.date) continue;

      const startTime = getStartDateTime(session);
      const duration = session.duration || 60;
      const endTime = new Date(startTime.getTime() + duration * 60000);

      if (now > endTime) {
        await Session.findByIdAndUpdate(session._id, { status: "completed" });
        await Request.updateMany(
          { sessionId: session._id, requestStatus: "accepted" },
          { requestStatus: "completed" },
        );
        console.log(`Auto-completed session "${session.title}" (${session._id})`);
      }
    }
  } catch (err) {
    console.error("Auto-complete cron error:", err.message);
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
