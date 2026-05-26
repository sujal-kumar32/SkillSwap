const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getAllBadges,
  getMyBadges,
  getBadgeById,
} = require("../apis/Badges/badgeController");

router.get("/", protect, getAllBadges);
router.get("/mine", protect, getMyBadges);
router.get("/:id", protect, getBadgeById);

module.exports = router;
