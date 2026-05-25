const User = require("../Users/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const asyncHandler = require("../../utilities/asyncHandler");
const { sendEmail } = require("../../utilities/emailService");
const { welcomeEmail, passwordResetEmail } = require("../../utilities/emailTemplates");

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

    sendEmail({
      to: user.email,
      subject: "Welcome to SkillSwap!",
      html: welcomeEmail(user.name),
    }).catch((err) => console.error("Welcome email failed:", err.message));

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

// FORGOT PASSWORD
exports.forgotPassword = asyncHandler(async (req, res) => {

    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.json({
        success: true,
        message: "If that email exists, a reset link has been sent.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const hash = crypto.createHash("sha256").update(token).digest("hex");

    user.resetPasswordToken = hash;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${token}`;

    sendEmail({
      to: user.email,
      subject: "Password Reset - SkillSwap",
      html: passwordResetEmail(user.name, resetLink),
    }).catch((err) => console.error("Reset email failed:", err.message));

    res.json({
      success: true,
      message: "If that email exists, a reset link has been sent.",
    });

});

// RESET PASSWORD
exports.resetPassword = asyncHandler(async (req, res) => {

    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required.",
      });
    }

    const hash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hash,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token is invalid or has expired.",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successful. You can now log in.",
    });

});
