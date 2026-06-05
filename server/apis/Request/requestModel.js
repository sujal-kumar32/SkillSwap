const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },

    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    learnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    note: String,

    requestStatus: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    reminderSent: {
      type: [String],
      default: [],
    },

    calendarEventId: {
      type: String,
      default: null,
    },

    startedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

requestSchema.index({ learnerId: 1, createdAt: -1 });
requestSchema.index({ mentorId: 1, createdAt: -1 });
requestSchema.index({ sessionId: 1, requestStatus: 1 });

module.exports = mongoose.model("Request", requestSchema);
