const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const validate = require("../middleware/validate");
const { auth } = require("../validations");
const protect = require("../middleware/authMiddleware");

const { register, login, changePassword, forgotPassword, resetPassword, verifyEmail, resendVerification, deleteAccount, getMe, logout, refresh } = require("../apis/Auth/authController");

const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { success: false, message: "Too many reset attempts. Please try again in an hour." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", validate(auth.register), register);
router.post("/login", validate(auth.login), login);
router.get("/verify/:token", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/delete-account", protect, deleteAccount);
router.post("/change-password", protect, validate(auth.changePassword), changePassword);
router.post("/forgot-password", forgotLimiter, validate(auth.forgotPassword), forgotPassword);
router.post("/reset-password", validate(auth.resetPassword), resetPassword);
router.get("/me", protect, getMe);
router.post("/refresh", refresh);
router.post("/logout", protect.optional, logout);

module.exports = router;
