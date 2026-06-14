const User = require("../Users/userModel");
const Session = require("../Session/sessionModel");
const Request = require("../Request/requestModel");
const asyncHandler = require("../../utilities/asyncHandler");

exports.getPublicStats = asyncHandler(async (req, res) => {
  const [totalMentors, totalLearners, totalSessions, totalCompleted] = await Promise.all([
    User.countDocuments({ roles: "mentor", status: "active" }),
    User.countDocuments({ roles: "learner", status: "active" }),
    Session.countDocuments({ status: "active" }),
    Request.countDocuments({ requestStatus: "completed" }),
  ]);

  res.json({
    success: true,
    data: { totalMentors, totalLearners, totalSessions, totalCompleted },
  });
});
