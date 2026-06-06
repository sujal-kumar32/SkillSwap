const mongoose = require("mongoose");
const crypto = require("crypto");
const { recalculateTrustScore } = require("../../services/trustService");
const Session = require("./sessionModel");
const Skill = require("../Skills/skillModel");
const Request = require("../Request/requestModel");
const Review = require("../Reviews/reviewModel");
const User = require("../Users/userModel");
const { uploadBuffer, destroyImage } = require("../../utilities/cloudinaryUpload");
const asyncHandler = require("../../utilities/asyncHandler");
const getPagination = require("../../utilities/paginate");
const Wishlist = require("../Wishlist/wishlistModel");
const Wallet = require("../Wallet/walletModel");
const Transaction = require("../Wallet/transactionModel");
const SessionMaterial = require("../SessionMaterial/sessionMaterialModel");
const { ensureMeetLinks, ensureMeetLink } = require("../../utilities/meetLinkHelper");
const { createFeedEvent } = require("../../services/feedService");
const { releaseCredits, transferCredits } = require("../../services/creditService");
const CREDIT_RATES = require("../../config/creditRates");

const isAdmin = (req) => req.user?.roles?.includes("admin");
const idsEqual = (left, right) => {
  return left && right && left.toString() === right.toString();
};

const buildSortObj = (sort, search) => {
  if (sort === "latest" || sort === "newest") return { createdAt: -1 };
  if (sort === "oldest") return { createdAt: 1 };
  if (sort === "price") return { price: 1 };
  if (sort === "price-desc") return { price: -1 };
  if (sort === "name") return { title: 1 };
  if (search) return { score: { $meta: "textScore" } };
  return { createdAt: -1 };
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
      bookingTypes,
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

    let sessionBookingTypes = ["paid"];
    let creditCost = 0;
    let creditSnapshot = null;

    if (bookingTypes) {
      let types = Array.isArray(bookingTypes) ? bookingTypes : [bookingTypes];
      if (types.length === 1 && typeof types[0] === "string" && types[0].includes(",")) {
        types = types[0].split(",").map((t) => t.trim());
      }
      sessionBookingTypes = types.filter((t) => ["paid", "credits"].includes(t));
      if (!sessionBookingTypes.length) sessionBookingTypes = ["paid"];
    }

    if (sessionBookingTypes.includes("credits")) {
      const user = await User.findById(req.user.id).select("skills").lean();
      const skillName = skill.name?.toLowerCase();
      const userSkill = user?.skills?.find((s) => s.name?.toLowerCase() === skillName);
      const level = userSkill?.level || "beginner";
      const hourlyRate = CREDIT_RATES[level] || CREDIT_RATES.beginner;
      const dur = Number(duration) || 60;
      creditCost = Math.round(hourlyRate * (dur / 60));
      creditSnapshot = { level, hourlyRate, duration: dur };
    }

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
      bookingTypes: sessionBookingTypes,
      creditCost,
      creditSnapshot,
    });

    if (session.sessionType === "online" && !session.meetLink) {
      const suffix = crypto.randomBytes(4).toString("hex");
      session.meetLink = `https://meet.jit.si/skillswap-${session._id}-${suffix}`;
      await session.save();
    }

    createFeedEvent(req.user.id, "session_created", session._id, "Session", {
      title: session.title,
      skillName: skill.name,
    });

    res.status(201).json({
      success: true,
      message: "Session created",
      data: session,
    });


});

