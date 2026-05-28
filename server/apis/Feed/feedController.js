const Feed = require("./feedModel");
const Follow = require("../Follow/followModel");
const asyncHandler = require("../../utilities/asyncHandler");

exports.getFeed = asyncHandler(async (req, res) => {
  const { tab = "following", page = 1, limit = 20 } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));

  let query = {};

  if (tab === "following") {
    const followings = await Follow.find({ follower: req.user.id }).select("following").lean();
    const followingIds = followings.map((f) => f.following);
    if (followingIds.length > 0) {
      query.actor = { $in: followingIds };
    } else {
      return res.json({ success: true, data: [], pagination: { page: pageNum, limit: limitNum, total: 0, pages: 0 } });
    }
  }

  const [events, total] = await Promise.all([
    Feed.find(query)
      .populate("actor", "name profileImage xp level roles")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    Feed.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: events,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});
