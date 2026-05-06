const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  updateUserStatus,
  approveUser,
  blockUser,
  unblockUser,
  applyForMentor,
} = require("../apis/Users/userController");

const protect = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");

router.get("/", protect, requireAdmin, getAllUsers);

router.put("/:userId/status", protect, requireAdmin, updateUserStatus);

router.put("/:userId/approve", protect, requireAdmin, approveUser);

router.put("/:userId/block", protect, requireAdmin, blockUser);

router.put("/:userId/unblock", protect, requireAdmin, unblockUser);

router.post("/apply-mentor", protect, applyForMentor);

module.exports = router;
