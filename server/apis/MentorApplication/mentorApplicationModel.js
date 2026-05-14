const mongoose = require("mongoose");

const mentorApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    skills: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      default: "",
      trim: true,
    },
    portfolioLink: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "blocked"],
      default: "pending",
    },
    adminRemarks: {
      type: String,
      default: "",
      trim: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("MentorApplication", mentorApplicationSchema);
