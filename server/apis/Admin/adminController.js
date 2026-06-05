const Notification = require("../Notification/notificationModel");
const Payment = require("../Payment/paymentModel");
const User = require("../Users/userModel");
const BroadcastMessage = require("./broadcastMessageModel");
const asyncHandler = require("../../utilities/asyncHandler");
const getPagination = require("../../utilities/paginate");

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
      .populate("mentorId", "name email profileImage")
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
