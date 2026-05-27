const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const { session } = require("../validations");
const protect = require("../middleware/authMiddleware");
const { upload } = require("../middleware/upload");
const {
  requireMentorOrAdmin,
} = require("../middleware/roleMiddleware");

const {
  createSession,
  getMySessions,
  getSessions,
  getSession,
  updateSession,
  deleteSession,
} = require("../apis/Session/sessionController");

router.post("/", protect, requireMentorOrAdmin, upload.single("thumbnail"), validate(session.create), createSession);
router.get("/mentor/me", protect, requireMentorOrAdmin, getMySessions);
router.get("/", protect.optional, getSessions);
router.get("/:id", protect.optional, getSession);
router.put("/:id", protect, requireMentorOrAdmin, upload.single("thumbnail"), validate(session.update), updateSession);
router.delete("/:id", protect, requireMentorOrAdmin, deleteSession);

module.exports = router;
