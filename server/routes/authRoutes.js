const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const { auth } = require("../validations");
const protect = require("../middleware/authMiddleware");

const { register, login, changePassword, forgotPassword, resetPassword, verifyEmail, resendVerification, deleteAccount, getMe, logout } = require("../apis/Auth/authController");

router.post("/register", validate(auth.register), register);
router.post("/login", validate(auth.login), login);
router.get("/verify/:token", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/delete-account", protect, deleteAccount);
router.post("/change-password", protect, validate(auth.changePassword), changePassword);
router.post("/forgot-password", validate(auth.forgotPassword), forgotPassword);
router.post("/reset-password", validate(auth.resetPassword), resetPassword);
router.get("/me", protect, getMe);
router.post("/logout", protect.optional, logout);

module.exports = router;
