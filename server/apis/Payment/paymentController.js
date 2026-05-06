const Payment = require("./paymentModel");
const Request = require("../Request/requestModel");

const isAdmin = (req) => req.user?.roles?.includes("admin");
const idsEqual = (left, right) => {
  return left && right && left.toString() === right.toString();
};

// CREATE PAYMENT
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
      transactionId: "TXN_" + Date.now(), // mock
      paymentStatus: "success",
    });

    // update request payment status
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
    let filter = {};

    if (!isAdmin(req)) {
      const requests = await Request.find({
        $or: [{ learnerId: req.user.id }, { mentorId: req.user.id }],
      }).select("_id");

      filter.requestId = { $in: requests.map((request) => request._id) };
    }

    const payments = await Payment.find(filter).populate("requestId").lean();

    res.json({
      success: true,
      total: payments.length,
      data: payments,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
