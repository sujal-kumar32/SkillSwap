const User = require("../Users/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const asyncHandler = require("../../utilities/asyncHandler");
const { sendEmail } = require("../../utilities/emailService");
const { welcomeEmail, emailVerification, passwordResetEmail } = require("../../utilities/emailTemplates");
const RefreshToken = require("../../models/RefreshToken");

const SECRET = process.env.JWT_SECRET;
const ACCESS_EXPIRES = "15m";
const REFRESH_EXPIRES_DAYS = 7;

const generateAccessToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: ACCESS_EXPIRES, algorithm: "HS256" });
};

const generateRefreshToken = async (userId) => {
  const token = crypto.randomBytes(40).toString("hex");
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  await RefreshToken.create({
    userId,
    token: hash,
    expiresAt: new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000),
  });
  return token;
};

const setTokenCookies = (res, accessToken, refreshToken) => {
  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/refresh",
    maxAge: REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  });
};

const clearTokenCookies = (res) => {
  res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
  res.clearCookie("refreshToken", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/api/auth/refresh" });
};

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

    try {
      await sendEmail({
        to: user.email,
        subject: "Verify your email - SkillSwap",
        html: emailVerification(user.name, verifyLink),
      });
    } catch (err) {
      console.error("Register: verification email failed:", err.message);
      console.log("Verification link (fallback):", verifyLink);
    }

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

    try {
      await sendEmail({
        to: user.email,
        subject: "Welcome to SkillSwap!",
        html: welcomeEmail(user.name),
      });
    } catch (err) {
      console.error("Welcome email failed:", err.message);
    }

    res.json({
      success: true,
      message: "Email verified successfully! You can now log in.",
    });

});

const resendCooldowns = new Map();

// RESEND VERIFICATION
exports.resendVerification = asyncHandler(async (req, res) => {

    const email = req.body?.email?.toLowerCase().trim() || req.user?.email;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const lastSent = resendCooldowns.get(email);
    if (lastSent && Date.now() - lastSent < 60000) {
      const remaining = Math.ceil((60000 - (Date.now() - lastSent)) / 1000);
      return res.status(429).json({ success: false, message: `Please wait ${remaining}s before resending` });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with this email" });
    }

    if (user.isVerified) {
      return res.json({ success: true, message: "Your email is already verified." });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hash = crypto.createHash("sha256").update(verificationToken).digest("hex");

    user.verificationToken = hash;
    user.verificationTokenExpires = Date.now() + 86400000;
    await user.save();

    const verifyLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/verify-email/${verificationToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: "Verify your email - SkillSwap",
        html: emailVerification(user.name, verifyLink),
      });
      resendCooldowns.set(email, Date.now());
    } catch (err) {
      console.error("Resend verification email failed:", err.message);
      console.log("Verification link (fallback):", verifyLink);
    }

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

    const payload = { id: user._id, roles: user.roles };
    const accessToken = generateAccessToken(payload);
    const refreshToken = await generateRefreshToken(user._id);
    setTokenCookies(res, accessToken, refreshToken);

    res.send({
      success: true,
      message: "Login successful",
      token: accessToken,
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

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset - SkillSwap",
        html: passwordResetEmail(user.name, resetLink),
      });
    } catch (err) {
      console.error("Reset email failed:", err.message);
      console.log("Password reset link (fallback):", resetLink);
    }

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
    user.deletedBy = "self";
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

// REFRESH TOKEN
exports.refresh = asyncHandler(async (req, res) => {

    const rawToken = req.cookies?.refreshToken;
    if (!rawToken) {
      return res.status(401).json({ success: false, message: "No refresh token" });
    }

    const hash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const stored = await RefreshToken.findOne({ token: hash });

    if (!stored) {
      clearTokenCookies(res);
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

    const user = await User.findById(stored.userId).select("name email roles");
    if (!user || user.status !== "active") {
      await RefreshToken.deleteMany({ userId: stored.userId });
      clearTokenCookies(res);
      return res.status(401).json({ success: false, message: "Account no longer active" });
    }

    await RefreshToken.deleteOne({ _id: stored._id });

    const payload = { id: user._id, roles: user.roles };
    const accessToken = generateAccessToken(payload);
    const refreshToken = await generateRefreshToken(user._id);
    setTokenCookies(res, accessToken, refreshToken);

    res.json({
      success: true,
      token: accessToken,
      data: { ...payload, name: user.name },
    });

});

// LOGOUT
exports.logout = asyncHandler(async (req, res) => {

    const rawToken = req.cookies?.refreshToken;
    if (rawToken) {
      const hash = crypto.createHash("sha256").update(rawToken).digest("hex");
      await RefreshToken.deleteOne({ token: hash });
    }

    clearTokenCookies(res);

    res.json({ success: true, message: "Logged out successfully" });

});
