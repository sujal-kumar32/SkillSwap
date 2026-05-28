const Review = require("./reviewModel");
const User = require("../Users/userModel");
const asyncHandler = require("../../utilities/asyncHandler");
const { createFeedEvent } = require("../../services/feedService");
const getPagination = require("../../utilities/paginate");
const { awardXP } = require("../../services/xpService");

const idsEqual = (left, right) => {
  return left && right && left.toString() === right.toString();
};

exports.getReviews = asyncHandler(async (req, res) => {

    const { search, sort, rating } = req.query;
    const { page, limit, skip } = getPagination(req.query);

    let filter = {};
    if (req.user.roles?.includes("admin")) {
      filter = {};
    } else if (req.user.roles?.includes("mentor")) {
      filter = { mentorId: req.user.id };
    } else {
      filter = { learnerId: req.user.id };
    }

    if (search) {
      filter.$or = [
        { session: { $regex: search, $options: "i" } },
        { mentor: { $regex: search, $options: "i" } },
      ];
    }

    if (rating) {
      filter.rating = Number(rating);
    }

    let sortObj = {};
    if (sort === "latest" || sort === "newest") sortObj = { createdAt: -1 };
    else if (sort === "oldest") sortObj = { createdAt: 1 };
    else if (sort === "rating") sortObj = { rating: -1 };
    else sortObj = { createdAt: -1 };

    const [reviews, total] = await Promise.all([
      Review.find(filter).sort(sortObj).skip(skip).limit(limit)
        .populate("sessionId", "title")
        .populate("mentorId", "name email profileImage")
        .populate("learnerId", "name email profileImage")
        .lean(),
      Review.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: reviews.map((review) => ({
        ...review,
        session: review.session || review.sessionId?.title,
        mentor: review.mentor || review.mentorId?.name,
        learner: review.learner || review.learnerId?.name,
      })),
    });

});

exports.createReview = asyncHandler(async (req, res) => {

    const { sessionId, rating, comment, session, mentor } = req.body;

    const user = await User.findById(req.user.id).select("name").lean();

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (sessionId) {
      const existing = await Review.findOne({ sessionId, learnerId: req.user.id });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "You have already reviewed this session",
        });
      }
    }

    let mentorId;
    let sessionName = session;
    let mentorName = mentor;

    if (sessionId) {
      const booking = await Request.findOne({
        sessionId,
        learnerId: req.user.id,
      })
        .populate("sessionId", "title mentorId status")
        .populate("mentorId", "name profileImage")
        .lean();

      if (!booking) {
        return res.status(403).json({
          success: false,
          message: "You can review only sessions you booked",
        });
      }

      const canReview =
        booking.requestStatus === "completed" ||
        booking.requestStatus === "accepted" ||
        booking.sessionId?.status === "completed";

      if (!canReview) {
        return res.status(403).json({
          success: false,
          message: "You can review only completed or accepted sessions",
        });
      }

      mentorId = booking.mentorId?._id || booking.sessionId?.mentorId;
      sessionName = booking.sessionId?.title || sessionName;
      mentorName = booking.mentorId?.name || mentorName;
    }

    const review = await Review.create({
      sessionId,
      mentorId,
      learnerId: req.user.id,
      session: sessionName,
      mentor: mentorName,
      learner: user?.name || "Learner",
      rating,
      comment,
    });

    let xpResult = null;
    try {
      xpResult = await awardXP(req.user.id, 10, "Wrote a review", review._id, "Review");
    } catch (xpErr) {
      console.error("XP award failed:", xpErr.message);
    }

    createFeedEvent(req.user.id, "review_written", review._id, "Review", {
      sessionTitle: sessionName,
      rating,
    });

    res.status(201).json({
      success: true,
      message: "Review created",
      data: review,
      ...(xpResult && { xp: {
        xpGained: xpResult.xpGained,
        totalXp: xpResult.xp,
        newBadges: xpResult.newBadges,
      }}),
    });

});

exports.updateReview = asyncHandler(async (req, res) => {

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (!req.user.roles?.includes("admin") && !idsEqual(review.learnerId, req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own reviews",
      });
    }

    if (req.body.rating !== undefined) review.rating = req.body.rating;
    if (req.body.comment !== undefined) review.comment = req.body.comment;
    if (req.body.session !== undefined) review.session = req.body.session;
    if (req.body.mentor !== undefined) review.mentor = req.body.mentor;

    await review.save();

    res.json({
      success: true,
      message: "Review updated",
      data: review,
    });

});

exports.deleteReview = asyncHandler(async (req, res) => {

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (!req.user.roles?.includes("admin") && !idsEqual(review.learnerId, req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own reviews",
      });
    }

    await review.deleteOne();

    res.json({
      success: true,
      message: "Review deleted",
    });

});
