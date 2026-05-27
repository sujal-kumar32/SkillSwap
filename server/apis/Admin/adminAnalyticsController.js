const User = require("../Users/userModel");
const Payment = require("../Payment/paymentModel");
const Request = require("../Request/requestModel");
const Session = require("../Session/sessionModel");
const Skill = require("../Skills/skillModel");
const MentorApplication = require("../MentorApplication/mentorApplicationModel");
const asyncHandler = require("../../utilities/asyncHandler");

const getPeriodFilter = (period) => {
  const now = Date.now();
  switch (period) {
    case "7d": return { $gte: new Date(now - 7 * 86400000) };
    case "30d": return { $gte: new Date(now - 30 * 86400000) };
    case "all": return {};
    default: return { $gte: new Date(now - 180 * 86400000) };
  }
};

const getPreviousPeriod = (period) => {
  const now = Date.now();
  const ms = period === "7d" ? 7 * 86400000
    : period === "30d" ? 30 * 86400000
    : 180 * 86400000;
  return { start: new Date(now - 2 * ms), end: new Date(now - ms) };
};

exports.getAnalytics = asyncHandler(async (req, res) => {
  const period = req.query.period || "6mo";
  const filter = getPeriodFilter(period);
  const prev = getPreviousPeriod(period);

  const now = new Date();
  const chartStart = new Date();
  chartStart.setMonth(chartStart.getMonth() - 6);

  const chartFilter = period === "all" ? {} : { $gte: chartStart };

  const [
    userRegistrations,
    revenueData,
    popularSkills,
    completionData,
    summary,
    topMentors,
    funnel,
    prevSummary,
    pendingApps,
  ] = await Promise.all([
    // Users chart (always last 6 months)
    User.aggregate([
      { $match: { createdAt: { $gte: chartStart } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),

    // Revenue chart
    Payment.aggregate([
      { $match: { paymentStatus: "success", createdAt: { $gte: chartStart } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, revenue: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),

    // Popular skills
    Request.aggregate([
      { $match: { requestStatus: { $ne: "pending" } } },
      { $group: { _id: "$sessionId", bookings: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ["$requestStatus", "completed"] }, 1, 0] } } } },
      { $sort: { bookings: -1 } },
      { $limit: 10 },
      { $lookup: { from: "sessions", localField: "_id", foreignField: "_id", as: "session" } },
      { $unwind: "$session" },
      { $project: { _id: 0, title: "$session.title", bookings: 1, completed: 1 } },
    ]),

    // Overall completion
    Request.aggregate([
      { $group: { _id: null, total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ["$requestStatus", "completed"] }, 1, 0] } }, accepted: { $sum: { $cond: [{ $eq: ["$requestStatus", "accepted"] }, 1, 0] } }, pending: { $sum: { $cond: [{ $eq: ["$requestStatus", "pending"] }, 1, 0] } }, cancelled: { $sum: { $cond: [{ $eq: ["$requestStatus", "cancelled"] }, 1, 0] } } } },
    ]),

    // Summary counts
    Promise.all([
      User.countDocuments({ roles: "learner", status: "active" }),
      User.countDocuments({ roles: "mentor", status: "active" }),
      filter.$gte
        ? User.aggregate([
            { $match: { createdAt: { $gte: filter.$gte } } },
            { $count: "count" },
          ]).then((r) => r[0]?.count || 0)
        : User.countDocuments({}),
      filter.$gte
        ? User.aggregate([
            { $match: { createdAt: { $gte: filter.$gte }, roles: "learner" } },
            { $count: "count" },
          ]).then((r) => r[0]?.count || 0)
        : 0,
      filter.$gte
        ? User.aggregate([
            { $match: { createdAt: { $gte: filter.$gte }, roles: "mentor" } },
            { $count: "count" },
          ]).then((r) => r[0]?.count || 0)
        : 0,
      Session.countDocuments({ status: "active" }),
      Skill.countDocuments({ status: "approved", isDeleted: { $ne: true } }),
      Payment.aggregate([
        { $match: { paymentStatus: "success", ...(filter.$gte ? { createdAt: { $gte: filter.$gte } } : {}) } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
    ]),

    // Top mentors (by completed sessions)
    Request.aggregate([
      { $match: { requestStatus: "completed", ...(filter.$gte ? { createdAt: filter } : {}) } },
      { $group: { _id: "$mentorId", completed: { $sum: 1 } } },
      { $sort: { completed: -1 } },
      { $limit: 5 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "mentor" } },
      { $unwind: "$mentor" },
      { $project: { _id: 0, name: "$mentor.name", email: "$mentor.email", profileImage: "$mentor.profileImage", completed: 1 } },
    ]),

    // Booking funnel for current period
    Request.aggregate([
      { $match: { createdAt: { $gte: filter.$gte || new Date(0) } } },
      { $group: { _id: null, requested: { $sum: 1 }, accepted: { $sum: { $cond: [{ $eq: ["$requestStatus", "accepted"] }, 1, 0] } }, completed: { $sum: { $cond: [{ $eq: ["$requestStatus", "completed"] }, 1, 0] } }, cancelled: { $sum: { $cond: [{ $eq: ["$requestStatus", "cancelled"] }, 1, 0] } } } },
    ]),

    // Previous period summary for % change
    (filter.$gte ? Promise.all([
      User.countDocuments({ createdAt: { $gte: prev.start, $lt: prev.end } }),
      Request.aggregate([
        { $match: { createdAt: { $gte: prev.start, $lt: prev.end }, requestStatus: "completed" } },
        { $count: "count" },
      ]),
      Payment.aggregate([
        { $match: { createdAt: { $gte: prev.start, $lt: prev.end }, paymentStatus: "success" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]) : Promise.resolve([0, [{ count: 0 }], [{ total: 0 }]])),

    // Pending mentor applications
    MentorApplication.countDocuments({ status: "pending" }),
  ]);

  const [totalLearners, totalMentors, newUsers, newLearners, newMentors, activeSessions, approvedSkills, revenueAgg] = summary;
  const periodRevenue = revenueAgg[0]?.total || 0;

  const [prevUsers, prevCompleted, prevRevenue] = prevSummary;
  const prevCompletedCount = prevCompleted[0]?.count || 0;
  const prevRevenueTotal = prevRevenue[0]?.total || 0;

  const funnelData = funnel[0] || { requested: 0, accepted: 0, completed: 0, cancelled: 0 };
  const currentCompleted = funnelData.completed;

  const completion = completionData[0] || {};
  const completionRate = completion.total ? Math.round((completion.completed / completion.total) * 100) : 0;

  // Build month labels
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(d.toISOString().slice(0, 7));
  }

  const usersChart = months.map((m) => ({
    month: m,
    users: userRegistrations.find((r) => r._id === m)?.count || 0,
  }));

  const revenueChart = months.map((m) => ({
    month: m,
    revenue: revenueData.find((r) => r._id === m)?.revenue || 0,
    transactions: revenueData.find((r) => r._id === m)?.count || 0,
  }));

  const calcChange = (curr, prev) => {
    if (!prev) return { pct: 0, up: true };
    const pct = Math.round(((curr - prev) / prev) * 100);
    return { pct: Math.abs(pct), up: pct >= 0 };
  };

  res.json({
    success: true,
    data: {
      period,
      summary: {
        totalLearners, totalMentors, activeSessions, approvedSkills,
        newUsers, newLearners, newMentors,
        totalRequests: completion.total || 0,
        completedRequests: completion.completed || 0,
        completionRate,
        periodRevenue,
        periodTransactions: revenueAgg[0]?.count || 0,
        pendingApplications: pendingApps,
      },
      changes: {
        users: calcChange(newUsers, prevUsers),
        completed: calcChange(currentCompleted, prevCompletedCount),
        revenue: calcChange(periodRevenue, prevRevenueTotal),
      },
      funnel: {
        requested: funnelData.requested,
        accepted: funnelData.accepted,
        completed: funnelData.completed,
        cancelled: funnelData.cancelled,
      },
      usersChart,
      revenueChart,
      popularSkills,
      topMentors,
    },
  });
});
