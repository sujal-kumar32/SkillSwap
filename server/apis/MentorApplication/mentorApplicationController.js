const MentorApplication = require("./mentorApplicationModel");
const User = require("../Users/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../../utilities/asyncHandler");
const getPagination = require("../../utilities/paginate");

const SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

exports.applyForMentor = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user.id);

    if (user.roles.includes("mentor")) {
      return res.json({ success: false, message: "Already a mentor" });
    }

    const blocked = await MentorApplication.findOne({
      userId: req.user.id,
      status: "blocked",
    });
    if (blocked) {
      return res.status(403).json({
        success: false,
        message: "Your mentor access has been blocked by admin",
      });
    }

    const { skills, experience, bio, category, portfolioLink } = req.body;

    if (!skills || !experience) {
      return res.status(400).json({
        success: false,
        message: "Skills and experience are required",
      });
    }

    await MentorApplication.create({
      userId: req.user.id,
      fullName: user.name,
      email: user.email,
      skills,
      experience,
      bio: bio || user.bio || "",
      category: category || "",
      portfolioLink: portfolioLink || "",
      status: "approved",
    });

    if (!user.roles.includes("mentor")) {
      user.roles.push("mentor");
    }
    await user.save();

    const token = jwt.sign(
      { id: user._id, roles: user.roles },
      SECRET,
      { expiresIn: TOKEN_EXPIRES_IN },
    );

    res.json({
      success: true,
      message: "You are now a mentor!",
      token,
      data: { id: user._id, roles: user.roles, status: "approved" },
    });

});

exports.getMyApplication = asyncHandler(async (req, res) => {

    const application = await MentorApplication.findOne({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    if (!application) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: application });

});

exports.getAllApplications = asyncHandler(async (req, res) => {

    const { status, userId } = req.query;
    const { page, limit, skip } = getPagination(req.query);
    let filter = {};
    if (status && ["pending", "approved", "rejected", "blocked"].includes(status)) {
      filter.status = status;
    }
    if (userId) {
      filter.userId = userId;
    }

    const [applications, total] = await Promise.all([
      MentorApplication.find(filter).skip(skip).limit(limit)
        .populate("userId", "name email profileImage")
        .populate("reviewedBy", "name")
        .sort({ createdAt: -1 })
        .lean(),
      MentorApplication.countDocuments(filter),
    ]);

    res.json({ success: true, total, page, pages: Math.ceil(total / limit), data: applications });

});

exports.approveApplication = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { adminRemarks } = req.body;

    const application = await MentorApplication.findById(id);
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (application.status !== "pending") {
      return res.json({ success: false, message: `Application already ${application.status}` });
    }

    const user = await User.findById(application.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.roles.includes("mentor")) {
      user.roles.push("mentor");
    }
    await user.save();

    application.status = "approved";
    application.adminRemarks = adminRemarks || "";
    application.reviewedBy = req.user.id;
    application.reviewedAt = new Date();
    await application.save();

    res.json({
      success: true,
      message: "Mentor application approved",
      data: { status: "approved" },
    });

});

exports.rejectApplication = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { adminRemarks } = req.body;

    const application = await MentorApplication.findById(id);
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (application.status !== "pending") {
      return res.json({ success: false, message: `Application already ${application.status}` });
    }

    application.status = "rejected";
    application.adminRemarks = adminRemarks || "";
    application.reviewedBy = req.user.id;
    application.reviewedAt = new Date();
    await application.save();

    res.json({
      success: true,
      message: "Mentor application rejected",
      data: { status: "rejected" },
    });

});

exports.removeMentor = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const application = await MentorApplication.findById(id);
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    const user = await User.findById(application.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.roles = user.roles.filter((r) => r !== "mentor");
    await user.save();

    application.status = "blocked";
    application.adminRemarks = "Mentor role removed by admin";
    application.reviewedBy = req.user.id;
    application.reviewedAt = new Date();
    await application.save();

    res.json({
      success: true,
      message: "Mentor role removed and blocked",
      data: { status: "blocked" },
    });

});

exports.unblockMentor = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const application = await MentorApplication.findById(id);
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (application.status !== "blocked") {
      return res.json({ success: false, message: "Application is not blocked" });
    }

    application.status = "rejected";
    application.adminRemarks = "Unblocked by admin — user can reapply";
    application.reviewedBy = req.user.id;
    application.reviewedAt = new Date();
    await application.save();

    res.json({
      success: true,
      message: "User unblocked. They can now apply again.",
      data: { status: "rejected" },
    });

});

exports.deleteApplication = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const application = await MentorApplication.findById(id);
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    await MentorApplication.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Application deleted",
    });

});
