const asyncHandler = require("../../utilities/asyncHandler");
const MentorApplication = require("../MentorApplication/mentorApplicationModel");
const Skill = require("../Skills/skillModel");
const Request = require("../Request/requestModel");
const Dispute = require("../Dispute/disputeModel");
const Review = require("../Reviews/reviewModel");

exports.getSidebarCounts = asyncHandler(async (req, res) => {
  const user = req.user;
  const counts = {};

  if (user.roles.includes("admin")) {
    const [pendingMentorApps, pendingSkills, openDisputes] = await Promise.all([
      MentorApplication.countDocuments({ status: "pending" }),
      Skill.countDocuments({ status: "pending", isDeleted: { $ne: true } }),
      Dispute.countDocuments({ status: { $in: ["open", "under_review"] } }),
    ]);
    counts.pendingMentorApps = pendingMentorApps;
    counts.pendingSkills = pendingSkills;
    counts.openDisputes = openDisputes;
  }

  if (user.roles.includes("mentor")) {
    const pendingBookings = await Request.countDocuments({
      mentorId: user.id,
      requestStatus: "pending",
    });
    counts.pendingBookings = pendingBookings;
  }

  if (user.roles.includes("learner")) {
    const [bookingUpdates, completedSessions, existingReviews] = await Promise.all([
      Request.countDocuments({
        learnerId: user.id,
        requestStatus: { $in: ["accepted", "completed"] },
      }),
      Request.countDocuments({
        learnerId: user.id,
        requestStatus: "completed",
      }),
      Review.countDocuments({ learnerId: user.id }),
    ]);
    counts.bookingUpdates = bookingUpdates;
    counts.pendingReviews = Math.max(0, completedSessions - existingReviews);
  }

  res.json({ success: true, data: counts });
});
