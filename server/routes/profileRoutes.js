const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const { profile } = require("../validations");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const {
  getProfile,
  updateProfile,
} = require("../apis/Profile/profileController");

router.get("/", protect, getProfile);
router.put("/", protect, upload.single("profileImage"), validate(profile.update), updateProfile);

module.exports = router;
