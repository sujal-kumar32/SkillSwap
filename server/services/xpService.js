const User = require("../apis/Users/userModel");
const Badge = require("../apis/Badges/badgeModel");
const Request = require("../apis/Request/requestModel");
const Review = require("../apis/Reviews/reviewModel");
const Session = require("../apis/Session/sessionModel");
const XpTransaction = require("../models/XpTransaction");
const mongoose = require("mongoose");

function calculateLevel(xp) {
  return Math.max(1, Math.floor((1 + Math.sqrt(1 + 8 * xp / 50)) / 2));
}

function xpForNextLevel(level) {
  return 50 * level * (level + 1) - 50 * level * (level - 1);
}

async function getUserStats(userId) {
  const oid = new mongoose.Types.ObjectId(userId);

  const [completedAsLearner, completedAsMentor, reviewsLeft, bookingsReceived, ratingResult] = await Promise.all([
    Request.countDocuments({ learnerId: oid, requestStatus: "completed" }),
    Request.countDocuments({ mentorId: oid, requestStatus: "completed" }),
    Review.countDocuments({ learnerId: oid }),
    Request.countDocuments({ mentorId: oid }),
    Review.aggregate([
      { $match: { mentorId: oid } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]),
  ]);

  const avgRating = ratingResult[0]?.avg || 0;
  const ratingCount = ratingResult[0]?.count || 0;

  const completedRequestIds = await Request.find({
    learnerId: oid, requestStatus: "completed",
  }).distinct("sessionId");
  const sessionSkillIds = await Session.distinct("skillId", {
    _id: { $in: completedRequestIds },
  });
  const skillsCount = sessionSkillIds.length;

  const allSessionsBySkill = await Session.aggregate([
    { $match: { _id: { $in: completedRequestIds } } },
    { $group: { _id: "$skillId", count: { $sum: 1 } } },
  ]);

  const completedRequestsForSkill = await Request.aggregate([
    { $match: { learnerId: oid, requestStatus: "completed" } },
    { $lookup: { from: "sessions", localField: "sessionId", foreignField: "_id", as: "session" } },
    { $unwind: "$session" },
    { $group: { _id: "$session.skillId", completed: { $sum: 1 } } },
  ]);
  const skillMap = {};
  for (const s of completedRequestsForSkill) {
    skillMap[s._id.toString()] = s.completed;
  }

  const totalSessionsBySkill = await Session.aggregate([
    { $match: { _id: { $in: completedRequestIds } } },
    { $group: { _id: "$skillId", count: { $sum: 1 } } },
  ]);
  const totalMap = {};
  for (const s of totalSessionsBySkill) {
    totalMap[s._id.toString()] = s.count;
  }

  let skillsAt100 = 0;
  for (const skillId of sessionSkillIds) {
    const total = totalMap[skillId.toString()] || 0;
    const completed = skillMap[skillId.toString()] || 0;
    if (total > 0 && completed >= total) skillsAt100++;
  }

  return {
    sessionsCompleted: completedAsLearner,
    mentorSessionsCompleted: completedAsMentor,
    reviewsLeft,
    bookingsReceived,
    avgRating: Math.round(avgRating * 10) / 10,
    ratingCount,
    skillsCount,
    skillsAt100,
  };
}

async function checkAndAwardBadges(userId) {
  const user = await User.findById(userId);
  if (!user) return [];

  const earnedKeys = new Set((user.earnedBadges || []).map((b) => b.badgeId?.toString()));
  const allBadges = await Badge.find({}).lean();
  const stats = await getUserStats(userId);
  const newlyEarned = [];

  for (const badge of allBadges) {
    if (earnedKeys.has(badge._id.toString())) continue;

    let met = false;
    switch (badge.requirement.type) {
      case "sessions_completed":
        met = stats.sessionsCompleted >= badge.requirement.count;
        break;
      case "mentor_sessions_completed":
        met = stats.mentorSessionsCompleted >= badge.requirement.count;
        break;
      case "reviews_left":
        met = stats.reviewsLeft >= badge.requirement.count;
        break;
      case "bookings_received":
        met = stats.bookingsReceived >= badge.requirement.count;
        break;
      case "skills_completed":
        met = stats.skillsCount >= badge.requirement.count;
        break;
      case "skill_100":
        met = stats.skillsAt100 >= badge.requirement.count;
        break;
      case "xp_earned":
        met = user.xp >= badge.requirement.count;
        break;
      case "avg_rating":
        met = stats.avgRating >= 5.0 && stats.ratingCount >= badge.requirement.count;
        break;
      case "min_rating":
        met = stats.avgRating >= (badge.requirement.count / 10) && stats.ratingCount >= 10;
        break;
    }

    if (met) {
      user.earnedBadges.push({ badgeId: badge._id, earnedAt: new Date() });
      newlyEarned.push(badge);
    }
  }

  if (newlyEarned.length) await user.save();
  for (const badge of newlyEarned) {
    createFeedEvent(userId, "badge_earned", badge._id, "Badge", {
      badgeName: badge.name,
      badgeIcon: badge.icon,
      badgeColor: badge.color,
    });
  }
  return newlyEarned;
}

async function awardXP(userId, amount, reason, referenceId = null, referenceModel = null) {
  const user = await User.findById(userId);
  if (!user) return null;

  user.xp += amount;
  const newLevel = calculateLevel(user.xp);
  const leveledUp = newLevel > (user.level || 1);
  user.level = newLevel;
  await user.save();

  await XpTransaction.create({ userId, amount, reason, referenceId, referenceModel });

  if (leveledUp) {
    createFeedEvent(userId, "level_up", null, null, {
      level: newLevel,
      xp: user.xp,
    });
  }

  const newBadges = await checkAndAwardBadges(userId);

  const badgeDetails = newBadges.map((b) => ({
    _id: b._id, name: b.name, key: b.key, description: b.description,
    icon: b.icon, color: b.color, category: b.category,
  }));

  return { xp: user.xp, level: user.level, leveledUp, xpGained: amount, reason, newBadges: badgeDetails };
}

const { createFeedEvent } = require("./feedService");

module.exports = { awardXP, checkAndAwardBadges, calculateLevel, xpForNextLevel, getUserStats };
