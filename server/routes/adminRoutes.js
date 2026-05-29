const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");
const { getAnalytics } = require("../apis/Admin/adminAnalyticsController");
const { broadcastNotification, getPayments } = require("../apis/Admin/adminController");

router.get("/analytics", protect, requireAdmin, getAnalytics);
router.post("/broadcast", protect, requireAdmin, broadcastNotification);
router.get("/payments", protect, requireAdmin, getPayments);

module.exports = router;
