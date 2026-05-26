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
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
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

    if (!["active", "blocked"].includes(status)) {
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
    await user.save();

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

    res.json({
      success: true,
      message: "User unblocked successfully",
      data: user,
    });

});

// APPLY FOR MENTOR
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
