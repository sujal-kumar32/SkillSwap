const crypto = require("crypto");
const Session = require("./sessionModel");
const Skill = require("../Skills/skillModel");
const Request = require("../Request/requestModel");
const Review = require("../Reviews/reviewModel");
const { uploadBuffer, destroyImage } = require("../../utilities/cloudinaryUpload");
const asyncHandler = require("../../utilities/asyncHandler");
const getPagination = require("../../utilities/paginate");
const Wishlist = require("../Wishlist/wishlistModel");
const { ensureMeetLinks, ensureMeetLink } = require("../../utilities/meetLinkHelper");

const isAdmin = (req) => req.user?.roles?.includes("admin");
const idsEqual = (left, right) => {
  return left && right && left.toString() === right.toString();
};

// CREATE SESSION
exports.createSession = asyncHandler(async (req, res) => {

    const {
      title,
      skillId,
      description,
      price = 0,
      date,
      time,
      duration,
      maxLearners,
      sessionType,
      meetLink,
      thumbnail: thumbnailUrl,
    } = req.body;

    if (!title || !skillId) {
      return res.status(400).json({
        success: false,
        message: "Title and skillId required",
      });
    }

    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    let thumbnail = thumbnailUrl || "";
    let thumbnailPublicId = "";
    if (req.file) {
      const result = await uploadBuffer(req.file.buffer, {
        public_id: `session_${Date.now()}`,
      });
      thumbnail = result.secure_url;
      thumbnailPublicId = result.public_id;
    }

    const numericPrice = Number(price) || 0;

    const session = await Session.create({
      title,
      skillId,
      categoryId: skill.categoryId,
      description,
      price: numericPrice,
      isPaid: numericPrice > 0,
      mentorId: req.user.id,
      date,
      time,
      duration,
      maxLearners,
      sessionType,
      meetLink,
      thumbnail,
      thumbnailPublicId,
    });

    if (session.sessionType === "online" && !session.meetLink) {
      const suffix = crypto.randomBytes(4).toString("hex");
      session.meetLink = `https://meet.jit.si/skillswap-${session._id}-${suffix}`;
      await session.save();
    }

    res.status(201).json({
      success: true,
      message: "Session created",
      data: session,
    });


});

