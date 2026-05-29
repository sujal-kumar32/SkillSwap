const Follow = require("./followModel");
const User = require("../Users/userModel");
const mongoose = require("mongoose");
const asyncHandler = require("../../utilities/asyncHandler");
const { createFeedEvent } = require("../../services/feedService");
const { sendNotification } = require("../../services/notificationService");
const { awardXP, checkAndAwardBadges } = require("../../services/xpService");

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
  createFeedEvent(currentUserId, "started_following", userId, "User", {
    targetName: target.name,
  });
  const follower = await User.findById(currentUserId).select("name").lean();
  sendNotification(userId, currentUserId, "follow", `${follower?.name || "Someone"} started following you`, `/profile/${currentUserId}`);
  await awardXP(userId, 5, "New follower", currentUserId, "User");
  await checkAndAwardBadges(userId);
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

exports.getSuggestions = asyncHandler(async (req, res) => {
  const currentUserId = req.user.id;
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 6));

  const followedIds = await Follow.find({ follower: currentUserId }).distinct("following");
  const excludeIds = [currentUserId, ...followedIds.map((id) => id.toString())];

  const me = await User.findById(currentUserId).select("interests skills.name").lean();
  const myInterests = me?.interests || [];
  const mySkillNames = me?.skills?.map((s) => s.name.toLowerCase()) || [];
  const hasTags = myInterests.length > 0 || mySkillNames.length > 0;

  let suggestions = [];
  if (hasTags) {
    const excluded = excludeIds.map((id) => new mongoose.Types.ObjectId(id));
    const lowerInterests = myInterests.map((i) => i.toLowerCase());

    suggestions = await User.aggregate([
      { $match: { _id: { $nin: excluded } } },
      {
        $addFields: {
          interestOverlap: {
            $size: {
              $ifNull: [{
                $filter: {
                  input: { $ifNull: ["$interests", []] },
                  as: "i",
                  cond: { $in: [{ $toLower: "$$i" }, lowerInterests] },
                },
              }, []],
            },
          },
          skillOverlap: {
            $size: {
              $ifNull: [{
                $filter: {
                  input: { $ifNull: ["$skills", []] },
                  as: "s",
                  cond: { $in: [{ $toLower: "$$s.name" }, mySkillNames] },
                },
              }, []],
            },
          },
        },
      },
      {
        $addFields: {
          overlap: { $add: ["$interestOverlap", "$skillOverlap"] },
        },
      },
      { $match: { overlap: { $gt: 0 } } },
      { $sort: { overlap: -1, followerCount: -1 } },
      { $limit: limit },
      { $project: { name: 1, profileImage: 1, bio: 1, xp: 1, level: 1, followerCount: 1, interests: 1, overlap: 1 } },
    ]);
  }

  if (suggestions.length < limit) {
    const existingIds = suggestions.map((s) => s._id.toString());
    const remainingLimit = limit - suggestions.length;
    const popular = await User.aggregate([
      { $match: { _id: { $nin: [...excludeIds, ...existingIds].map((id) => new mongoose.Types.ObjectId(id)) } } },
      { $sort: { followerCount: -1 } },
      { $limit: remainingLimit },
      { $project: { name: 1, profileImage: 1, bio: 1, xp: 1, level: 1, followerCount: 1, interests: 1, overlap: { $literal: 0 } } },
    ]);
    suggestions = [...suggestions, ...popular];
  }

  res.json({ success: true, data: suggestions });
});
