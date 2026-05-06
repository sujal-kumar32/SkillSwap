const Session = require("./sessionModel");
const Skill = require("../Skills/skillModel");

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
      sessionType,
      meetLink,
      thumbnail,
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
      sessionType,
      meetLink,
      thumbnail,
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



// GET ALL SESSIONS
exports.getSessions = async (req, res) => {
  try {
    const filter = isAdmin(req) ? {} : { status: "active" };

    const sessions = await Session.find(filter)
      .populate({
        path: "skillId",
        populate: { path: "categoryId", select: "name" },
      })
      .populate("mentorId", "name email")
      .lean();

    res.json({
      success: true,
      total: sessions.length,
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
