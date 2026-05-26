const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getMentorLeaderboard,
  getLearnerLeaderboard,
} = require("../apis/Leaderboard/leaderboardController");

router.get("/mentors", protect, getMentorLeaderboard);
router.get("/learners", protect, getLearnerLeaderboard);

module.exports = router;
