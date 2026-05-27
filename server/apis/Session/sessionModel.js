const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
    },

    date: Date,
    time: String,
    duration: Number, 
    maxLearners: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      default: 0,
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    sessionType: {
      type: String,
      enum: ["online", "offline"],
      default: "online",
    },

    meetLink: String,

    thumbnail: { type: String },
    thumbnailPublicId: { type: String, default: "" },

    status: {
      type: String,
      enum: ["active", "ongoing", "completed", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Session", sessionSchema);
