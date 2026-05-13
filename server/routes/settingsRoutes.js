const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");
const { getSettings, updateSettings } = require("../apis/Settings/settingsController");

router.get("/", protect, requireAdmin, getSettings);
router.put("/", protect, requireAdmin, updateSettings);

module.exports = router;
