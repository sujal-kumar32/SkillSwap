const AdminAuditLog = require("../../models/AdminAuditLog");
const User = require("./userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../../utilities/asyncHandler");
const getPagination = require("../../utilities/paginate");

const SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// GET ALL USERS (EXCEPT ADMIN)
exports.getAllUsers = asyncHandler(async (req, res) => {

    const { search, sort, status, role } = req.query;
    const { page, limit, skip } = getPagination(req.query);

    let filter = { roles: { $ne: "admin" } };

    if (status) {
      filter.status = status;
    }

    if (role) {
      filter.roles = role;
    }

    if (search) {
      const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: safe, $options: "i" } },
        { email: { $regex: safe, $options: "i" } },
      ];
    }

    let sortObj = {};
    if (sort === "latest" || sort === "newest") sortObj = { createdAt: -1 };
    else if (sort === "oldest") sortObj = { createdAt: 1 };
    else if (sort === "name") sortObj = { name: 1 };
    else sortObj = { createdAt: -1 };

    const [users, total] = await Promise.all([
      User.find(filter).sort(sortObj).skip(skip).limit(limit).select("-password"),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users,
    });

});

// UPDATE USER STATUS
exports.updateUserStatus = asyncHandler(async (req, res) => {

    const { userId } = req.params;
    const { status } = req.body;

    if (!["active", "blocked", "deleted"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.status === "deleted") {
      return res.status(400).json({
        success: false,
        message: "Cannot modify a deleted account.",
      });
    }

    user.status = status;
    if (status === "deleted") user.deletedBy = "admin";
    await user.save();

    await AdminAuditLog.create({
      adminId: req.user.id,
      action: "update_user_status",
      targetModel: "User",
      targetId: user._id,
      details: `User status changed to ${status}`,
      metadata: { previousStatus: user.status, newStatus: status },
      ip: req.ip || req.connection?.remoteAddress,
    });

    res.json({
      success: true,
      message: `User status updated to ${status}`,
      data: user,
    });

});

// APPROVE USER
exports.approveUser = asyncHandler(async (req, res) => {

    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.roles.includes("mentor")) {
      user.roles.push("mentor");
    }

    user.status = "active";
    await user.save();
    const approvedUser = user.toObject();
    delete approvedUser.password;

    await AdminAuditLog.create({
      adminId: req.user.id,
      action: "approve_mentor",
      targetModel: "User",
      targetId: user._id,
      details: `Mentor approved (${user.name})`,
      ip: req.ip || req.connection?.remoteAddress,
    });

    res.json({
      success: true,
      message: "Mentor approved successfully",
      data: approvedUser,
    });

});

// BLOCK USER
exports.blockUser = asyncHandler(async (req, res) => {

    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { status: "blocked" },
      { returnDocument: "after" },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await AdminAuditLog.create({
      adminId: req.user.id,
      action: "block_user",
      targetModel: "User",
      targetId: user._id,
      details: `User blocked (${user.name})`,
      ip: req.ip || req.connection?.remoteAddress,
    });

    res.json({
      success: true,
      message: "User blocked successfully",
      data: user,
    });

});

// UNBLOCK USER
exports.unblockUser = asyncHandler(async (req, res) => {

    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { status: "active" },
      { returnDocument: "after" },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await AdminAuditLog.create({
      adminId: req.user.id,
      action: "unblock_user",
      targetModel: "User",
      targetId: user._id,
      details: `User unblocked (${user.name})`,
      ip: req.ip || req.connection?.remoteAddress,
    });

    res.json({
      success: true,
      message: "User unblocked successfully",
      data: user,
    });

});

// BLOCK A USER (user-to-user)
exports.blockInteraction = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (userId === req.user.id) {
    return res.status(400).json({ success: false, message: "Cannot block yourself" });
  }
  const target = await User.findById(userId).select("_id");
  if (!target) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  await User.findByIdAndUpdate(req.user.id, { $addToSet: { blockedUsers: userId } });
  res.json({ success: true, message: "User blocked" });
});

// UNBLOCK A USER (user-to-user)
exports.unblockInteraction = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  await User.findByIdAndUpdate(req.user.id, { $pull: { blockedUsers: userId } });
  res.json({ success: true, message: "User unblocked" });
});

// GET BLOCKED USERS
exports.getBlockedUsers = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("blockedUsers").populate("blockedUsers", "name profileImage").lean();
  res.json({ success: true, data: user.blockedUsers || [] });
});

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// SEARCH USERS (for compose)
exports.searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q?.trim()) {
    return res.json({ success: true, data: [] });
  }
  const users = await User.find({
    _id: { $ne: req.user.id },
    $or: [
      { name: { $regex: escapeRegex(q.trim()), $options: "i" } },
      { email: { $regex: escapeRegex(q.trim()), $options: "i" } },
    ],
  })
    .select("name email profileImage")
    .limit(20)
    .lean();
  res.json({ success: true, data: users });
});

// GET PUBLIC PROFILE
exports.getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId)
    .select("name email profileImage bio roles skills trustScore totalCompletedSessions totalCancelledSessions totalBookings followerCount followingCount isOnline lastActive")
    .lean();
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  res.json({ success: true, data: user });
});

// APPLY FOR MENTOR
exports.getPresence = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select("isOnline lastActive");
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  res.json({ success: true, data: { isOnline: user.isOnline, lastActive: user.lastActive } });
});

exports.applyForMentor = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user.id);

    if (user.roles.includes("mentor")) {
      return res.json({
        success: false,
        message: "Already a mentor",
      });
    }

    user.roles.push("mentor");
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        roles: user.roles,
      },
      SECRET,
      { expiresIn: TOKEN_EXPIRES_IN },
    );

    res.json({
      success: true,
      message: "You are now a mentor.",
      token,
      data: {
        id: user._id,
        roles: user.roles,
      },
    });

});
