const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { requireMentorOrAdmin } = require("../middleware/roleMiddleware");
const {
  getMyAvailability,
  updateMyAvailability,
  getMentorAvailability,
  getBookedSlots,
} = require("../apis/Availability/availabilityController");

router.get("/me", protect, requireMentorOrAdmin, getMyAvailability);
router.put("/me", protect, requireMentorOrAdmin, updateMyAvailability);
router.get("/booked-slots", protect, getBookedSlots);
router.get("/:mentorId", protect, getMentorAvailability);

module.exports = router;
