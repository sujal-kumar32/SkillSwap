const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const { profile } = require("../validations");
const protect = require("../middleware/authMiddleware");
const { upload } = require("../middleware/upload");

const {
  getProfile,
  updateProfile,
  getProfileStats,
  getXpHistory,
  getPublicProfile,
  getOnboarding,
  dismissOnboarding,
} = require("../apis/Profile/profileController");

router.get("/", protect.optional, getProfile);
router.put("/", protect, upload.single("profileImage"), validate(profile.update), updateProfile);
router.get("/stats", protect, getProfileStats);
router.get("/xp-history", protect, getXpHistory);
router.get("/public/:userId", getPublicProfile);
router.get("/onboarding", protect, getOnboarding);
router.put("/onboarding/dismiss", protect, dismissOnboarding);

module.exports = router;
