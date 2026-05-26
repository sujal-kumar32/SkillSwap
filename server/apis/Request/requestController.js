const Request = require("./requestModel");
const Session = require("../Session/sessionModel");
const Payment = require("../Payment/paymentModel");
const User = require("../Users/userModel");
const razorpay = require("../../config/razorpay");
const asyncHandler = require("../../utilities/asyncHandler");
const getPagination = require("../../utilities/paginate");
const { sendEmail } = require("../../utilities/emailService");
const { bookingRequestMentorNotification, bookingStatusUpdateLearner } = require("../../utilities/emailTemplates");
const CalendarToken = require("../Calendar/calendarTokenModel");
const { createCalendarEvent, deleteCalendarEvent, refreshAccessToken } = require("../../utilities/calendarService");
const { ensureMeetLink } = require("../../utilities/meetLinkHelper");
const { awardXP } = require("../../services/xpService");

const isAdmin = (req) => req.user?.roles?.includes("admin");
const idsEqual = (left, right) => {
  return left && right && left.toString() === right.toString();
};

// CREATE REQUEST (BOOK SESSION)
exports.createRequest = asyncHandler(async (req, res) => {

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

    const acceptedCount = await Request.countDocuments({
      sessionId: session._id,
      requestStatus: "accepted",
    });

    const maxL = session.maxLearners || 0;
    if (maxL > 0 && acceptedCount >= maxL) {
      return res.status(400).json({
        success: false,
        message: "This group session is fully booked",
      });
    }
    if (maxL === 0 && acceptedCount > 0) {
      return res.status(400).json({
        success: false,
        message: "This 1:1 session already has a confirmed booking",
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

    // Notify mentor
    Promise.all([
      User.findById(req.user.id).select("name"),
      User.findById(session.mentorId).select("name email"),
    ]).then(([learner, mentor]) => {
      if (!mentor?.email) return;
      sendEmail({
        to: mentor.email,
        subject: "New Booking Request",
        html: bookingRequestMentorNotification(mentor.name, learner?.name || "A learner", session.title),
      });
    }).catch((err) => console.error("Booking notification failed:", err.message));

});

// GET ALL REQUESTS
exports.getRequests = asyncHandler(async (req, res) => {

    const { sort, status } = req.query;
    const { page, limit, skip } = getPagination(req.query);

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

});

// GET CURRENT LEARNER BOOKINGS
exports.getMyBookings = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { learnerId: req.user.id };
    const [requests, total] = await Promise.all([
      Request.find(filter).skip(skip).limit(limit)
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
        .lean(),
      Request.countDocuments(filter),
    ]);

    for (const r of requests) {
      if (r.sessionId) await ensureMeetLink(r.sessionId);
    }

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: requests,
    });

});

// GET BOOKINGS FOR THE CURRENT MENTOR
exports.getMentorBookings = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { mentorId: req.user.id };
    const [requests, total] = await Promise.all([
      Request.find(filter).skip(skip).limit(limit)
        .populate({
          path: "sessionId",
          populate: { path: "skillId", select: "name categoryId" },
        })
        .populate("learnerId", "name email profileImage")
        .populate("mentorId", "name email profileImage")
        .sort({ createdAt: -1 })
        .lean(),
      Request.countDocuments(filter),
    ]);

    for (const r of requests) {
      if (r.sessionId) await ensureMeetLink(r.sessionId);
    }

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: requests,
    });

});

// GET UNIQUE LEARNERS FOR THE CURRENT MENTOR
exports.getMentorLearners = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {
      mentorId: req.user.id,
      requestStatus: { $in: ["accepted", "completed"] },
    };
    const [requests, totalRequests] = await Promise.all([
      Request.find(filter)
        .populate({
          path: "sessionId",
          select: "title skillId",
          populate: { path: "skillId", select: "name" },
        })
        .populate("learnerId", "name email profileImage")
        .sort({ updatedAt: -1 })
        .lean(),
      Request.countDocuments(filter),
    ]);

    const allLearners = Array.from(
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

    const total = allLearners.length;
    const data = allLearners.slice(skip, skip + limit);

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data,
    });

});

