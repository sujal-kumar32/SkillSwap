const Wishlist = require("./wishlistModel");
const Session = require("../Session/sessionModel");
const asyncHandler = require("../../utilities/asyncHandler");
const getPagination = require("../../utilities/paginate");

exports.toggleWishlist = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ success: false, message: "sessionId is required" });
  }

  const session = await Session.findById(sessionId);
  if (!session) {
    return res.status(404).json({ success: false, message: "Session not found" });
  }

  const existing = await Wishlist.findOne({ userId: req.user.id, sessionId });
  if (existing) {
    await existing.deleteOne();
    return res.json({ success: true, saved: false, message: "Removed from wishlist" });
  }

  await Wishlist.create({ userId: req.user.id, sessionId });
  res.json({ success: true, saved: true, message: "Added to wishlist" });
});

exports.getWishlist = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const [items, total] = await Promise.all([
    Wishlist.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "sessionId",
        populate: [
          { path: "skillId", populate: { path: "categoryId", select: "name" } },
          { path: "mentorId", select: "name email profileImage" },
        ],
      })
      .lean(),
    Wishlist.countDocuments({ userId: req.user.id }),
  ]);

  res.json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: items.map((i) => i.sessionId).filter(Boolean),
  });
});

exports.checkWishlist = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const saved = await Wishlist.exists({ userId: req.user.id, sessionId });
  res.json({ success: true, saved: !!saved });
});
