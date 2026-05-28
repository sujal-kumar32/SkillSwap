const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { requireMentor } = require("../middleware/roleMiddleware");
const { getMentorAnalytics } = require("../apis/Analytics/mentorAnalyticsController");

router.get("/mentor", protect, requireMentor, getMentorAnalytics);

module.exports = router;
