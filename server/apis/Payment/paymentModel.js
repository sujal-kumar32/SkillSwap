const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["razorpay", "stripe", "upi", "card"],
      default: "razorpay",
    },

    transactionId: String,
    orderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,

    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed", "refunded", "refund_initiated"],
      default: "pending",
    },

    refundId: String,
    refundStatus: {
      type: String,
      enum: ["none", "initiated", "processed", "failed"],
      default: "none",
    },
    refundedAt: Date,

    learnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
    },
  },
  { timestamps: true },
);

paymentSchema.index({ requestId: 1, paymentStatus: 1 });
paymentSchema.index({ orderId: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
