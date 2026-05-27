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
} = require("../apis/Profile/profileController");

router.get("/", protect, getProfile);
router.put("/", protect, upload.single("profileImage"), validate(profile.update), updateProfile);
router.get("/stats", protect, getProfileStats);
router.get("/xp-history", protect, getXpHistory);

module.exports = router;
