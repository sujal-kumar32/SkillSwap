const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const { getRecommendations } = require("../apis/AI/aiController");

router.get("/recommendations", protect, getRecommendations);

module.exports = router;
