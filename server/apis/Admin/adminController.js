const mongoose = require("mongoose");
const Notification = require("../Notification/notificationModel");
const Payment = require("../Payment/paymentModel");
const User = require("../Users/userModel");
const Request = require("../Request/requestModel");
const Wallet = require("../Wallet/walletModel");
const Transaction = require("../Wallet/transactionModel");
const BroadcastMessage = require("./broadcastMessageModel");
const asyncHandler = require("../../utilities/asyncHandler");
const getPagination = require("../../utilities/paginate");
const { releaseCredits, transferCredits } = require("../../services/creditService");
const { recalculateTrustScore } = require("../../services/trustService");

exports.broadcastNotification = asyncHandler(async (req, res) => {
  const { message, targetType, targetRole, targetUserId, link } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ success: false, message: "Message is required" });
  }

  const type = targetType || "all";
  let users = [];

  if (type === "single" && targetUserId) {
    const user = await User.findOne({ _id: targetUserId, status: "active" }).select("_id").lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found or inactive" });
    }
    users = [user];
  } else if (type === "role" && targetRole) {
    users = await User.find({ roles: targetRole, status: "active" }).select("_id").lean();
  } else {
    users = await User.find({ status: "active" }).select("_id").lean();
  }

  if (!users.length) {
    return res.status(404).json({ success: false, message: "No users found" });
  }

  const adminUser = await User.findById(req.user.id).select("name profileImage").lean();

  const broadcastMsg = await BroadcastMessage.create({
    senderId: req.user.id,
    message: message.trim(),
    targetType: type,
    targetRole: type === "role" ? targetRole : "",
    targetUserId: type === "single" ? targetUserId : null,
    link: link || "",
    recipientCount: users.length,
  });

  const notifications = users.map((u) => ({
    recipient: u._id,
    actor: req.user.id,
    type: "system",
    message: message.trim(),
    link: link || "",
    read: false,
    broadcastRef: broadcastMsg._id,
  }));

  await Notification.insertMany(notifications);

  if (req.app.get("io")) {
    const io = req.app.get("io");
    const actorData = adminUser ? { name: adminUser.name, profileImage: adminUser.profileImage } : null;
    for (const user of users) {
      io.to(`user:${user._id}`).emit("notification", {
        type: "system",
        message: message.trim(),
        link: link || "",
        read: false,
        createdAt: new Date(),
        actor: actorData,
      });
      const count = await Notification.countDocuments({ recipient: user._id, read: false });
      io.to(`user:${user._id}`).emit("unread_count", count);
    }
  }

  res.json({
    success: true,
    message: `Notification sent to ${users.length} user${users.length > 1 ? "s" : ""}`,
    data: { recipients: users.length },
  });
});

