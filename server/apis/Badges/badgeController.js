const Badge = require("./badgeModel");
const User = require("../Users/userModel");
const asyncHandler = require("../../utilities/asyncHandler");

exports.getAllBadges = asyncHandler(async (req, res) => {
  const badges = await Badge.find({}).lean();
  res.json({ success: true, data: badges });
});

exports.getMyBadges = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate("earnedBadges.badgeId")
    .lean();
  const earned = (user?.earnedBadges || [])
    .filter((b) => b.badgeId)
    .map((b) => ({
      ...b.badgeId,
      earnedAt: b.earnedAt,
    }))
    .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt));
  res.json({ success: true, data: earned });
});

exports.getBadgeById = asyncHandler(async (req, res) => {
  const badge = await Badge.findById(req.params.id).lean();
  if (!badge) return res.status(404).json({ success: false, message: "Badge not found" });
  res.json({ success: true, data: badge });
});
