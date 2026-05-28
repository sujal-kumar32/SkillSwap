const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const protect = require("../middleware/authMiddleware");
const ctrl = require("../apis/Chat/chatController");

const sendLimiter = rateLimit({ windowMs: 60 * 1000, max: 30, message: { success: false, message: "Too many messages, slow down" } });
const uploadLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: { success: false, message: "Too many uploads, slow down" } });
const reactionLimiter = rateLimit({ windowMs: 10 * 1000, max: 10, message: { success: false, message: "Too many reactions, slow down" } });

router.post("/send", protect, sendLimiter, ctrl.sendMessage);
router.get("/conversations", protect, ctrl.getConversations);
router.get("/unread-count", protect, ctrl.getUnreadCount);
router.get("/search", protect, ctrl.searchMessages);
router.post("/upload", protect, uploadLimiter, ctrl.uploadMiddleware, ctrl.uploadFile);
router.get("/dm/:userId", protect, ctrl.getOrCreateDM);
router.get("/booking/:requestId", protect, ctrl.getOrCreateBookingChat);
router.post("/:chatId/messages/:messageId/reaction", protect, reactionLimiter, ctrl.toggleReaction);
router.delete("/:chatId/messages/:messageId", protect, ctrl.deleteMessage);
router.get("/:chatId", protect, ctrl.getChat);
router.patch("/:chatId/read", protect, ctrl.markAsRead);

module.exports = router;