exports.getBroadcasts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const [broadcasts, total] = await Promise.all([
    BroadcastMessage.find({ senderId: req.user.id })
      .populate("senderId", "name")
      .populate("targetUserId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    BroadcastMessage.countDocuments({ senderId: req.user.id }),
  ]);

  res.json({
    success: true,
    data: broadcasts,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
});

exports.deleteBroadcast = asyncHandler(async (req, res) => {
  const broadcast = await BroadcastMessage.findOneAndDelete({
    _id: req.params.id,
    senderId: req.user.id,
  });

  if (!broadcast) {
    return res.status(404).json({ success: false, message: "Broadcast not found" });
  }

  await Notification.deleteMany({ broadcastRef: req.params.id });

  res.json({ success: true, message: "Broadcast deleted" });
});

exports.updateBroadcast = asyncHandler(async (req, res) => {
  const { message, link, targetType, targetRole, targetUserId } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ success: false, message: "Message is required" });
  }

  const broadcast = await BroadcastMessage.findOne({
    _id: req.params.id,
    senderId: req.user.id,
  });

  if (!broadcast) {
    return res.status(404).json({ success: false, message: "Broadcast not found" });
  }

  await Notification.deleteMany({ broadcastRef: req.params.id });

  const type = targetType || broadcast.targetType;
  let users = [];

  if (type === "single" && (targetUserId || broadcast.targetUserId)) {
    const uid = targetUserId || broadcast.targetUserId;
    const user = await User.findOne({ _id: uid, status: "active" }).select("_id").lean();
    if (user) users = [user];
  } else if (type === "role" && (targetRole || broadcast.targetRole)) {
    const role = targetRole || broadcast.targetRole;
    users = await User.find({ roles: role, status: "active" }).select("_id").lean();
  } else {
    users = await User.find({ status: "active" }).select("_id").lean();
  }

  const adminUser = await User.findById(req.user.id).select("name profileImage").lean();

  broadcast.message = message.trim();
  broadcast.link = link || "";
  broadcast.targetType = type;
  broadcast.targetRole = type === "role" ? (targetRole || broadcast.targetRole) : "";
  broadcast.targetUserId = type === "single" ? (targetUserId || broadcast.targetUserId) : null;
  broadcast.recipientCount = users.length;
  await broadcast.save();

  if (users.length > 0) {
    const notifications = users.map((u) => ({
      recipient: u._id,
      actor: req.user.id,
      type: "system",
      message: message.trim(),
      link: link || "",
      read: false,
      broadcastRef: broadcast._id,
    }));

    await Notification.insertMany(notifications);

    if (req.app.get("io")) {
      const io = req.app.get("io");
      const actorData = adminUser ? { name: adminUser.name, profileImage: adminUser.profileImage } : null;
      for (const user of users) {
        io.to(`user:${user._id}`).emit("notification", {
          type: "system",
          message: message.trim(),
          link: link || "",
          read: false,
          createdAt: new Date(),
          actor: actorData,
        });
        const count = await Notification.countDocuments({ recipient: user._id, read: false });
        io.to(`user:${user._id}`).emit("unread_count", count);
      }
    }
  }

  const updated = await BroadcastMessage.findById(broadcast._id)
    .populate("senderId", "name")
    .populate("targetUserId", "name email")
    .lean();

  res.json({
    success: true,
    message: `Broadcast updated and re-sent to ${users.length} user${users.length !== 1 ? "s" : ""}`,
    data: updated,
  });
});

