const mongoose = require("mongoose");

const broadcastMessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  targetType: {
    type: String,
    enum: ["all", "role", "single"],
    default: "all",
  },
  targetRole: {
    type: String,
    enum: ["", "learner", "mentor"],
    default: "",
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  link: {
    type: String,
    default: "",
  },
  recipientCount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

broadcastMessageSchema.index({ senderId: 1, createdAt: -1 });

module.exports = mongoose.model("BroadcastMessage", broadcastMessageSchema);
