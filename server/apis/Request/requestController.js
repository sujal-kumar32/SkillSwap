const Request = require("./requestModel");
const Session = require("../Session/sessionModel");
const Payment = require("../Payment/paymentModel");
const razorpay = require("../../config/razorpay");

const isAdmin = (req) => req.user?.roles?.includes("admin");
const idsEqual = (left, right) => {
  return left && right && left.toString() === right.toString();
};

// CREATE REQUEST (BOOK SESSION)
exports.createRequest = async (req, res) => {
  try {
    const { sessionId, note } = req.body;

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
      note,
      paymentStatus: session.price ? "pending" : "paid",
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
    const { sort, status } = req.query;
    const limit = req.query.limit ? Math.min(100, Math.max(1, parseInt(req.query.limit))) : 100000;
    const page = req.query.page ? Math.max(1, parseInt(req.query.page)) : 1;
    const skip = (page - 1) * limit;

    let filter = isAdmin(req)
      ? {}
      : {
          $or: [{ learnerId: req.user.id }, { mentorId: req.user.id }],
        };

    if (status) {
      filter.requestStatus = status;
    }

    let sortObj = {};
    if (sort === "latest" || sort === "newest") sortObj = { createdAt: -1 };
    else if (sort === "oldest") sortObj = { createdAt: 1 };
    else sortObj = { createdAt: -1 };

    const [requests, total] = await Promise.all([
      Request.find(filter).sort(sortObj).skip(skip).limit(limit)
        .populate("sessionId")
        .populate("learnerId", "name email profileImage")
        .populate("mentorId", "name email profileImage")
        .lean(),
      Request.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: requests,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// GET CURRENT LEARNER BOOKINGS
exports.getMyBookings = async (req, res) => {
  try {
    const requests = await Request.find({ learnerId: req.user.id })
      .populate({
        path: "sessionId",
        populate: [
          { path: "skillId", populate: { path: "categoryId", select: "name" } },
          { path: "mentorId", select: "name email profileImage" },
        ],
      })
      .populate("learnerId", "name email profileImage")
      .populate("mentorId", "name email profileImage")
      .sort({ createdAt: -1 })
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

// GET BOOKINGS FOR THE CURRENT MENTOR
exports.getMentorBookings = async (req, res) => {
  try {
    const requests = await Request.find({ mentorId: req.user.id })
      .populate({
        path: "sessionId",
        populate: { path: "skillId", select: "name categoryId" },
      })
      .populate("learnerId", "name email profileImage")
      .populate("mentorId", "name email profileImage")
      .sort({ createdAt: -1 })
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

// GET UNIQUE LEARNERS FOR THE CURRENT MENTOR
exports.getMentorLearners = async (req, res) => {
  try {
    const requests = await Request.find({
      mentorId: req.user.id,
      requestStatus: { $in: ["accepted", "completed"] },
    })
      .populate({
        path: "sessionId",
        select: "title skillId",
        populate: { path: "skillId", select: "name" },
      })
      .populate("learnerId", "name email profileImage")
      .sort({ updatedAt: -1 })
      .lean();

    const learners = Array.from(
      requests
        .reduce((map, request) => {
          const learner = request.learnerId;
          if (!learner?._id) return map;

          const learnerId = learner._id.toString();
          const existing = map.get(learnerId) || {
            _id: learnerId,
            name: learner.name,
            email: learner.email,
            profileImage: learner.profileImage || "",
            sessions: 0,
            skills: new Set(),
            lastSession: null,
          };

          existing.sessions += 1;
          if (request.sessionId?.skillId?.name) {
            existing.skills.add(request.sessionId.skillId.name);
          }
          existing.lastSession = existing.lastSession || request.sessionId?.title;

          map.set(learnerId, existing);
          return map;
        }, new Map())
        .values(),
    ).map((learner) => ({
      ...learner,
      skills: Array.from(learner.skills),
      progress: Math.min(100, learner.sessions * 20),
    }));

    res.json({
      success: true,
      total: learners.length,
      data: learners,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// UPDATE REQUEST STATUS (MENTOR APPROVE/REJECT, LEARNER CANCEL)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "accepted", "rejected", "completed", "cancelled"];

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

    const allowedTransitions = {
      pending: ["accepted", "rejected", "cancelled"],
      accepted: ["completed", "cancelled"],
      rejected: [],
      completed: [],
      cancelled: [],
    };

    if (!allowedTransitions[request.requestStatus]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from "${request.requestStatus}" to "${status}"`,
      });
    }

    const isMentorOwner = idsEqual(request.mentorId, req.user.id);
    const learnerCancelling =
      status === "cancelled" && idsEqual(request.learnerId, req.user.id);

    if (status === "accepted" || status === "rejected") {
      if (!isMentorOwner) {
        return res.status(403).json({
          success: false,
          message: "Only the session mentor can approve or reject requests",
        });
      }
    } else if (status === "completed") {
      if (!isMentorOwner) {
        return res.status(403).json({
          success: false,
          message: "Only the session mentor can mark requests as completed",
        });
      }
    } else if (status === "cancelled") {
      if (!isMentorOwner && !learnerCancelling) {
        return res.status(403).json({
          success: false,
          message: "Only the session mentor or the learner who booked can cancel",
        });
      }
    }

    request.requestStatus = status;
    await request.save();

    let refundInfo = null;
    if (status === "rejected" && request.paymentStatus === "paid") {
      try {
        const payment = await Payment.findOne({ requestId: request._id, paymentStatus: "success" });
        if (payment && payment.razorpayPaymentId) {
          payment.refundStatus = "initiated";
          payment.paymentStatus = "refund_initiated";
          await payment.save();

          const refundRes = await razorpay.payments.refund(payment.razorpayPaymentId, {
            amount: Math.round(payment.amount * 100),
            notes: { requestId: String(request._id), reason: "Mentor rejected booking" },
          });

          payment.refundId = refundRes.id;
          payment.refundStatus = "processed";
          payment.paymentStatus = "refunded";
          payment.refundedAt = new Date();
          await payment.save();

          request.paymentStatus = "refunded";
          await request.save();
          refundInfo = { refundId: refundRes.id, refundStatus: "processed" };
        } else if (payment) {
          payment.paymentStatus = "refunded";
          payment.refundStatus = "processed";
          payment.refundedAt = new Date();
          await payment.save();
          request.paymentStatus = "refunded";
          await request.save();
          refundInfo = { refundStatus: "processed", note: "No Razorpay ID — marked refunded" };
        }
      } catch (refundErr) {
        console.error("Auto-refund failed:", refundErr.message);
      }
    }

    res.json({
      success: true,
      message: `Request ${status}`,
      data: request,
      refund: refundInfo,
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
