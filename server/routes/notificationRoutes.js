const router = require("express").Router();
const protect = require("../middleware/authMiddleware");
const ctrl = require("../apis/Notification/notificationController");

router.get("/", protect, ctrl.getNotifications);
router.get("/unread-count", protect, ctrl.getUnreadCount);
router.patch("/:id/read", protect, ctrl.markAsRead);
router.patch("/read-all", protect, ctrl.markAllAsRead);

module.exports = router;
