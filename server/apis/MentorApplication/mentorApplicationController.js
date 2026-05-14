const MentorApplication = require("./mentorApplicationModel");
const User = require("../Users/userModel");
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

exports.applyForMentor = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyApplication = async (req, res) => {
  try {
    const application = await MentorApplication.findOne({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    if (!application) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllApplications = async (req, res) => {
  try {
    const { status, userId } = req.query;
    let filter = {};
    if (status && ["pending", "approved", "rejected", "blocked"].includes(status)) {
      filter.status = status;
    }
    if (userId) {
      filter.userId = userId;
    }

    const applications = await MentorApplication.find(filter)
      .populate("userId", "name email profileImage")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, total: applications.length, data: applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.approveApplication = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.rejectApplication = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.removeMentor = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.unblockMentor = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteApplication = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
