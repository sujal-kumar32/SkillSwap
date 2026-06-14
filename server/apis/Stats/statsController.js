const User = require("../Users/userModel");
const Session = require("../Session/sessionModel");
const Request = require("../Request/requestModel");
const Skill = require("../Skills/skillModel");
const asyncHandler = require("../../utilities/asyncHandler");

exports.getPublicStats = asyncHandler(async (req, res) => {
  const [totalMentors, totalLearners, totalSessions, totalCompleted, totalSkills] = await Promise.all([
    User.countDocuments({ roles: "mentor", status: "active" }),
    User.countDocuments({ roles: "learner", status: "active" }),
    Session.countDocuments({ status: "active" }),
    Request.countDocuments({ requestStatus: "completed" }),
    Skill.countDocuments({ status: "approved", isDeleted: { $ne: true } }),
  ]);

  res.json({
    success: true,
    data: { totalMentors, totalLearners, totalSessions, totalCompleted, totalSkills },
  });
});
