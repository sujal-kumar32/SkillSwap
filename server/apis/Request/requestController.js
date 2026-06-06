const mongoose = require("mongoose");
const Request = require("./requestModel");
const Session = require("../Session/sessionModel");
const Payment = require("../Payment/paymentModel");
const User = require("../Users/userModel");
const Wallet = require("../Wallet/walletModel");
const Transaction = require("../Wallet/transactionModel");
const razorpay = require("../../config/razorpay");
const asyncHandler = require("../../utilities/asyncHandler");
const getPagination = require("../../utilities/paginate");
const { sendEmail } = require("../../utilities/emailService");
const { bookingRequestMentorNotification, bookingStatusUpdateLearner } = require("../../utilities/emailTemplates");
const CalendarToken = require("../Calendar/calendarTokenModel");
const { createCalendarEvent, deleteCalendarEvent, refreshAccessToken } = require("../../utilities/calendarService");
const { ensureMeetLink } = require("../../utilities/meetLinkHelper");
const { awardXP } = require("../../services/xpService");
const { sendNotification } = require("../../services/notificationService");
const { calculateCreditCost, lockCredits, releaseCredits, transferCredits } = require("../../services/creditService");
const { recalculateTrustScore } = require("../../services/trustService");

const isAdmin = (req) => req.user?.roles?.includes("admin");
const idsEqual = (left, right) => {
  return left && right && left.toString() === right.toString();
};

