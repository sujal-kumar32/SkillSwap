const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const protect = require("../middleware/authMiddleware");

const {
  getRecommendations,
  generateTitle,
  generateDescription,
  generateOutcomes,
  generateTags,
  generateRoadmap,
  mentorAssistant,
  chatAssistant,
  searchSessions,
} = require("../apis/AI/aiController");

const {
  getWelcome,
  guideChat,
  updateOnboarding,
} = require("../apis/AI/guideController");

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many AI requests. Please wait a moment." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/recommendations", protect, getRecommendations);
router.post("/generate-title", protect, aiLimiter, generateTitle);
router.post("/generate-description", protect, aiLimiter, generateDescription);
router.post("/generate-outcomes", protect, aiLimiter, generateOutcomes);
router.post("/generate-tags", protect, aiLimiter, generateTags);
router.post("/generate-roadmap", protect, aiLimiter, generateRoadmap);
router.post("/mentor-assistant", protect, aiLimiter, mentorAssistant);
router.post("/chat", protect, aiLimiter, chatAssistant);
router.post("/search", protect, aiLimiter, searchSessions);

router.get("/guide/welcome", protect.optional, getWelcome);
router.post("/guide/chat", protect.optional, guideChat);
router.put("/guide/onboarding", protect, updateOnboarding);

module.exports = router;