// GET CURRENT MENTOR SESSIONS
exports.getMySessions = asyncHandler(async (req, res) => {

    const { page, limit, skip } = getPagination(req.query);

    const [sessions, total] = await Promise.all([
      Session.find({ mentorId: req.user.id })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "skillId",
          populate: { path: "categoryId", select: "name" },
        })
        .populate("mentorId", "name email profileImage trustScore")
        .lean(),
      Session.countDocuments({ mentorId: req.user.id }),
    ]);

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
      total,
      page,
      pages: Math.ceil(total / limit),
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
      filter.$text = { $search: search };
    }

    const sortObj = buildSortObj(sort, search);

    const [sessions, total] = await Promise.all([
      Session.find(filter).sort(sortObj).skip(skip).limit(limit)
        .populate({
          path: "skillId",
          populate: { path: "categoryId", select: "name" },
        })
        .populate("mentorId", "name email profileImage trustScore")
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
      .populate("mentorId", "name email profileImage trustScore")
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




// ── updateSession helpers ────────────────────────────────────────────────

const parseBookingTypes = (value) => {
  if (value === undefined) return undefined;
  let types = Array.isArray(value) ? value : [value];
  if (types.length === 1 && typeof types[0] === "string" && types[0].includes(",")) {
    types = types[0].split(",").map((t) => t.trim());
  }
  types = types.filter((t) => ["paid", "credits"].includes(t));
  if (!types.length) types = ["paid"];
  return types;
};

const applyCreditCost = async (session) => {
  if (!session.bookingTypes?.includes("credits")) {
    session.creditCost = 0;
    session.creditSnapshot = null;
    return;
  }
  const skill = await Skill.findById(session.skillId).lean();
  const user = await User.findById(session.mentorId).select("skills").lean();
  const skillName = skill?.name?.toLowerCase();
  const userSkill = user?.skills?.find((s) => s.name?.toLowerCase() === skillName);
  const level = userSkill?.level || "beginner";
  const hourlyRate = CREDIT_RATES[level] || CREDIT_RATES.beginner;
  const dur = Number(session.duration) || 60;
  session.creditCost = Math.round(hourlyRate * (dur / 60));
  session.creditSnapshot = { level, hourlyRate, duration: dur };
};

const handleThumbnailUpdate = async (req, session) => {
  if (!req.file) return;
  if (session.thumbnailPublicId) {
    await destroyImage(session.thumbnailPublicId).catch(() => {});
  }
  const result = await uploadBuffer(req.file.buffer, {
    public_id: `session_${Date.now()}`,
  });
  session.thumbnail = result.secure_url;
  session.thumbnailPublicId = result.public_id;
};

const refundPaymentForRequest = async (request, price) => {
  if (request.paymentStatus !== "paid" || price <= 0) return {};

  let wallet = await Wallet.findOne({ userId: request.learnerId });
  if (!wallet) wallet = await Wallet.create({ userId: request.learnerId });
  await Transaction.create({
    walletId: wallet._id,
    userId: request.learnerId,
    type: "refund",
    amount: price,
    balanceBefore: wallet.balance,
    balanceAfter: wallet.balance + price,
    reference: String(request._id),
    referenceModel: "Request",
    description: "Refund — session cancelled by mentor",
    status: "completed",
  });
  wallet.balance += price;
  await wallet.save();
  return { paymentStatus: "refunded" };
};

const refundCreditsForRequest = async (request, extraFields = {}) => {
  if (request.bookingSource !== "credits" || request.creditsLocked <= 0) return null;

  const mongoSession = await mongoose.startSession();
  try {
    mongoSession.startTransaction();
    await releaseCredits(request.learnerId, request.creditsLocked, mongoSession);
    await Transaction.create([{
      userId: request.learnerId,
      type: "credit_refunded",
      amount: request.creditsLocked,
      reference: String(request._id),
      referenceModel: "Request",
      description: "Credits refunded — session cancelled by mentor",
      status: "completed",
    }], { session: mongoSession });
    await Request.findByIdAndUpdate(request._id, { requestStatus: "cancelled", creditsLocked: 0, ...extraFields }, { session: mongoSession });
    await mongoSession.commitTransaction();
  } catch (creditErr) {
    await mongoSession.abortTransaction().catch(() => {});
    console.error("Credit release failed:", creditErr.message);
  } finally {
    mongoSession.endSession();
  }
  return { creditsLocked: 0 };
};

const handleCancelledRequests = async (session) => {
  const activeRequests = await Request.find({
    sessionId: session._id,
    requestStatus: { $in: ["pending", "accepted"] },
  }).lean();

  for (const req of activeRequests) {
    const paymentUpdate = await refundPaymentForRequest(req, session.price);
    const updateFields = { requestStatus: "cancelled", ...paymentUpdate };

    const creditUpdate = await refundCreditsForRequest(req, updateFields);
    if (!creditUpdate) {
      await Request.findByIdAndUpdate(req._id, updateFields);
    }
  }

  const affectedUsers = [...new Set(activeRequests.flatMap(r => [r.learnerId?.toString(), r.mentorId?.toString()].filter(Boolean)))];
  affectedUsers.forEach((userId) => recalculateTrustScore(userId).catch((err) => console.error("Trust score recalc failed:", err.message)));
};

const handleCompletedRequests = async (session) => {
  const requests = await Request.find({
    sessionId: session._id,
    requestStatus: { $in: ["pending", "accepted"] },
  }).lean();

  const hasStarted = requests.some((r) => r.startedAt);
  if (!hasStarted) {
    return { revertStatus: true };
  }

  for (const req of requests) {
    const newStatus = req.startedAt ? "completed" : "cancelled";
    await Request.findByIdAndUpdate(req._id, { requestStatus: newStatus });
  }

  const affectedUsers = [...new Set(requests.flatMap(r => [r.learnerId?.toString(), r.mentorId?.toString()].filter(Boolean)))];
  affectedUsers.forEach((userId) => recalculateTrustScore(userId).catch((err) => console.error("Trust score recalc failed:", err.message)));
};

const checkStatusTransition = (session, req) => {
  if (req.body.status === undefined || req.body.status === session.status) return;

  const allowedTransitions = {
    active: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
  };

  if (isAdmin(req)) return;
  if (!allowedTransitions[session.status]?.includes(req.body.status)) {
    return `Cannot change status from "${session.status}" to "${req.body.status}"`;
  }
};

// UPDATE SESSION
exports.updateSession = asyncHandler(async (req, res) => {

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    if (!isAdmin(req) && !idsEqual(session.mentorId, req.user.id)) {
      return res.status(403).json({ success: false, message: "You can only update your own sessions" });
    }

    const transitionErr = checkStatusTransition(session, req);
    if (transitionErr) {
      return res.status(400).json({ success: false, message: transitionErr });
    }

    const oldStatus = session.status;

    const allowedFields = ["title", "description", "price", "date", "time", "duration", "maxLearners", "sessionType", "meetLink", "thumbnail", "status", "bookingTypes"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        session[field] = field === "price" ? Number(req.body[field]) || 0 : req.body[field];
      }
    });
    session.isPaid = session.price > 0;

    const bookingTypes = parseBookingTypes(req.body.bookingTypes);
    if (bookingTypes !== undefined) session.bookingTypes = bookingTypes;

    await applyCreditCost(session);
    await handleThumbnailUpdate(req, session);

    if (req.body.status === "cancelled" && oldStatus === "ongoing") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel an ongoing session. It will auto-complete after its scheduled end time.",
      });
    }

    await session.save();

    if (session.status !== oldStatus) {
      if (session.status === "cancelled") {
        await handleCancelledRequests(session);
      } else if (session.status === "completed") {
        const result = await handleCompletedRequests(session);
        if (result?.revertStatus) {
          session.status = oldStatus;
          await session.save();
          return res.status(400).json({
            success: false,
            message: "Cannot complete — no learners have started this session. Start the session first or let it auto-complete.",
          });
        }
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

    if (session.status === "ongoing") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete an ongoing session. It will auto-complete after its scheduled end time.",
      });
    }

    if (session.thumbnailPublicId) {
      await destroyImage(session.thumbnailPublicId).catch(() => {});
    }

    const pendingRequests = await Request.find({
      sessionId: session._id,
      requestStatus: { $in: ["pending", "accepted"] },
    }).lean();

    for (const req of pendingRequests) {
      if (req.paymentStatus === "paid" && session.price > 0) {
        let wallet = await Wallet.findOne({ userId: req.learnerId });
        if (!wallet) wallet = await Wallet.create({ userId: req.learnerId });
        await Transaction.create({
          walletId: wallet._id,
          userId: req.learnerId,
          type: "refund",
          amount: session.price,
          balanceBefore: wallet.balance,
          balanceAfter: wallet.balance + session.price,
          reference: String(req._id),
          referenceModel: "Request",
          description: "Refund — session deleted by mentor",
          status: "completed",
        });
        wallet.balance += session.price;
        await wallet.save();
      }
    }

    await Promise.all([
      SessionMaterial.deleteMany({ sessionId: session._id }),
      Request.deleteMany({ sessionId: session._id }),
      Wishlist.deleteMany({ sessionId: session._id }),
    ]);

    await session.deleteOne();

    res.json({
      success: true,
      message: "Session deleted",
    });


});

