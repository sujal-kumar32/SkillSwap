const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");

const {
  applyForMentor,
  getMyApplication,
  getAllApplications,
  approveApplication,
  rejectApplication,
  removeMentor,
  unblockMentor,
  deleteApplication,
} = require("../apis/MentorApplication/mentorApplicationController");

router.post("/apply", protect, applyForMentor);
router.get("/my-application", protect, getMyApplication);
router.get("/all", protect, requireAdmin, getAllApplications);
router.put("/:id/approve", protect, requireAdmin, approveApplication);
router.put("/:id/reject", protect, requireAdmin, rejectApplication);
router.put("/:id/remove-mentor", protect, requireAdmin, removeMentor);
router.put("/:id/unblock", protect, requireAdmin, unblockMentor);
router.delete("/:id", protect, requireAdmin, deleteApplication);

module.exports = router;