// CREATE REQUEST (BOOK SESSION)
exports.createRequest = asyncHandler(async (req, res) => {

    const { sessionId, note, bookingSource } = req.body;

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

    let creditsLocked = 0;
    let mentorSnapshot = { trust: 100, rating: 0 };

    if (bookingSource === "credits") {
      if (!session.bookingTypes?.includes("credits")) {
        return res.status(400).json({
          success: false,
          message: "This session does not accept credit bookings",
        });
      }

      const creditCost = calculateCreditCost(session);
      if (creditCost <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid credit cost for this session",
        });
      }

      const mongoSession = await mongoose.startSession();
      try {
        mongoSession.startTransaction();
        await lockCredits(req.user.id, creditCost, mongoSession);
        const mentor = await User.findById(session.mentorId).select("trustScore").lean();
        mentorSnapshot = {
          trust: mentor?.trustScore ?? 100,
          rating: 0,
        };
        const [request] = await Request.create([{
          sessionId,
          learnerId: req.user.id,
          mentorId: session.mentorId,
          note,
          bookingSource: "credits",
          creditsLocked: creditCost,
          mentorTrustAtBooking: mentorSnapshot.trust,
          mentorRatingAtBooking: mentorSnapshot.rating,
          paymentStatus: "pending",
        }], { session: mongoSession });
        await mongoSession.commitTransaction();
        creditsLocked = creditCost;

        User.findById(req.user.id).select("name").lean().then((learner) => {
          sendNotification(session.mentorId, req.user.id, "booking_request", `${learner?.name || "A learner"} booked "${session.title}"`, `/mentor/bookings`);
        });

        User.findById(req.user.id).select("name").lean().then((learner) => {
          sendNotification(session.mentorId, req.user.id, "booking_request", `${learner?.name || "A learner"} booked "${session.title}"`, `/mentor/bookings`);
        });

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

        return res.status(201).json({
          success: true,
          message: "Session booked successfully",
          data: request,
        });
      } catch (err) {
        await mongoSession.abortTransaction().catch(() => {});
        return res.status(500).json({
          success: false,
          message: "Booking failed: " + err.message,
        });
      } finally {
        mongoSession.endSession();
      }
    }

    const request = await Request.create({
      sessionId,
      learnerId: req.user.id,
      mentorId: session.mentorId,
      note,
      bookingSource: "paid",
      creditsLocked: 0,
      mentorTrustAtBooking: 100,
      mentorRatingAtBooking: 0,
      paymentStatus: session.price ? "pending" : "paid",
    });

    User.findById(req.user.id).select("name").lean().then((learner) => {
      sendNotification(session.mentorId, req.user.id, "booking_request", `${learner?.name || "A learner"} booked "${session.title}"`, `/mentor/bookings`);
    });

    res.status(201).json({
      success: true,
      message: "Session booked successfully",
      data: request,
    });

    // Notify mentor by email
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
        .populate("mentorId", "name email profileImage trustScore")
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

    if (req.query.status) {
      const statuses = req.query.status.split(",").map((s) => s.trim()).filter(Boolean);
      if (statuses.length === 1) filter.requestStatus = statuses[0];
      else if (statuses.length > 1) filter.requestStatus = { $in: statuses };
    }

    const queryBuilder = Request.find(filter).skip(skip).limit(limit)
      .populate({
        path: "sessionId",
        populate: [
          { path: "skillId", populate: { path: "categoryId", select: "name" } },
          { path: "mentorId", select: "name email profileImage" },
        ],
      })
      .populate("learnerId", "name email profileImage")
      .populate("mentorId", "name email profileImage trustScore")
      .sort({ createdAt: -1 })
      .lean();

    const [requests, total] = await Promise.all([
      queryBuilder,
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
        .populate("mentorId", "name email profileImage trustScore")
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
    const validStatuses = ["pending", "accepted", "rejected", "completed", "cancelled", "disputed"];

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
      accepted: ["completed", "cancelled", "disputed"],
      completed: [],
      cancelled: [],
      disputed: [],
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

    if ((status === "rejected" || status === "cancelled") && request.paymentStatus === "paid" && request.bookingSource !== "credits") {
      const sessionDoc = await Session.findById(request.sessionId).select("status date duration").lean();
      if (sessionDoc?.status === "ongoing") {
        return res.status(400).json({
          success: false,
          message: "Cannot cancel or reject — session is already ongoing. The session will auto-complete after its scheduled end time.",
        });
      }
    }

    request.requestStatus = status;
    await request.save();

    let refundInfo = null;
    if ((status === "rejected" || status === "cancelled") && request.paymentStatus === "paid") {
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

        if (!payment) {
          const Wallet = require("../Wallet/walletModel");
          const Transaction = require("../Wallet/transactionModel");
          const sesh = await Session.findById(request.sessionId);
          const price = sesh?.price || 0;
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
            description: "Refund for rejected booking",
            status: "completed",
          });
          wallet.balance += price;
          await wallet.save();
          request.paymentStatus = "refunded";
          await request.save();
          refundInfo = { refundStatus: "processed", method: "wallet" };
        }
      } catch (refundErr) {
        console.error("Auto-refund failed:", refundErr.message);
      }
    }

    let creditRefundInfo = null;
    if ((status === "rejected" || status === "cancelled") && request.bookingSource === "credits" && request.creditsLocked > 0) {
      const mongoSession = await mongoose.startSession();
      try {
        mongoSession.startTransaction();
        await releaseCredits(request.learnerId, request.creditsLocked, mongoSession);
        const wallet = await Wallet.findOne({ userId: request.learnerId }).session(mongoSession);
        if (wallet) {
          await Transaction.create([{
            walletId: wallet._id,
            userId: request.learnerId,
            type: "credit_refunded",
            amount: request.creditsLocked,
            balanceBefore: wallet.skillCredits - request.creditsLocked,
            balanceAfter: wallet.skillCredits,
            reference: String(request._id),
            referenceModel: "Request",
            referenceType: "request",
            description: "Credits refunded for cancelled booking",
            status: "completed",
          }], { session: mongoSession });
        }
        const releasedAmount = request.creditsLocked;
        request.creditsLocked = 0;
        await request.save({ session: mongoSession });
        await mongoSession.commitTransaction();
        creditRefundInfo = { creditsReleased: releasedAmount };
      } catch (creditErr) {
        await mongoSession.abortTransaction().catch(() => {});
        console.error("Credit release failed:", creditErr.message);
      } finally {
        mongoSession.endSession();
      }
    }

    let xpResult = null;
    let walletResult = null;
    let creditResult = null;
    if (status === "completed" && request.startedAt) {
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

      if (request.paymentStatus === "paid" && request.bookingSource !== "credits") {
        try {
          const Session = require("../Session/sessionModel");
          const Wallet = require("../Wallet/walletModel");
          const Transaction = require("../Wallet/transactionModel");
          const sessionDoc = await Session.findById(request.sessionId);
          const price = sessionDoc?.price || 0;
          if (price > 0) {
            let wallet = await Wallet.findOne({ userId: request.mentorId });
            if (!wallet) wallet = await Wallet.create({ userId: request.mentorId });
            await Transaction.create({
              walletId: wallet._id,
              userId: request.mentorId,
              type: "earning",
              amount: price,
              balanceBefore: wallet.balance,
              balanceAfter: wallet.balance + price,
              reference: String(request._id),
              referenceModel: "Request",
              description: `Earnings from session completion`,
              status: "completed",
            });
            wallet.balance += price;
            wallet.totalEarned += price;
            await wallet.save();
            walletResult = { amount: price };
          }
        } catch (walletErr) {
          console.error("Wallet credit failed for request", request._id, ":", walletErr.message);
          walletResult = { error: walletErr.message };
        }
      }

      if (request.bookingSource === "credits" && request.creditsLocked > 0) {
        const mongoSession = await mongoose.startSession();
        try {
          mongoSession.startTransaction();
          await transferCredits(request.learnerId, request.mentorId, request.creditsLocked, request._id, mongoSession);
          creditResult = { creditsTransferred: request.creditsLocked };
          request.creditsLocked = 0;
          await request.save({ session: mongoSession });
          await mongoSession.commitTransaction();
        } catch (creditErr) {
          await mongoSession.abortTransaction().catch(() => {});
          console.error("Credit transfer failed:", creditErr.message);
          creditResult = { error: creditErr.message };
        } finally {
          mongoSession.endSession();
        }
      }
    }

    // Session counter updates
    if (status === "completed") {
      await Promise.all([
        User.findByIdAndUpdate(request.learnerId, { $inc: { totalCompletedSessions: 1, totalBookings: 1 } }),
        User.findByIdAndUpdate(request.mentorId, { $inc: { totalCompletedSessions: 1, totalBookings: 1 } }),
      ]);
    } else if (status === "cancelled" || status === "rejected") {
      await Promise.all([
        User.findByIdAndUpdate(request.learnerId, { $inc: { totalCancelledSessions: 1, totalBookings: 1 } }),
        User.findByIdAndUpdate(request.mentorId, { $inc: { totalCancelledSessions: 1, totalBookings: 1 } }),
      ]);
    }

    // Trust score updates
    if (["completed", "cancelled", "rejected"].includes(status)) {
      Promise.all([
        recalculateTrustScore(request.learnerId),
        recalculateTrustScore(request.mentorId),
      ]).catch((err) => console.error("Trust score update failed:", err.message));
    }

    res.json({
      success: true,
      message: `Request ${status}`,
      data: request,
      refund: refundInfo,
      ...(xpResult && { xp: xpResult }),
      ...(walletResult && { wallet: walletResult }),
      ...(creditResult && { credit: creditResult }),
      ...(creditRefundInfo && { creditRefund: creditRefundInfo }),
    });

    // Notify learner on accepted/rejected/cancelled
    if (["accepted", "rejected", "cancelled", "completed"].includes(status)) {
      Promise.all([
        Session.findById(request.sessionId).select("title"),
        User.findById(request.learnerId).select("name email"),
      ]).then(([s, learner]) => {
        if (learner?.email) {
          sendEmail({
            to: learner.email,
            subject: status === "accepted" ? "Booking Confirmed!" : `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            html: bookingStatusUpdateLearner(learner.name, s?.title || "Session", status),
          });
        }
        const title = s?.title || "Session";
        if (status === "accepted") {
          sendNotification(request.learnerId, request.mentorId, "booking_accepted", `Your booking for "${title}" was accepted`, `/learner/bookings`);
        } else if (status === "completed") {
          sendNotification(request.learnerId, request.mentorId, "booking_completed", `Your session "${title}" is completed`, `/learner/bookings`);
        }
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

// DISPUTE A REQUEST
exports.disputeRequest = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (!request) {
    return res.status(404).json({ success: false, message: "Request not found" });
  }

  const isLearner = idsEqual(request.learnerId, req.user.id);
  const isMentor = idsEqual(request.mentorId, req.user.id);
  if (!isLearner && !isMentor && !isAdmin(req)) {
    return res.status(403).json({ success: false, message: "Only participants can dispute a booking" });
  }

  if (request.requestStatus !== "accepted") {
    return res.status(400).json({ success: false, message: "Only accepted bookings can be disputed" });
  }

  request.requestStatus = "disputed";
  await request.save();

  sendNotification(
    isAdmin(req) ? request.mentorId : req.user.id,
    req.user.id,
    "dispute_opened",
    `A dispute was opened for booking #${request._id}`,
    `/admin/disputes`
  );

  res.json({ success: true, message: "Dispute raised", data: request });
});

exports.startSession = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id).populate("sessionId");
  if (!request) {
    return res.status(404).json({ success: false, message: "Request not found" });
  }

  if (!idsEqual(request.mentorId, req.user.id)) {
    return res.status(403).json({ success: false, message: "Only the session mentor can start the session" });
  }

  if (request.requestStatus !== "accepted") {
    return res.status(400).json({ success: false, message: "Session can only be started after the request is accepted" });
  }

  if (request.startedAt) {
    return res.status(400).json({ success: false, message: "Session already started" });
  }

  const session = request.sessionId;
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
        message: "Session time has already passed. Please contact support if you still need to conduct this session.",
      });
    }
  }

  request.startedAt = now;
  await request.save();

  res.json({
    success: true,
    message: "Session started",
    data: { startedAt: request.startedAt, meetLink: session.meetLink },
  });
});
