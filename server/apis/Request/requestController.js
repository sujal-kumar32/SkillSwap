const Request = require("./requestModel");
const Session = require("../Session/sessionModel");

const isAdmin = (req) => req.user?.roles?.includes("admin");
const idsEqual = (left, right) => {
  return left && right && left.toString() === right.toString();
};

// CREATE REQUEST (BOOK SESSION)
exports.createRequest = async (req, res) => {
  try {
    const { sessionId, date, timeSlot } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "sessionId is required",
      });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (session.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "This session is not available for booking",
      });
    }

    if (idsEqual(session.mentorId, req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot book your own session",
      });
    }

    const request = await Request.create({
      sessionId,
      learnerId: req.user.id,
      mentorId: session.mentorId,
      date,
      timeSlot,
    });

    res.status(201).json({
      success: true,
      message: "Session booked successfully",
      data: request,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// GET ALL REQUESTS
exports.getRequests = async (req, res) => {
  try {
    const filter = isAdmin(req)
      ? {}
      : {
          $or: [{ learnerId: req.user.id }, { mentorId: req.user.id }],
        };

    const requests = await Request.find(filter)
      .populate("sessionId")
      .populate("learnerId", "name email")
      .populate("mentorId", "name email")
      .lean();

    res.json({
      success: true,
      total: requests.length,
      data: requests,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// UPDATE REQUEST STATUS (ACCEPT/REJECT)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "accepted", "rejected", "completed"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request status",
      });
    }

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (!isAdmin(req) && !idsEqual(request.mentorId, req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Only the session mentor or admin can update this request",
      });
    }

    request.requestStatus = status;
    await request.save();

    res.json({
      success: true,
      message: "Request updated",
      data: request,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// DELETE REQUEST
exports.deleteRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    const relatedUser =
      idsEqual(request.learnerId, req.user.id) ||
      idsEqual(request.mentorId, req.user.id);

    if (!isAdmin(req) && !relatedUser) {
      return res.status(403).json({
        success: false,
        message: "You can only delete requests related to you",
      });
    }

    await request.deleteOne();

    res.json({
      success: true,
      message: "Request deleted",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
