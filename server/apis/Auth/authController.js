const User = require("../Users/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const asyncHandler = require("../../utilities/asyncHandler");
const { sendEmail } = require("../../utilities/emailService");
const { welcomeEmail, emailVerification, passwordResetEmail } = require("../../utilities/emailTemplates");

const SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

// REGISTER
exports.register = asyncHandler(async (req, res) => {

    const { name, password } = req.body;
    let email = req.body.email?.toLowerCase().trim();

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
      status: "active",
      isVerified: false,
    });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hash = crypto.createHash("sha256").update(verificationToken).digest("hex");

    user.verificationToken = hash;
    user.verificationTokenExpires = Date.now() + 86400000;
    await user.save();

    const verifyLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/verify-email/${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: "Verify your email - SkillSwap",
      html: emailVerification(user.name, verifyLink),
    });

    res.status(201).json({
      success: true,
      message: "Registration successful! Verification email sent.",
    });

});

// VERIFY EMAIL
exports.verifyEmail = asyncHandler(async (req, res) => {

    const { token } = req.params;

    const hash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      verificationToken: hash,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Verification link is invalid or has expired.",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    sendEmail({
      to: user.email,
      subject: "Welcome to SkillSwap!",
      html: welcomeEmail(user.name),
    }).catch((err) => console.error("Welcome email failed:", err.message));

    res.json({
      success: true,
      message: "Email verified successfully! You can now log in.",
    });

});

// RESEND VERIFICATION
exports.resendVerification = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isVerified !== false) {
      return res.json({ success: true, message: "Your email is already verified." });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hash = crypto.createHash("sha256").update(verificationToken).digest("hex");

    user.verificationToken = hash;
    user.verificationTokenExpires = Date.now() + 86400000;
    await user.save();

    const verifyLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/verify-email/${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: "Verify your email - SkillSwap",
      html: emailVerification(user.name, verifyLink),
    });

    res.json({
      success: true,
      message: "Verification email sent. Please check your inbox.",
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

    const user = await User.findOne({ email: email.toLowerCase().trim() });

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

    if (user.isVerified === false) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
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

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    res.cookie("token", token, cookieOptions);

    res.send({
      success: true,
      message: "Login successful",
      token,
      data: { ...payload, name: user.name },
    });

});

// FORGOT PASSWORD
exports.forgotPassword = asyncHandler(async (req, res) => {

    const email = req.body.email?.toLowerCase().trim();

    const user = await User.findOne({ email });
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

// DELETE ACCOUNT
exports.deleteAccount = asyncHandler(async (req, res) => {

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required to delete your account.",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password.",
      });
    }

    user.name = "Deleted User";
    user.email = `deleted-${user._id}@skillswap.local`;
    user.password = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
    user.profileImage = "";
    user.coverImage = "";
    user.bio = "";
    user.interests = [];
    user.learningGoals = "";
    user.skills = [];
    user.phone = "";
    user.timezone = "UTC";
    user.socialLinks = {};
    user.status = "deleted";
    user.isVerified = false;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Your account has been deleted.",
    });

});

// GET CURRENT USER
exports.getMe = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user.id).select("name email roles profileImage");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        profileImage: user.profileImage,
      },
    });

});

// LOGOUT
exports.logout = asyncHandler(async (req, res) => {

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.json({ success: true, message: "Logged out successfully" });

});
