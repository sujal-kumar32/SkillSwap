const AdminAuditLog = require("../models/AdminAuditLog");

exports.logAdminAction = async (adminId, action, options = {}) => {
  const { targetId, targetModel, details, metadata, req } = options;
  try {
    await AdminAuditLog.create({
      adminId,
      action,
      targetId: targetId || null,
      targetModel: targetModel || null,
      details: details || action,
      metadata: metadata || {},
      ip: req?.ip || req?.connection?.remoteAddress || null,
    });
  } catch (err) {
    console.error("Audit log failed:", err.message);
  }
};
