const User = require("../Users/userModel");
const Review = require("../Reviews/reviewModel");
const Request = require("../Request/requestModel");
const asyncHandler = require("../../utilities/asyncHandler");
const mongoose = require("mongoose");

exports.getMentorLeaderboard = asyncHandler(async (req, res) => {
  const { period = "all", page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  let dateFilter = {};
  if (period === "weekly") {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    dateFilter = { createdAt: { $gte: weekAgo } };
  } else if (period === "monthly") {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    dateFilter = { createdAt: { $gte: monthAgo } };
  }

  const mentors = await User.find({
    roles: "mentor", status: "active",
  }).select("name email profileImage xp level earnedBadges").lean();

  const mentorIds = mentors.map((m) => m._id);

  const [sessionsCount, reviewsAgg] = await Promise.all([
    Request.aggregate([
      { $match: { mentorId: { $in: mentorIds }, requestStatus: "completed", ...dateFilter } },
      { $group: { _id: "$mentorId", count: { $sum: 1 } } },
    ]),
    Review.aggregate([
      { $match: { mentorId: { $in: mentorIds } } },
      { $group: { _id: "$mentorId", avgRating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } },
    ]),
  ]);

  const sessionMap = {};
  for (const s of sessionsCount) sessionMap[s._id.toString()] = s.count;

  const ratingMap = {};
  for (const r of reviewsAgg) {
    ratingMap[r._id.toString()] = { avg: Math.round(r.avgRating * 10) / 10, count: r.reviewCount };
  }

  const data = mentors.map((m) => {
    const id = m._id.toString();
    return {
      _id: m._id,
      name: m.name,
      email: m.email,
      profileImage: m.profileImage,
      xp: m.xp || 0,
      level: m.level || 1,
      badges: m.earnedBadges?.length || 0,
      sessionsCompleted: sessionMap[id] || 0,
      avgRating: ratingMap[id]?.avg || 0,
      reviewCount: ratingMap[id]?.count || 0,
    };
  });

  data.sort((a, b) => b.xp - a.xp);
  const total = data.length;
  const paginated = data.slice(skip, skip + parseInt(limit));

  res.json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: paginated,
  });
});

exports.getLearnerLeaderboard = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const learners = await User.find({
    roles: { $in: ["learner"] }, status: "active",
  }).select("name email profileImage xp level earnedBadges").lean();

  const learnerIds = learners.map((l) => l._id);

  const sessionsCount = await Request.aggregate([
    { $match: { learnerId: { $in: learnerIds }, requestStatus: "completed" } },
    { $group: { _id: "$learnerId", count: { $sum: 1 } } },
  ]);

  const sessionMap = {};
  for (const s of sessionsCount) sessionMap[s._id.toString()] = s.count;

  const data = learners
    .map((l) => ({
      _id: l._id,
      name: l.name,
      email: l.email,
      profileImage: l.profileImage,
      xp: l.xp || 0,
      level: l.level || 1,
      badges: l.earnedBadges?.length || 0,
      sessionsCompleted: sessionMap[l._id.toString()] || 0,
    }))
    .sort((a, b) => b.xp - a.xp);

  const total = data.length;
  const paginated = data.slice(skip, skip + parseInt(limit));

  res.json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: paginated,
  });
});
