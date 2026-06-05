const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");
const { getAnalytics } = require("../apis/Admin/adminAnalyticsController");
const { broadcastNotification, getBroadcasts, deleteBroadcast, updateBroadcast, getPayments, resolveDispute, bookingAnalytics } = require("../apis/Admin/adminController");

router.get("/analytics", protect, requireAdmin, getAnalytics);
router.post("/broadcast", protect, requireAdmin, broadcastNotification);
router.get("/broadcasts", protect, requireAdmin, getBroadcasts);
router.put("/broadcast/:id", protect, requireAdmin, updateBroadcast);
router.delete("/broadcast/:id", protect, requireAdmin, deleteBroadcast);
router.get("/payments", protect, requireAdmin, getPayments);
router.put("/disputes/:id/resolve", protect, requireAdmin, resolveDispute);
router.get("/analytics/bookings", protect, requireAdmin, bookingAnalytics);

module.exports = router;
