const Review = require("./reviewModel");
const Request = require("../Request/requestModel");
const asyncHandler = require("../../utilities/asyncHandler");

const idsEqual = (left, right) => {
  return left && right && left.toString() === right.toString();
};

exports.getReviews = asyncHandler(async (req, res) => {

    const { search, sort } = req.query;
    const limit = req.query.limit ? Math.min(100, Math.max(1, parseInt(req.query.limit))) : 100000;
    const page = req.query.page ? Math.max(1, parseInt(req.query.page)) : 1;
    const skip = (page - 1) * limit;

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
      })),
    });

});

exports.createReview = asyncHandler(async (req, res) => {

    const { sessionId, rating, comment, session, mentor } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    let mentorId;
    let sessionName = session;
    let mentorName = mentor;

    if (sessionId) {
      const booking = await Request.findOne({
        sessionId,
        learnerId: req.user.id,
        requestStatus: { $in: ["accepted", "completed"] },
      })
        .populate("sessionId", "title mentorId")
        .populate("mentorId", "name profileImage")
        .lean();

      if (!booking) {
        return res.status(403).json({
          success: false,
          message: "You can review only sessions you booked",
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
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      message: "Review created",
      data: review,
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
