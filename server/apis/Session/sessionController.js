const Session = require("./sessionModel");
const Skill = require("../Skills/skillModel");
const Request = require("../Request/requestModel");
const Review = require("../Reviews/reviewModel");
const { uploadBuffer, destroyImage } = require("../../utilities/cloudinaryUpload");
const asyncHandler = require("../../utilities/asyncHandler");
const getPagination = require("../../utilities/paginate");

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
    const bookingCounts = await Request.aggregate([
      { $match: { sessionId: { $in: sessionIds } } },
      { $group: { _id: "$sessionId", count: { $sum: 1 } } },
    ]);

    const countMap = bookingCounts.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {});

    res.json({
      success: true,
      total: sessions.length,
      data: sessions.map((session) => ({
        ...session,
        bookings: countMap[session._id.toString()] || 0,
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
    const ratings = sessionIds.length
      ? await Review.aggregate([
          { $match: { sessionId: { $in: sessionIds } } },
          { $group: { _id: "$sessionId", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
        ])
      : [];
    const ratingMap = {};
    ratings.forEach((r) => { ratingMap[r._id.toString()] = { avg: Math.round(r.avgRating * 10) / 10, count: r.count }; });

    const data = sessions.map((s) => ({
      ...s,
      rating: ratingMap[s._id.toString()]?.avg || null,
      reviewCount: ratingMap[s._id.toString()]?.count || 0,
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

    const canView =
      session.status === "active" ||
      isAdmin(req) ||
      idsEqual(session.mentorId?._id || session.mentorId, req.user?.id);

    if (!canView) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    res.json({
      success: true,
      data: session,
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