exports.getPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const skip = (Math.max(1, parseInt(page)) - 1) * Math.min(50, Math.max(1, parseInt(limit)));

  const filter = {};
  if (status && ["success", "pending", "failed", "refunded", "refund_initiated"].includes(status)) {
    filter.paymentStatus = status;
  }
  if (search) {
    filter.$or = [
      { transactionId: { $regex: search, $options: "i" } },
      { orderId: { $regex: search, $options: "i" } },
    ];
  }

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Math.min(50, Math.max(1, parseInt(limit))))
      .populate("learnerId", "name email profileImage")
      .populate("mentorId", "name email profileImage trustScore")
      .populate("sessionId", "title")
      .populate({
        path: "requestId",
        select: "requestStatus",
      })
      .lean(),
    Payment.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: payments,
    pagination: {
      page: Math.max(1, parseInt(page)),
      limit: Math.min(50, Math.max(1, parseInt(limit))),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// RESOLVE DISPUTE
exports.resolveDispute = asyncHandler(async (req, res) => {
  const { action } = req.body;
  if (!["release", "refund"].includes(action)) {
    return res.status(400).json({ success: false, message: "Action must be 'release' or 'refund'" });
  }

  const request = await Request.findById(req.params.id);
  if (!request) {
    return res.status(404).json({ success: false, message: "Request not found" });
  }

  if (request.requestStatus !== "disputed") {
    return res.status(400).json({ success: false, message: "Request is not in disputed status" });
  }

  const mongoSession = await mongoose.startSession();
  try {
    mongoSession.startTransaction();

    if (action === "release") {
      await transferCredits(request.learnerId, request.mentorId, request.creditsLocked, request._id, mongoSession);
      request.requestStatus = "completed";
    } else {
      const learnerWallet = await Wallet.findOne({ userId: request.learnerId }).session(mongoSession);
      await releaseCredits(request.learnerId, request.creditsLocked, mongoSession);
      await Transaction.create([{
        walletId: learnerWallet._id,
        userId: request.learnerId,
        type: "credit_refunded",
        amount: request.creditsLocked,
        balanceBefore: learnerWallet.skillCredits,
        balanceAfter: learnerWallet.skillCredits,
        reference: String(request._id),
        referenceModel: "Request",
        referenceType: "request",
        description: "Credits refunded via dispute resolution",
        status: "completed",
      }], { session: mongoSession });
      request.requestStatus = "cancelled";
    }

    request.creditsLocked = 0;
    await request.save({ session: mongoSession });
    await mongoSession.commitTransaction();

    Promise.all([
      recalculateTrustScore(request.learnerId),
      recalculateTrustScore(request.mentorId),
    ]).catch((err) => console.error("Trust score update failed:", err.message));

    res.json({ success: true, message: `Dispute resolved — credits ${action === "release" ? "released to mentor" : "refunded to learner"}`, data: request });
  } catch (err) {
    await mongoSession.abortTransaction();
    console.error("Dispute resolution failed:", err.message);
    res.status(500).json({ success: false, message: "Dispute resolution failed" });
  } finally {
    mongoSession.endSession();
  }
});

// BOOKING ANALYTICS
exports.bookingAnalytics = asyncHandler(async (req, res) => {
  const [aggregation, walletAgg] = await Promise.all([
    Request.aggregate([
      {
        $group: {
          _id: "$bookingSource",
          count: { $sum: 1 },
          completedCount: { $sum: { $cond: [{ $eq: ["$requestStatus", "completed"] }, 1, 0] } },
        },
      },
    ]),
    Wallet.aggregate([
      {
        $group: {
          _id: null,
          totalSkillCredits: { $sum: "$skillCredits" },
          totalLockedCredits: { $sum: "$lockedCredits" },
        },
      },
    ]),
  ]);

  const paidStats = aggregation.find((a) => a._id === "paid") || { count: 0, completedCount: 0 };
  const creditStats = aggregation.find((a) => a._id === "credits") || { count: 0, completedCount: 0 };
  const walletStats = walletAgg[0] || { totalSkillCredits: 0, totalLockedCredits: 0 };

  res.json({
    success: true,
    data: {
      paidSessions: paidStats.count,
      paidCompleted: paidStats.completedCount,
      creditSessions: creditStats.count,
      creditCompleted: creditStats.completedCount,
      totalSkillCredits: walletStats.totalSkillCredits,
      totalLockedCredits: walletStats.totalLockedCredits,
    },
  });
});

// GET ALL CREDIT BALANCES
exports.getCreditBalances = asyncHandler(async (req, res) => {
  const { search, sort } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  let nameFilter = {};
  if (search) {
    const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    nameFilter = { "user.name": { $regex: safe, $options: "i" } };
  }

  let sortStage = {};
  if (sort === "available") sortStage = { available: -1 };
  else if (sort === "locked") sortStage = { lockedCredits: -1 };
  else if (sort === "total") sortStage = { skillCredits: -1 };
  else sortStage = { "user.name": 1 };

  const pipeline = [
    {
      $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" },
    },
    { $unwind: "$user" },
    { $match: nameFilter },
    {
      $project: {
        _id: 1,
        userId: "$user._id",
        name: "$user.name",
        email: "$user.email",
        profileImage: "$user.profileImage",
        skillCredits: 1,
        lockedCredits: 1,
        available: { $subtract: ["$skillCredits", "$lockedCredits"] },
      },
    },
    { $sort: sortStage },
    { $skip: skip },
    { $limit: limit },
  ];

  const [wallets, total] = await Promise.all([
    Wallet.aggregate(pipeline),
    Wallet.aggregate([...pipeline, { $count: "total" }]),
  ]);

  res.json({
    success: true,
    total: total[0]?.total || 0,
    page,
    pages: Math.ceil((total[0]?.total || 0) / limit),
    data: wallets,
  });
});

// GET ALL CREDIT TRANSACTIONS
exports.getCreditHistory = asyncHandler(async (req, res) => {
  const { search, type } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  let filter = { type: { $in: ["credit_earned", "credit_spent", "credit_refunded"] } };
  if (type) filter.type = type;
  if (search) {
    filter.$or = [
      { description: { $regex: search, $options: "i" } },
      { reference: { $regex: search, $options: "i" } },
    ];
  }

  const [txns, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email profileImage")
      .lean(),
    Transaction.countDocuments(filter),
  ]);

  res.json({ success: true, total, page, pages: Math.ceil(total / limit), data: txns });
});
