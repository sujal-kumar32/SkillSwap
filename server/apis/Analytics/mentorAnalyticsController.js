const mongoose = require("mongoose");
const Session = require("../Session/sessionModel");
const Request = require("../Request/requestModel");
const Review = require("../Reviews/reviewModel");
const Transaction = require("../Wallet/transactionModel");
const Follow = require("../Follow/followModel");
const User = require("../Users/userModel");
const asyncHandler = require("../../utilities/asyncHandler");

exports.getMentorAnalytics = asyncHandler(async (req, res) => {
  const mentorId = req.user.id;

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    sessionStats,
    bookingStats,
    bookingFunnel,
    earningsAgg,
    followerAgg,
    ratingAgg,
    learnerCount,
    currentFollowerCount,
  ] = await Promise.all([
    // 1. Session stats
    Session.aggregate([
      { $match: { mentorId: new mongoose.Types.ObjectId(mentorId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
          ongoing: { $sum: { $cond: [{ $eq: ["$status", "ongoing"] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
          online: { $sum: { $cond: [{ $eq: ["$sessionType", "online"] }, 1, 0] } },
          offline: { $sum: { $cond: [{ $eq: ["$sessionType", "offline"] }, 1, 0] } },
        },
      },
    ]),

    // 2. Booking stats by status
    Request.aggregate([
      { $match: { mentorId: new mongoose.Types.ObjectId(mentorId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ["$requestStatus", "pending"] }, 1, 0] } },
          accepted: { $sum: { $cond: [{ $eq: ["$requestStatus", "accepted"] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ["$requestStatus", "completed"] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ["$requestStatus", "rejected"] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ["$requestStatus", "cancelled"] }, 1, 0] } },
        },
      },
    ]),

    // 3. Booking funnel (pipeline stages)
    Request.aggregate([
      { $match: { mentorId: new mongoose.Types.ObjectId(mentorId) } },
      {
        $group: {
          _id: null,
          requested: { $sum: 1 },
          accepted: { $sum: { $cond: [{ $in: ["$requestStatus", ["accepted", "completed"]] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ["$requestStatus", "completed"] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ["$requestStatus", "cancelled"] }, 1, 0] } },
        },
      },
    ]),

    // 4. Earnings by month (last 6 months)
    Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(mentorId),
          type: "earning",
          status: "completed",
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          earnings: { $sum: "$amount" },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { month: "$_id", earnings: 1, transactions: 1, _id: 0 } },
    ]),

    // 5. Follower growth by month (last 6 months)
    Follow.aggregate([
      {
        $match: {
          following: new mongoose.Types.ObjectId(mentorId),
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { month: "$_id", count: 1, _id: 0 } },
    ]),

    // 6. Rating stats
    Review.aggregate([
      { $match: { mentorId: new mongoose.Types.ObjectId(mentorId) } },
      {
        $group: {
          _id: null,
          average: { $avg: "$rating" },
          total: { $sum: 1 },
          r1: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
          r2: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
          r3: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
          r4: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
          r5: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
        },
      },
    ]),

    // 7. Unique learners count
    Request.distinct("learnerId", { mentorId }),

    // 8. Current follower count
    User.findById(mentorId).select("followerCount"),
  ]);

  const sessionData = sessionStats[0] || { total: 0, active: 0, ongoing: 0, completed: 0, cancelled: 0, online: 0, offline: 0 };
  const bookingData = bookingStats[0] || { total: 0, pending: 0, accepted: 0, completed: 0, rejected: 0, cancelled: 0 };
  const funnelData = bookingFunnel[0] || { requested: 0, accepted: 0, completed: 0, cancelled: 0 };
  const ratingData = ratingAgg[0] || { average: 0, total: 0, r1: 0, r2: 0, r3: 0, r4: 0, r5: 0 };
  const totalEarnedAgg = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(mentorId), type: "earning", status: "completed" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const newLearnersThisMonth = await Request.distinct("learnerId", {
    mentorId,
    createdAt: {
      $gte: new Date(now.getFullYear(), now.getMonth(), 1),
    },
  });

  res.json({
    success: true,
    data: {
      sessionStats: {
        total: sessionData.total,
        byStatus: {
          active: sessionData.active,
          ongoing: sessionData.ongoing,
          completed: sessionData.completed,
          cancelled: sessionData.cancelled,
        },
        byType: {
          online: sessionData.online,
          offline: sessionData.offline,
        },
      },
      bookingStats: {
        total: bookingData.total,
        byStatus: {
          pending: bookingData.pending,
          accepted: bookingData.accepted,
          completed: bookingData.completed,
          rejected: bookingData.rejected,
          cancelled: bookingData.cancelled,
        },
        funnel: {
          requested: funnelData.requested,
          accepted: funnelData.accepted,
          completed: funnelData.completed,
          cancelled: funnelData.cancelled,
        },
      },
      earnings: {
        totalEarned: totalEarnedAgg[0]?.total || 0,
        monthly: earningsAgg,
      },
      followerGrowth: {
        current: currentFollowerCount?.followerCount || 0,
        monthly: followerAgg,
      },
      ratings: {
        average: Math.round(ratingData.average * 10) / 10,
        total: ratingData.total,
        distribution: {
          "1": ratingData.r1,
          "2": ratingData.r2,
          "3": ratingData.r3,
          "4": ratingData.r4,
          "5": ratingData.r5,
        },
      },
      learners: {
        total: learnerCount.length,
        newThisMonth: newLearnersThisMonth.length,
      },
    },
  });
});
