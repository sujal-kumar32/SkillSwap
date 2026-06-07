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
      enum: ["pending", "accepted", "rejected", "completed", "cancelled", "disputed"],
      default: "pending",
    },

    bookingSource: {
      type: String,
      enum: ["paid", "credits"],
      default: "paid",
    },

    creditsLocked: {
      type: Number,
      default: 0,
    },

    mentorTrustAtBooking: {
      type: Number,
      default: 100,
    },

    mentorRatingAtBooking: {
      type: Number,
      default: 0,
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

    endedAt: {
      type: Date,
      default: null,
    },

    learnerJoined: {
      type: Boolean,
      default: false,
    },

    joinedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

requestSchema.pre("save", function (next) {
  if (this.isModified("requestStatus") && ["completed", "cancelled", "rejected", "disputed"].includes(this.requestStatus)) {
    this.endedAt = new Date();
  }
  next();
});

requestSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  const status = update?.requestStatus || update?.$set?.requestStatus;
  if (status && ["completed", "cancelled", "rejected", "disputed"].includes(status)) {
    this.set({ endedAt: new Date() });
  }
  next();
});

requestSchema.index({ learnerId: 1, createdAt: -1 });
requestSchema.index({ mentorId: 1, createdAt: -1 });
requestSchema.index({ sessionId: 1, requestStatus: 1 });

module.exports = mongoose.model("Request", requestSchema);
