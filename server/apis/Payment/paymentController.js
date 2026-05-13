const crypto = require("crypto");
const Payment = require("./paymentModel");
const Request = require("../Request/requestModel");
const Session = require("../Session/sessionModel");
const razorpay = require("../../config/razorpay");

const isAdmin = (req) => req.user?.roles?.includes("admin");
const idsEqual = (left, right) => {
  return left && right && left.toString() === right.toString();
};

// CREATE RAZORPAY ORDER
exports.createOrder = async (req, res) => {
  try {
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

    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.startsWith("rzp_test_Your")) {
      return res.status(500).json({ success: false, message: "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env" });
    }

    const options = {
      amount: Math.round(sessionPrice * 100),
      currency: "INR",
      receipt: `receipt_${requestId}_${Date.now()}`,
    };

    let order;
    try {
      order = await razorpay.orders.create(options);
    } catch (razorpayErr) {
      console.error("Razorpay order creation failed:", razorpayErr.message);
      return res.status(502).json({ success: false, message: "Payment gateway error: " + razorpayErr.message });
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
  } catch (err) {
    console.error("createOrder unexpected error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to create payment order" });
  }
};

// VERIFY RAZORPAY PAYMENT
exports.verifyPayment = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CREATE PAYMENT (legacy mock - keep for backward compatibility)
exports.createPayment = async (req, res) => {
  try {
    const { requestId, paymentMethod } = req.body;

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: "requestId is required",
      });
    }

    const request = await Request.findById(requestId).populate("sessionId");
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (!isAdmin(req) && !idsEqual(request.learnerId, req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "You can only pay for your own requests",
      });
    }

    if (request.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "This request is already paid",
      });
    }

    const amount = Number(request.sessionId?.price) || 0;

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "This session does not require payment",
      });
    }

    const payment = await Payment.create({
      requestId,
      amount,
      paymentMethod,
      transactionId: "TXN_" + Date.now(),
      paymentStatus: "success",
    });

    request.paymentStatus = "paid";
    await request.save();

    res.status(201).json({
      success: true,
      message: "Payment successful",
      data: payment,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// GET ALL PAYMENTS
exports.getPayments = async (req, res) => {
  try {
    const { search, sort } = req.query;
    const limit = req.query.limit ? Math.min(100, Math.max(1, parseInt(req.query.limit))) : 100000;
    const page = req.query.page ? Math.max(1, parseInt(req.query.page)) : 1;
    const skip = (page - 1) * limit;

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
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