exports.startSessionSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);
  if (!session) {
    return res.status(404).json({ success: false, message: "Session not found" });
  }

  if (!idsEqual(session.mentorId, req.user.id)) {
    return res.status(403).json({ success: false, message: "Only the session mentor can start this session" });
  }

  if (session.status !== "active") {
    return res.status(400).json({ success: false, message: "Session can only be started from active status" });
  }

  const now = new Date();
  const startTime = session.date ? new Date(session.date) : null;
  if (session.time && startTime) {
    const [h, m] = session.time.split(":").map(Number);
    startTime.setHours(h || 0, m || 0, 0, 0);
  }

  if (startTime) {
    const endTime = new Date(startTime.getTime() + (session.duration || 60) * 60000);
    const graceBefore = 5 * 60 * 1000;
    if (now < new Date(startTime.getTime() - graceBefore)) {
      return res.status(400).json({
        success: false,
        message: `Session can only be started within 5 minutes before the scheduled time (${startTime.toLocaleString()})`,
      });
    }
    if (now > endTime) {
      return res.status(400).json({
        success: false,
        message: "Session time has already passed.",
      });
    }
  }

  await Session.findByIdAndUpdate(session._id, { status: "ongoing" });

  const accepted = await Request.find({
    sessionId: session._id,
    requestStatus: "accepted",
  });

  for (const req of accepted) {
    if (!req.startedAt) {
      req.startedAt = now;
      await req.save();
    }
  }

  res.json({
    success: true,
    message: "Session started",
    data: { status: "ongoing", meetLink: session.meetLink, startedCount: accepted.length },
  });
});
