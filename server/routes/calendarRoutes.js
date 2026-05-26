const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  connect,
  callback,
  status,
  disconnect,
} = require("../apis/Calendar/calendarController");

router.get("/connect", protect, connect);
router.get("/callback", callback);
router.get("/status", protect, status);
router.post("/disconnect", protect, disconnect);

module.exports = router;
