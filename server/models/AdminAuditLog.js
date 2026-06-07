const mongoose = require("mongoose");

const adminAuditLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      "resolve_dispute",
      "broadcast",
      "block_user",
      "unblock_user",
      "update_user_status",
      "approve_mentor",
      "approve_skill",
      "reject_skill",
      "create_category",
      "update_category",
      "delete_category",
      "force_complete",
      "force_cancel",
      "update_settings",
    ],
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  targetModel: {
    type: String,
    default: null,
  },
  details: {
    type: String,
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  ip: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

adminAuditLogSchema.index({ adminId: 1, createdAt: -1 });
adminAuditLogSchema.index({ action: 1, createdAt: -1 });
adminAuditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AdminAuditLog", adminAuditLogSchema);
