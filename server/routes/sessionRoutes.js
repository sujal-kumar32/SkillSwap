const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  requireVerifiedMentorOrAdmin,
} = require("../middleware/roleMiddleware");

const {
  createSession,
  getSessions,
  getSession,
  updateSession,
  deleteSession,
} = require("../apis/Session/sessionController");

router.post("/", protect, requireVerifiedMentorOrAdmin, createSession);
router.get("/", protect.optional, getSessions);
router.get("/:id", protect.optional, getSession);
router.put("/:id", protect, updateSession);
router.delete("/:id", protect, deleteSession);

module.exports = router;
