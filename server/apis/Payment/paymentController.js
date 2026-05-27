const crypto = require("crypto");
const Payment = require("./paymentModel");
const Request = require("../Request/requestModel");
const Session = require("../Session/sessionModel");
const razorpay = require("../../config/razorpay");
const asyncHandler = require("../../utilities/asyncHandler");
const getPagination = require("../../utilities/paginate");

const isAdmin = (req) => req.user?.roles?.includes("admin");
const idsEqual = (left, right) => {
  return left && right && left.toString() === right.toString();
};

// CREATE RAZORPAY ORDER
exports.createOrder = asyncHandler(async (req, res) => {

    const { requestId } = req.body;

    if (!requestId) {
      return res.status(400).json({ success: false, message: "requestId is required" });
    }

    const request = await Request.findById(requestId).populate("sessionId");
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (!idsEqual(request.learnerId, req.user.id)) {
      return res.status(403).json({ success: false, message: "You can only pay for your own bookings" });
    }

    if (request.paymentStatus === "paid") {
      return res.status(400).json({ success: false, message: "This booking is already paid" });
    }

    if (!request.sessionId) {
      return res.status(404).json({ success: false, message: "Associated session not found" });
    }

    const sessionPrice = Number(request.sessionId.price);
    if (isNaN(sessionPrice) || sessionPrice <= 0) {
      return res.status(400).json({ success: false, message: "This session does not require payment" });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ success: false, message: "Razorpay is not configured" });
    }

    const amountInPaisa = Math.round(sessionPrice * 100);
    if (isNaN(amountInPaisa) || amountInPaisa <= 0) {
      return res.status(400).json({ success: false, message: "Invalid payment amount" });
    }

    const options = {
      amount: amountInPaisa,
      currency: "INR",
      receipt: `rcpt_${requestId}_${Date.now()}`.slice(0, 40),
      notes: { requestId: String(requestId) },
    };

    let order;
    try {
      order = await razorpay.orders.create(options);
    } catch (razorpayErr) {
      const razorpayMsg = razorpayErr.error?.description || razorpayErr.message || JSON.stringify(razorpayErr);
      console.error("Razorpay order creation failed:", razorpayMsg);
      console.error("Full error:", JSON.stringify(razorpayErr, Object.getOwnPropertyNames(razorpayErr)));
      return res.status(502).json({ success: false, message: "Payment gateway error: " + razorpayMsg });
    }

    let payment = await Payment.findOne({ requestId, paymentStatus: { $ne: "success" } });
    if (!payment) {
      payment = await Payment.create({
        requestId,
        amount: sessionPrice,
        orderId: order.id,
        paymentStatus: "pending",
        learnerId: req.user.id,
        mentorId: request.mentorId,
        sessionId: request.sessionId._id,
      });
    } else {
      payment.orderId = order.id;
      payment.amount = sessionPrice;
      await payment.save();
    }

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        paymentId: payment._id,
      },
    });

});

// VERIFY RAZORPAY PAYMENT
exports.verifyPayment = asyncHandler(async (req, res) => {

    const { requestId, orderId, razorpayPaymentId, razorpaySignature } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(orderId + "|" + razorpayPaymentId)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (request.paymentStatus === "paid") {
      return res.json({ success: true, message: "Already verified" });
    }

    const payment = await Payment.findOne({ requestId, orderId });
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment record not found" });
    }

    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.paymentStatus = "success";
    payment.transactionId = razorpayPaymentId;
    await payment.save();

    request.paymentStatus = "paid";
    await request.save();

    res.json({
      success: true,
      message: "Payment verified successfully",
      data: payment,
    });

});


// GET ALL PAYMENTS
exports.getPayments = asyncHandler(async (req, res) => {

    const { search, sort } = req.query;
    const { page, limit, skip } = getPagination(req.query);

    let filter = {};

    if (!isAdmin(req)) {
      const requests = await Request.find({
        $or: [{ learnerId: req.user.id }, { mentorId: req.user.id }],
      }).select("_id");

      filter.requestId = { $in: requests.map((request) => request._id) };
    }

    if (search) {
      filter.transactionId = { $regex: search, $options: "i" };
    }

    let sortObj = {};
    if (sort === "latest" || sort === "newest") sortObj = { createdAt: -1 };
    else if (sort === "oldest") sortObj = { createdAt: 1 };
    else sortObj = { createdAt: -1 };

    const [payments, total] = await Promise.all([
      Payment.find(filter).sort(sortObj).skip(skip).limit(limit).populate("requestId").lean(),
      Payment.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: payments,
    });

});

// PROCESS REFUND (called when mentor rejects a paid booking)
exports.processRefund = asyncHandler(async (req, res) => {

    const { requestId, reason } = req.body;

    if (!requestId) {
      return res.status(400).json({ success: false, message: "requestId is required" });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (!idsEqual(request.mentorId, req.user.id)) {
      return res.status(403).json({ success: false, message: "Only the mentor can process refunds" });
    }

    if (request.paymentStatus !== "paid") {
      return res.status(400).json({ success: false, message: "No paid payment to refund" });
    }

    const payment = await Payment.findOne({ requestId, paymentStatus: "success" });
    if (!payment) {
      return res.status(404).json({ success: false, message: "No successful payment found" });
    }

    if (payment.refundStatus === "processed" || payment.refundStatus === "initiated") {
      return res.status(400).json({ success: false, message: "Refund already processed or in progress" });
    }

    if (!payment.razorpayPaymentId) {
      payment.paymentStatus = "refunded";
      payment.refundStatus = "processed";
      payment.refundedAt = new Date();
      await payment.save();
      request.paymentStatus = "refunded";
      await request.save();
      return res.json({ success: true, message: "Payment marked as refunded (no Razorpay ID)" });
    }

    payment.refundStatus = "initiated";
    payment.paymentStatus = "refund_initiated";
    await payment.save();

    let refundResponse;
    try {
      refundResponse = await razorpay.payments.refund(payment.razorpayPaymentId, {
        amount: Math.round(payment.amount * 100),
        notes: { requestId, reason: reason || "Mentor rejected booking" },
      });
    } catch (razorpayErr) {
      const msg = razorpayErr.error?.description || razorpayErr.message || "Refund failed";
      payment.refundStatus = "failed";
      await payment.save();
      return res.status(502).json({ success: false, message: "Refund failed: " + msg });
    }

    payment.refundId = refundResponse.id;
    payment.refundStatus = "processed";
    payment.paymentStatus = "refunded";
    payment.refundedAt = new Date();
    await payment.save();

    request.paymentStatus = "refunded";
    await request.save();

    res.json({
      success: true,
      message: "Refund processed successfully",
      data: { refundId: refundResponse.id, refundStatus: "processed" },
    });

});
