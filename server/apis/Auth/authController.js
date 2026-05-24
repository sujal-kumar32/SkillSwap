const User = require("../Users/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../../utilities/asyncHandler");

const SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

// REGISTER
exports.register = asyncHandler(async (req, res) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      roles: ["learner"],
      status: "active", // New users are active immediately
    });

    const userData = await User.findById(user._id).select("-password");

    const payload = {
      id: user._id,
      roles: user.roles,
    };
    const token = jwt.sign(payload, SECRET, {
      expiresIn: TOKEN_EXPIRES_IN,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      data: userData,
    });

});

// CHANGE PASSWORD
exports.changePassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const matched = await bcrypt.compare(oldPassword, user.password);
    if (!matched) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });

});

// LOGIN

exports.login = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    
    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is blocked",
      });
    }

    // PAYLOAD
    const payload = {
      id: user._id,
      roles: user.roles,
    };

    const token = jwt.sign(payload, SECRET, {
      expiresIn: TOKEN_EXPIRES_IN,
    });

    res.send({
      success: true,
      message: "Login successful",
      token,
      data: { ...payload, name: user.name },
    });

});
