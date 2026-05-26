const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const { request } = require("../validations");
const protect = require("../middleware/authMiddleware");

const {
  createRequest,
  getRequests,
  getMyBookings,
  getMentorBookings,
  getMentorLearners,
  updateRequestStatus,
  deleteRequest,
} = require("../apis/Request/requestController");

router.post("/", protect, validate(request.create), createRequest);
router.post("/book", protect, validate(request.create), createRequest);
router.get("/mentor/bookings", protect, getMentorBookings);
router.get("/mentor/learners", protect, getMentorLearners);
router.get("/my-bookings", protect, getMyBookings);
router.get("/", protect, getRequests);
router.put("/:id/status", protect, validate(request.updateStatus), updateRequestStatus);
router.delete("/:id", protect, deleteRequest);

module.exports = router;
