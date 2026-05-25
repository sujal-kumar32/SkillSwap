const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
    },

    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    learnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    session: String,
    mentor: String,
    learner: String,

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    comment: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Review", reviewSchema);
