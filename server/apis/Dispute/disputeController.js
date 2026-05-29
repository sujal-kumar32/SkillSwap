const Dispute = require("./disputeModel");
const Request = require("../Request/requestModel");
const Payment = require("../Payment/paymentModel");
const User = require("../Users/userModel");
const asyncHandler = require("../../utilities/asyncHandler");
const { sendNotification } = require("../../services/notificationService");

const idsEqual = (a, b) => a && b && a.toString() === b.toString();

exports.createDispute = asyncHandler(async (req, res) => {
  const { requestId, reason, description } = req.body;

  if (!requestId || !reason || !description?.trim()) {
    return res.status(400).json({ success: false, message: "requestId, reason, and description are required" });
  }

  const request = await Request.findById(requestId);
  if (!request) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }

  const isLearner = idsEqual(request.learnerId, req.user.id);
  const isMentor = idsEqual(request.mentorId, req.user.id);
  if (!isLearner && !isMentor) {
    return res.status(403).json({ success: false, message: "You can only dispute your own bookings" });
  }

  if (request.requestStatus === "pending") {
    return res.status(400).json({ success: false, message: "Cannot dispute a pending booking. Wait for the mentor to respond first." });
  }

  const existingDispute = await Dispute.findOne({ requestId, raisedBy: req.user.id, status: { $in: ["open", "under_review"] } });
  if (existingDispute) {
    return res.status(400).json({ success: false, message: "You already have an active dispute for this booking." });
  }

  const dispute = await Dispute.create({
    requestId,
    raisedBy: req.user.id,
    raisedAgainst: isLearner ? request.mentorId : request.learnerId,
    reason,
    description: description.trim(),
  });

  const populated = await Dispute.findById(dispute._id)
    .populate("raisedBy", "name email profileImage")
    .populate("raisedAgainst", "name email profileImage")
    .lean();

  const admins = await User.find({ roles: "admin" }).select("_id").lean();
  for (const admin of admins) {
    sendNotification(admin._id, req.user.id, "system", `A new dispute has been raised: ${reason.replace(/_/g, " ")}`, `/admin/disputes`).catch(() => {});
  }

  res.status(201).json({ success: true, data: populated });
});

exports.getMyDisputes = asyncHandler(async (req, res) => {
  const disputes = await Dispute.find({ raisedBy: req.user.id })
    .populate("raisedAgainst", "name profileImage")
    .populate({
      path: "requestId",
      select: "sessionId requestStatus paymentStatus",
      populate: { path: "sessionId", select: "title" },
    })
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, data: disputes });
});

exports.getDispute = asyncHandler(async (req, res) => {
  const dispute = await Dispute.findById(req.params.id)
    .populate("raisedBy", "name email profileImage")
    .populate("raisedAgainst", "name email profileImage")
    .populate("resolvedBy", "name")
    .populate({
      path: "requestId",
      populate: [
        { path: "sessionId", select: "title price" },
        { path: "learnerId", select: "name" },
        { path: "mentorId", select: "name" },
      ],
    })
    .lean();

  if (!dispute) {
    return res.status(404).json({ success: false, message: "Dispute not found" });
  }

  const isParticipant = idsEqual(dispute.raisedBy?._id, req.user.id) || idsEqual(dispute.raisedAgainst?._id, req.user.id);
  const isAdmin = req.user?.roles?.includes("admin");
  if (!isParticipant && !isAdmin) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  res.json({ success: true, data: dispute });
});

exports.getAllDisputes = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status && ["open", "under_review", "resolved", "dismissed"].includes(status)) {
    filter.status = status;
  }

  const skip = (Math.max(1, parseInt(page)) - 1) * Math.min(50, Math.max(1, parseInt(limit)));

  const [disputes, total] = await Promise.all([
    Dispute.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Math.min(50, Math.max(1, parseInt(limit))))
      .populate("raisedBy", "name email profileImage")
      .populate("raisedAgainst", "name email profileImage")
      .populate({
        path: "requestId",
        select: "sessionId requestStatus paymentStatus",
        populate: { path: "sessionId", select: "title" },
      })
      .lean(),
    Dispute.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: disputes,
    pagination: {
      page: Math.max(1, parseInt(page)),
      limit: Math.min(50, Math.max(1, parseInt(limit))),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

exports.resolveDispute = asyncHandler(async (req, res) => {
  const { status, resolution, adminNotes } = req.body;

  if (!status || !["resolved", "dismissed"].includes(status)) {
    return res.status(400).json({ success: false, message: "Status must be 'resolved' or 'dismissed'" });
  }

  if (status === "resolved" && !resolution) {
    return res.status(400).json({ success: false, message: "Resolution is required when resolving" });
  }

  const dispute = await Dispute.findById(req.params.id);
  if (!dispute) {
    return res.status(404).json({ success: false, message: "Dispute not found" });
  }

  if (dispute.status === "resolved" || dispute.status === "dismissed") {
    return res.status(400).json({ success: false, message: "Dispute is already closed" });
  }

  dispute.status = status;
  dispute.resolvedBy = req.user.id;
  dispute.resolvedAt = new Date();
  if (adminNotes) dispute.adminNotes = adminNotes.trim();
  if (resolution) dispute.resolution = resolution;

  await dispute.save();

  if (resolution === "refund_approved" || resolution === "refund_partial") {
    const request = await Request.findById(dispute.requestId);
    if (request && request.paymentStatus === "paid") {
      const payment = await Payment.findOne({ requestId: dispute.requestId, paymentStatus: "success" });
      if (payment) {
        payment.paymentStatus = "refunded";
        payment.refundStatus = "processed";
        payment.refundedAt = new Date();
        payment.refundId = payment.refundId || `admin_${Date.now()}`;
        await payment.save();

        request.paymentStatus = "refunded";
        await request.save();
      }
    }
  }

  const populated = await Dispute.findById(dispute._id)
    .populate("raisedBy", "name email profileImage")
    .populate("raisedAgainst", "name email profileImage")
    .populate("resolvedBy", "name")
    .lean();

  res.json({ success: true, data: populated });
});
