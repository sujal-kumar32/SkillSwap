const Follow = require("./followModel");
const User = require("../Users/userModel");
const asyncHandler = require("../../utilities/asyncHandler");

exports.toggleFollow = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const currentUserId = req.user.id;

  if (userId === currentUserId) {
    return res.status(400).json({ success: false, message: "You cannot follow yourself" });
  }

  const target = await User.findById(userId);
  if (!target) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const existing = await Follow.findOne({ follower: currentUserId, following: userId });

  if (existing) {
    await Follow.deleteOne({ _id: existing._id });
    await User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: -1 } });
    await User.findByIdAndUpdate(userId, { $inc: { followerCount: -1 } });
    return res.json({ success: true, following: false, message: "Unfollowed" });
  }

  await Follow.create({ follower: currentUserId, following: userId });
  await User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: 1 } });
  await User.findByIdAndUpdate(userId, { $inc: { followerCount: 1 } });
  res.json({ success: true, following: true, message: "Followed" });
});

exports.getFollowers = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));

  const total = await Follow.countDocuments({ following: userId });
  const follows = await Follow.find({ following: userId })
    .populate("follower", "name profileImage bio xp level")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    success: true,
    data: follows.map((f) => f.follower),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

exports.getFollowing = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));

  const total = await Follow.countDocuments({ follower: userId });
  const follows = await Follow.find({ follower: userId })
    .populate("following", "name profileImage bio xp level")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    success: true,
    data: follows.map((f) => f.following),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

exports.getFollowCount = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const [followerCount, followingCount] = await Promise.all([
    Follow.countDocuments({ following: userId }),
    Follow.countDocuments({ follower: userId }),
  ]);
  res.json({ success: true, data: { followerCount, followingCount } });
});

exports.getFollowStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;
  const follow = await Follow.findOne({ follower: currentUserId, following: userId });
  res.json({ success: true, data: { following: !!follow } });
});
