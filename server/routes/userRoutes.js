const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  updateUserStatus,
  approveUser,
  blockUser,
  unblockUser,
  getPublicProfile,
  getPresence,
  searchUsers,
  blockInteraction,
  unblockInteraction,
  getBlockedUsers,
  getTopMentors,
} = require("../apis/Users/userController");

const protect = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");

router.get("/", protect, requireAdmin, getAllUsers);

router.put("/:userId/status", protect, requireAdmin, updateUserStatus);

router.put("/:userId/approve", protect, requireAdmin, approveUser);

router.put("/:userId/block", protect, requireAdmin, blockUser);

router.put("/:userId/unblock", protect, requireAdmin, unblockUser);

router.get("/public/:userId", protect.optional, getPublicProfile);
router.get("/search", protect, searchUsers);
router.post("/:userId/block", protect, blockInteraction);
router.post("/:userId/unblock", protect, unblockInteraction);
router.get("/blocked", protect, getBlockedUsers);
router.get("/:userId/presence", protect, getPresence);
router.get("/top-mentors", getTopMentors);

module.exports = router;
