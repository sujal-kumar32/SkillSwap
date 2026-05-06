const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  createRequest,
  getRequests,
  updateRequestStatus,
  deleteRequest,
} = require("../apis/Request/requestController");

router.post("/", protect, createRequest);
router.get("/", protect, getRequests);
router.put("/:id/status", protect, updateRequestStatus);
router.delete("/:id", protect, deleteRequest);

module.exports = router;
