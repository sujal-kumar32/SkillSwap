const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");
const { getAnalytics } = require("../apis/Admin/adminAnalyticsController");

router.get("/analytics", protect, requireAdmin, getAnalytics);

module.exports = router;