// GET CURRENT MENTOR SESSIONS
exports.getMySessions = asyncHandler(async (req, res) => {

    const sessions = await Session.find({ mentorId: req.user.id })
      .populate({
        path: "skillId",
        populate: { path: "categoryId", select: "name" },
      })
      .populate("mentorId", "name email profileImage")
      .lean();

    const sessionIds = sessions.map((session) => session._id);
    const [bookingCounts, ratings, acceptedCounts] = await Promise.all([
      Request.aggregate([
        { $match: { sessionId: { $in: sessionIds } } },
        { $group: { _id: "$sessionId", count: { $sum: 1 } } },
      ]),
      Review.aggregate([
        { $match: { sessionId: { $in: sessionIds } } },
        { $group: { _id: "$sessionId", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
      ]),
      Request.aggregate([
        { $match: { sessionId: { $in: sessionIds }, requestStatus: "accepted" } },
        { $group: { _id: "$sessionId", count: { $sum: 1 } } },
      ]),
    ]);

    const countMap = bookingCounts.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {});

    const ratingMap = {};
    ratings.forEach((r) => { ratingMap[r._id.toString()] = { avg: Math.round(r.avgRating * 10) / 10, count: r.count }; });

    const acceptedMap = {};
    acceptedCounts.forEach((a) => { acceptedMap[a._id.toString()] = a.count; });

    await ensureMeetLinks(sessions);

    res.json({
      success: true,
      total: sessions.length,
      data: sessions.map((session) => ({
        ...session,
        bookings: countMap[session._id.toString()] || 0,
        rating: ratingMap[session._id.toString()]?.avg || null,
        reviewCount: ratingMap[session._id.toString()]?.count || 0,
        spotsFilled: acceptedMap[session._id.toString()] || 0,
      })),
    });

});



// GET ALL SESSIONS
exports.getSessions = asyncHandler(async (req, res) => {

    const { search, sort, category, skill, price, sessionType } = req.query;
    const { page, limit, skip } = getPagination(req.query);

    let filter = isAdmin(req) ? {} : { status: "active" };

    if (category) filter.categoryId = category;
    if (skill) filter.skillId = skill;
    if (sessionType) filter.sessionType = sessionType;
    if (price === "free") filter.price = 0;
    else if (price === "paid") filter.price = { $gt: 0 };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    let sortObj = {};
    if (sort === "latest" || sort === "newest") sortObj = { createdAt: -1 };
    else if (sort === "oldest") sortObj = { createdAt: 1 };
    else if (sort === "price") sortObj = { price: 1 };
    else if (sort === "price-desc") sortObj = { price: -1 };
    else if (sort === "name") sortObj = { title: 1 };
    else sortObj = { createdAt: -1 };

    const [sessions, total] = await Promise.all([
      Session.find(filter).sort(sortObj).skip(skip).limit(limit)
        .populate({
          path: "skillId",
          populate: { path: "categoryId", select: "name" },
        })
        .populate("mentorId", "name email profileImage")
        .lean(),
      Session.countDocuments(filter),
    ]);

    const sessionIds = sessions.map((s) => s._id);
    const [ratings, acceptedCounts, userWishlist] = await Promise.all([
      sessionIds.length
        ? Review.aggregate([
            { $match: { sessionId: { $in: sessionIds } } },
            { $group: { _id: "$sessionId", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
          ])
        : [],
      sessionIds.length
        ? Request.aggregate([
            { $match: { sessionId: { $in: sessionIds }, requestStatus: "accepted" } },
            { $group: { _id: "$sessionId", count: { $sum: 1 } } },
          ])
        : [],
      req.user?.id
        ? Wishlist.find({ userId: req.user.id, sessionId: { $in: sessionIds } }).select("sessionId").lean()
        : [],
    ]);
    const ratingMap = {};
    ratings.forEach((r) => { ratingMap[r._id.toString()] = { avg: Math.round(r.avgRating * 10) / 10, count: r.count }; });
    const acceptedMap = {};
    acceptedCounts.forEach((a) => { acceptedMap[a._id.toString()] = a.count; });
    const savedSet = new Set(userWishlist.map((w) => w.sessionId.toString()));

    await ensureMeetLinks(sessions);

    const data = sessions.map((s) => ({
      ...s,
      rating: ratingMap[s._id.toString()]?.avg || null,
      reviewCount: ratingMap[s._id.toString()]?.count || 0,
      spotsFilled: acceptedMap[s._id.toString()] || 0,
      isSaved: savedSet.has(s._id.toString()),
    }));

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data,
    });


});



// GET SINGLE SESSION
exports.getSession = asyncHandler(async (req, res) => {

    const session = await Session.findById(req.params.id)
      .populate("skillId")
      .populate("mentorId", "name email profileImage")
      .lean();

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const [ratingResult, acceptedCount, isSaved] = await Promise.all([
      Review.aggregate([
        { $match: { sessionId: session._id } },
        { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
      ]),
      Request.countDocuments({ sessionId: session._id, requestStatus: "accepted" }),
      req.user?.id
        ? Wishlist.exists({ userId: req.user.id, sessionId: session._id })
        : false,
    ]);

    const hasBooking = req.user?.id
      ? await Request.exists({ sessionId: session._id, learnerId: req.user.id })
      : false;

    const canView =
      session.status === "active" ||
      isAdmin(req) ||
      idsEqual(session.mentorId?._id || session.mentorId, req.user?.id) ||
      hasBooking;

    if (!canView) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    await ensureMeetLink(session);

    res.json({
      success: true,
      data: {
        ...session,
        rating: ratingResult?.avgRating ? Math.round(ratingResult.avgRating * 10) / 10 : null,
        reviewCount: ratingResult?.count || 0,
        spotsFilled: acceptedCount || 0,
        isSaved: !!isSaved,
      },
    });


});



// UPDATE SESSION
exports.updateSession = asyncHandler(async (req, res) => {

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (!isAdmin(req) && !idsEqual(session.mentorId, req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own sessions",
      });
    }

    const allowedTransitions = {
      active: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
    };

    if (req.body.status !== undefined && req.body.status !== session.status) {
      const newStatus = req.body.status;
      if (!isAdmin(req) && !allowedTransitions[session.status]?.includes(newStatus)) {
        return res.status(400).json({
          success: false,
          message: `Cannot change status from "${session.status}" to "${newStatus}"`,
        });
      }
    }

    const oldStatus = session.status;

    const allowedFields = [
      "title",
      "description",
      "price",
      "date",
      "time",
      "duration",
      "maxLearners",
      "sessionType",
      "meetLink",
      "thumbnail",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        session[field] = field === "price" ? Number(req.body[field]) || 0 : req.body[field];
      }
    });
    session.isPaid = session.price > 0;

    if (req.file) {
      if (session.thumbnailPublicId) {
        await destroyImage(session.thumbnailPublicId).catch(() => {});
      }
      const result = await uploadBuffer(req.file.buffer, {
        public_id: `session_${Date.now()}`,
      });
      session.thumbnail = result.secure_url;
      session.thumbnailPublicId = result.public_id;
    }

    await session.save();

    if (session.status !== oldStatus) {
      if (session.status === "cancelled") {
        await Request.updateMany(
          { sessionId: session._id, requestStatus: { $in: ["pending", "accepted"] } },
          { requestStatus: "cancelled" },
        );
      } else if (session.status === "completed") {
        await Request.updateMany(
          { sessionId: session._id, requestStatus: { $in: ["pending", "accepted"] } },
          { requestStatus: "completed" },
        );
      }
    }

    res.json({
      success: true,
      message: "Session updated",
      data: session,
    });


});



// DELETE SESSION
exports.deleteSession = asyncHandler(async (req, res) => {

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (!isAdmin(req) && !idsEqual(session.mentorId, req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own sessions",
      });
    }

    if (session.thumbnailPublicId) {
      await destroyImage(session.thumbnailPublicId).catch(() => {});
    }

    await session.deleteOne();

    res.json({
      success: true,
      message: "Session deleted",
    });


});
