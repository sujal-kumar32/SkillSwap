const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");

const { getProgress, getAllProgress } = require("../apis/Progress/progressController");

router.get("/", protect, getProgress);
router.get("/all", protect, requireAdmin, getAllProgress);

module.exports = router;
