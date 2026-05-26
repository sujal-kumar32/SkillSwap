const crypto = require("crypto");
const Session = require("../apis/Session/sessionModel");

async function ensureMeetLink(session) {
  if (!session || session.sessionType !== "online" || session.meetLink) return session;

  const suffix = crypto.randomBytes(4).toString("hex");
  const meetLink = `https://meet.jit.si/skillswap-${session._id}-${suffix}`;

  await Session.findByIdAndUpdate(session._id, { meetLink });
  session.meetLink = meetLink;
  return session;
}

async function ensureMeetLinks(sessions) {
  const needsLink = sessions.filter((s) => s.sessionType === "online" && !s.meetLink);
  for (const s of needsLink) {
    const suffix = crypto.randomBytes(4).toString("hex");
    s.meetLink = `https://meet.jit.si/skillswap-${s._id}-${suffix}`;
  }
  if (needsLink.length) {
    const bulk = needsLink.map((s) => ({
      updateOne: { filter: { _id: s._id }, update: { meetLink: s.meetLink } },
    }));
    await Session.bulkWrite(bulk);
  }
  return sessions;
}

module.exports = { ensureMeetLink, ensureMeetLinks };
