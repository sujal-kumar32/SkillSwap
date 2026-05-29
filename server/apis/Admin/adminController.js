const Notification = require("../Notification/notificationModel");
const Payment = require("../Payment/paymentModel");
const User = require("../Users/userModel");
const asyncHandler = require("../../utilities/asyncHandler");

exports.broadcastNotification = asyncHandler(async (req, res) => {
  const { message, role } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ success: false, message: "Message is required" });
  }

  const filter = role && ["learner", "mentor", "admin"].includes(role)
    ? { roles: role, status: "active" }
    : { status: "active" };

  const users = await User.find(filter).select("_id").lean();
  if (!users.length) {
    return res.status(404).json({ success: false, message: "No users found" });
  }

  const notifications = users.map((u) => ({
    recipient: u._id,
    type: "system",
    message: message.trim(),
    link: req.body.link || "",
    read: false,
  }));

  await Notification.insertMany(notifications);

  if (req.app.get("io")) {
    const io = req.app.get("io");
    for (const user of users) {
      io.to(`user:${user._id}`).emit("notification", {
        type: "system",
        message: message.trim(),
        link: req.body.link || "",
        read: false,
        createdAt: new Date(),
        actor: null,
      });
      const count = await Notification.countDocuments({ recipient: user._id, read: false });
      io.to(`user:${user._id}`).emit("unread_count", count);
    }
  }

  res.json({
    success: true,
    message: `Notification sent to ${users.length} users`,
    data: { recipients: users.length },
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