// UPDATE REQUEST STATUS (MENTOR APPROVE/REJECT, LEARNER CANCEL)
exports.updateRequestStatus = asyncHandler(async (req, res) => {

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

    if (status === "accepted") {
      const session = await Session.findById(request.sessionId).select("maxLearners").lean();
      if (session) {
        const acceptedCount = await Request.countDocuments({
          sessionId: request.sessionId,
          requestStatus: "accepted",
        });
        const maxL = session.maxLearners || 0;
        if (maxL > 0 && acceptedCount >= maxL) {
          return res.status(400).json({
            success: false,
            message: "This group session is fully booked",
          });
        }
        if (maxL === 0 && acceptedCount > 0) {
          return res.status(400).json({
            success: false,
            message: "This 1:1 session already has a confirmed booking",
          });
        }
      }
    }

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

    let xpResult = null;
    if (status === "completed") {
      try {
        const [learnerXp, mentorXp] = await Promise.all([
          awardXP(request.learnerId, 50, "Session completed", request._id, "Request"),
          awardXP(request.mentorId, 30, "Mentored a session", request._id, "Request"),
        ]);
        xpResult = {
          learner: { xpGained: learnerXp.xpGained, totalXp: learnerXp.xp, newBadges: learnerXp.newBadges },
          mentor: { xpGained: mentorXp.xpGained, totalXp: mentorXp.xp, newBadges: mentorXp.newBadges },
        };
      } catch (xpErr) {
        console.error("XP award failed:", xpErr.message);
      }
    }

    res.json({
      success: true,
      message: `Request ${status}`,
      data: request,
      refund: refundInfo,
      ...(xpResult && { xp: xpResult }),
    });

    // Notify learner on accepted/rejected/cancelled
    if (["accepted", "rejected", "cancelled", "completed"].includes(status)) {
      Promise.all([
        Session.findById(request.sessionId).select("title"),
        User.findById(request.learnerId).select("name email"),
      ]).then(([session, learner]) => {
        if (!learner?.email) return;
        sendEmail({
          to: learner.email,
          subject: status === "accepted" ? "Booking Confirmed!" : `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          html: bookingStatusUpdateLearner(learner.name, session?.title || "Session", status),
        });
      }).catch((err) => console.error("Status notification failed:", err.message));
    }

    // Sync Google Calendar events
    if (["accepted", "cancelled"].includes(status) && request.mentorId) {
      const token = await CalendarToken.findOne({ userId: request.mentorId }).lean();
      if (token) {
        const sessionWithMeta = await Session.findById(request.sessionId)
          .populate("mentorId", "name email")
          .select("title date time duration description meetLink")
          .lean()
          .catch(() => null);

        if (sessionWithMeta) {
          try {
            if (status === "accepted") {
              const startTime = sessionWithMeta.date
                ? new Date(sessionWithMeta.date)
                : new Date();
              if (sessionWithMeta.time) {
                const [h, m] = sessionWithMeta.time.split(":").map(Number);
                startTime.setHours(h || 0, m || 0, 0, 0);
              }
              const endTime = new Date(startTime);
              endTime.setMinutes(endTime.getMinutes() + (sessionWithMeta.duration || 60));

              const event = await createCalendarEvent({
                accessToken: token.accessToken,
                refreshToken: token.refreshToken,
                summary: `SkillSwap: ${sessionWithMeta.title}`,
                description: `${sessionWithMeta.description || "SkillSwap learning session"}\n\nMeeting: ${sessionWithMeta.meetLink || "TBD"}`,
                startDateTime: startTime.toISOString(),
                endDateTime: endTime.toISOString(),
                timeZone: "UTC",
                attendeeEmails: [sessionWithMeta.mentorId?.email].filter(Boolean),
              });
              if (event?.id) {
                request.calendarEventId = event.id;
                await request.save();
              }
            } else if (status === "cancelled" && request.calendarEventId) {
              await deleteCalendarEvent({
                accessToken: token.accessToken,
                refreshToken: token.refreshToken,
                eventId: request.calendarEventId,
              });
            }
          } catch (calErr) {
            console.error("Calendar sync failed for mentor", calErr.message);
          }
        }
      }
    }

});

// DELETE REQUEST
exports.deleteRequest = asyncHandler(async (req, res) => {
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

});
