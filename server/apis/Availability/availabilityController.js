const Availability = require("./availabilityModel");
const Request = require("../Request/requestModel");
const Session = require("../Session/sessionModel");
const asyncHandler = require("../../utilities/asyncHandler");

exports.getMyAvailability = asyncHandler(async (req, res) => {
  let availability = await Availability.findOne({ mentorId: req.user.id }).lean();
  if (!availability) {
    availability = { mentorId: req.user.id, timezone: "UTC", slots: [] };
  }
  res.json({ success: true, data: availability });
});

exports.updateMyAvailability = asyncHandler(async (req, res) => {
  const { slots, timezone } = req.body;
  if (!Array.isArray(slots)) {
    return res.status(400).json({ success: false, message: "Slots must be an array" });
  }
  for (const slot of slots) {
    if (typeof slot.dayOfWeek !== "number" || slot.dayOfWeek < 0 || slot.dayOfWeek > 6) {
      return res.status(400).json({ success: false, message: "Each slot must have dayOfWeek (0-6)" });
    }
    if (!slot.startTime || !slot.endTime) {
      return res.status(400).json({ success: false, message: "Each slot must have startTime and endTime" });
    }
  }
  const availability = await Availability.findOneAndUpdate(
    { mentorId: req.user.id },
    { mentorId: req.user.id, slots, timezone: timezone || "UTC" },
    { upsert: true, new: true, runValidators: true },
  );
  res.json({ success: true, data: availability });
});

exports.getMentorAvailability = asyncHandler(async (req, res) => {
  const { mentorId } = req.params;
  const availability = await Availability.findOne({ mentorId }).lean();
  if (!availability) {
    return res.json({ success: true, data: { slots: [], timezone: "UTC" } });
  }
  res.json({ success: true, data: { slots: availability.slots, timezone: availability.timezone } });
});

exports.getBookedSlots = asyncHandler(async (req, res) => {
  const { mentorId, date } = req.query;
  const targetMentor = mentorId || req.user.id;
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const sessions = await Session.find({
    mentorId: targetMentor,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: "active",
  }).select("_id title time duration").lean();

  if (!sessions.length) {
    return res.json({ success: true, data: [] });
  }

  const sessionIds = sessions.map((s) => s._id);
  const bookings = await Request.find({
    sessionId: { $in: sessionIds },
    requestStatus: { $in: ["pending", "accepted"] },
  })
    .populate("learnerId", "name")
    .lean();

  const sessionMap = {};
  sessions.forEach((s) => { sessionMap[s._id.toString()] = s; });

  const slots = bookings.map((b) => {
    const s = sessionMap[b.sessionId?.toString()];
    return {
      time: s?.time || "",
      duration: s?.duration || 0,
      title: s?.title || "",
      learnerName: b.learnerId?.name || "Unknown",
      requestStatus: b.requestStatus,
      bookingId: b._id,
    };
  });

  res.json({ success: true, data: slots });
});
