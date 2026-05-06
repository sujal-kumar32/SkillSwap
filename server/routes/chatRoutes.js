const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const { sendMessage, getChat } = require("../apis/Chat/chatController");

router.post("/send", protect, sendMessage);
router.get("/:requestId", protect, getChat);

module.exports = router;
