const Session = require("./sessionModel");
const Skill = require("../Skills/skillModel");
const Request = require("../Request/requestModel");
const { uploadBuffer, destroyImage } = require("../../utilities/cloudinaryUpload");

const isAdmin = (req) => req.user?.roles?.includes("admin");
const idsEqual = (left, right) => {
  return left && right && left.toString() === right.toString();
};

// CREATE SESSION
exports.createSession = async (req, res) => {
  try {
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

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// GET CURRENT MENTOR SESSIONS
exports.getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({ mentorId: req.user.id })
      .populate({
        path: "skillId",
        populate: { path: "categoryId", select: "name" },
      })
      .populate("mentorId", "name email")
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
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



// GET ALL SESSIONS
exports.getSessions = async (req, res) => {
  try {
    const { search, sort } = req.query;
    const limit = req.query.limit ? Math.min(100, Math.max(1, parseInt(req.query.limit))) : 100000;
    const page = req.query.page ? Math.max(1, parseInt(req.query.page)) : 1;
    const skip = (page - 1) * limit;

    let filter = isAdmin(req) ? {} : { status: "active" };

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
    else if (sort === "name") sortObj = { title: 1 };
    else sortObj = { createdAt: -1 };

    const [sessions, total] = await Promise.all([
      Session.find(filter).sort(sortObj).skip(skip).limit(limit)
        .populate({
          path: "skillId",
          populate: { path: "categoryId", select: "name" },
        })
        .populate("mentorId", "name email")
        .lean(),
      Session.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: sessions,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



// GET SINGLE SESSION
exports.getSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate("skillId")
      .populate("mentorId", "name email")
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

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



// UPDATE SESSION
exports.updateSession = async (req, res) => {
  try {
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

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



// DELETE SESSION
exports.deleteSession = async (req, res) => {
  try {
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

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
