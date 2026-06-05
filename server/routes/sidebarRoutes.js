const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getSidebarCounts } = require("../apis/Sidebar/sidebarController");

router.get("/counts", protect, getSidebarCounts);

module.exports = router;
