const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../Users/userModel");
const Session = require("../Session/sessionModel");
const Request = require("../Request/requestModel");
const Review = require("../Reviews/reviewModel");
const Skill = require("../Skills/skillModel");
const {
  uploadBuffer,
  destroyImage,
} = require("../../utilities/cloudinaryUpload");
const { sendEmail } = require("../../utilities/emailService");
const { emailVerification } = require("../../utilities/emailTemplates");
const asyncHandler = require("../../utilities/asyncHandler");
const XpTransaction = require("../../models/XpTransaction");

const toArray = (value) => {
  if (Array.isArray(value))
    return value.map((item) => item.trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const withoutPassword = (user) => {
  const data = user.toObject();
  delete data.password;
  return data;
};

const handleEmailUpdate = async (email, user) => {
  if (email === undefined) return;
  const newEmail = email.trim().toLowerCase();
  if (newEmail === user.email) return;
  const existing = await User.findOne({ email: newEmail, _id: { $ne: user._id } });
  if (existing) {
    return { error: [400, "Email already in use"] };
  }
  user.email = newEmail;
  user.isVerified = false;
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(verificationToken).digest("hex");
  user.verificationToken = hash;
  user.verificationTokenExpires = Date.now() + 86400000;
  const verifyLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/verify-email/${verificationToken}`;
  sendEmail({
    to: user.email,
    subject: "Verify your new email - SkillSwap",
    html: emailVerification(user.name, verifyLink),
  }).catch((err) => console.error("Verification email failed:", err.message));
};

const handleProfileImage = async (req, user) => {
  if (req.file) {
    if (user.profilePublicId) {
      await destroyImage(user.profilePublicId).catch(() => {});
    }
    const result = await uploadBuffer(req.file.buffer, {
      public_id: `profile_${req.user.id}`,
    });
    user.profileImage = result.secure_url;
    user.profilePublicId = result.public_id;
  } else if (req.body.image !== undefined || req.body.profileImage !== undefined) {
    user.profileImage = req.body.image || req.body.profileImage || "";
  }
};

const parseSkills = (skills) => {
  if (skills === undefined) return undefined;
  if (typeof skills === "string") {
    try {
      return JSON.parse(skills);
    } catch {
      return [];
    }
  }
  return Array.isArray(skills) ? skills : [];
};

const handlePasswordUpdate = async (newPassword, oldPassword, user) => {
  if (!newPassword) return;
  if (!oldPassword) {
    return { error: [400, "Current password is required"] };
  }
  const matched = await bcrypt.compare(oldPassword, user.password);
  if (!matched) {
    return { error: [400, "Current password is incorrect"] };
  }
  user.password = await bcrypt.hash(newPassword, 10);
};

exports.getProfile = asyncHandler(async (req, res) => {
  if (!req.user?.id) {
    return res.json({
      success: false,
      data: null,
      message: "Not authenticated",
    });
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.json({
    success: true,
    data: withoutPassword(user),
  });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const { name, bio, interests, goals, learningGoals, skills, coverImage, phone, timezone, linkedin, github, portfolio, youtube, twitter, oldPassword, newPassword } = req.body;

  if (name !== undefined) user.name = name.trim();

  const emailError = await handleEmailUpdate(req.body.email, user);
  if (emailError) return res.status(emailError.error[0]).json({ success: false, message: emailError.error[1] });

  if (bio !== undefined) user.bio = bio.trim();

  await handleProfileImage(req, user);

  if (interests !== undefined) user.interests = toArray(interests);
  if (goals !== undefined || learningGoals !== undefined) {
    user.learningGoals = goals || learningGoals || "";
  }
  const parsedSkills = parseSkills(skills);
  if (parsedSkills !== undefined) user.skills = parsedSkills;
  if (coverImage !== undefined) user.coverImage = coverImage;
  if (phone !== undefined) user.phone = phone.trim();
  if (timezone !== undefined) user.timezone = timezone.trim();

  user.socialLinks = {
    ...(user.socialLinks || {}),
    ...(linkedin !== undefined ? { linkedin } : {}),
    ...(github !== undefined ? { github } : {}),
    ...(portfolio !== undefined ? { portfolio } : {}),
    ...(youtube !== undefined ? { youtube } : {}),
    ...(twitter !== undefined ? { twitter } : {}),
  };

  const passwordError = await handlePasswordUpdate(newPassword, oldPassword, user);
  if (passwordError) return res.status(passwordError.error[0]).json({ success: false, message: passwordError.error[1] });

  await user.save();

  res.json({
    success: true,
    message: "Profile updated",
    data: withoutPassword(user),
  });
});

exports.getProfileStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).lean();
  const isMentor = user.roles.includes("mentor");

  let sessions, reviews, skills;

  if (isMentor) {
    sessions = await Session.countDocuments({ mentorId: req.user.id });
    reviews = await Review.countDocuments({ mentorId: req.user.id });
    skills = await Skill.countDocuments({
      createdBy: req.user.id,
      isDeleted: { $ne: true },
    });
  } else {
    sessions = await Request.countDocuments({ learnerId: req.user.id });
    reviews = await Review.countDocuments({ learnerId: req.user.id });
    skills = user.interests?.length || 0;
  }

  res.json({ success: true, data: { sessions, reviews, skills } });
});

exports.getXpHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [transactions, total] = await Promise.all([
    XpTransaction.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    XpTransaction.countDocuments({ userId: req.user.id }),
  ]);

  res.json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: transactions,
  });
});

exports.getOnboarding = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("onboardingDismissed profileImage bio roles").lean();
  const { role } = req.query;
  const isLearner = role === "learner" || (!role && user.roles.includes("learner"));
  const isMentor = role === "mentor" || (!role && user.roles.includes("mentor"));

  const steps = [];

  const profileDone = !!(user.profileImage && user.bio);

  if (isLearner) {
    const [bookingCount, wishlistCount] = await Promise.all([
      Request.countDocuments({ learnerId: req.user.id }),
      require("../Wishlist/wishlistModel").countDocuments({ userId: req.user.id }),
    ]);
    steps.push(
      { id: "profile", label: "Complete your profile", done: profileDone, icon: "fa-user-circle", link: "/settings" },
      { id: "explore", label: "Browse and save skills", done: wishlistCount > 0, icon: "fa-heart", link: "/learner/skills" },
      { id: "booking", label: "Book your first session", done: bookingCount > 0, icon: "fa-calendar-check", link: "/learner/explore" },
    );
  }

  if (isMentor) {
    const [skillCount, sessionCount, availCount] = await Promise.all([
      Skill.countDocuments({ createdBy: req.user.id, isDeleted: { $ne: true } }),
      Session.countDocuments({ mentorId: req.user.id }),
      require("../Availability/availabilityModel").countDocuments({ mentorId: req.user.id }),
    ]);
    steps.push(
      { id: "profile", label: "Complete your profile", done: profileDone, icon: "fa-user-circle", link: "/settings" },
      { id: "skill", label: "Create your first skill", done: skillCount > 0, icon: "fa-code", link: "/mentor/create-skill" },
      { id: "session", label: "Create your first session", done: sessionCount > 0, icon: "fa-video", link: "/mentor/create-session" },
      { id: "availability", label: "Set your availability", done: availCount > 0, icon: "fa-clock", link: "/mentor/availability" },
    );
  }

  const doneCount = steps.filter((s) => s.done).length;
  const progress = steps.length > 0 ? Math.round((doneCount / steps.length) * 100) : 100;

  res.json({
    success: true,
    data: {
      dismissed: user.onboardingDismissed,
      progress,
      doneCount,
      total: steps.length,
      allDone: doneCount === steps.length,
      steps,
    },
  });
});

exports.dismissOnboarding = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { onboardingDismissed: true });
  res.json({ success: true });
});

exports.getPublicProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select(
    "name email profileImage coverImage bio interests skills xp level followerCount followingCount roles socialLinks createdAt",
  );

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const Session = require("../Session/sessionModel");
  const Review = require("../Reviews/reviewModel");

  const [sessionCount, reviewCount] = await Promise.all([
    Session.countDocuments({ mentorId: userId, status: { $ne: "cancelled" } }),
    Review.countDocuments({ mentorId: userId }),
  ]);

  let rating = null;
  if (reviewCount > 0) {
    const reviews = await Review.find({ mentorId: userId });
    rating = (
      reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    ).toFixed(1);
  }

  res.json({
    success: true,
    data: {
      ...user.toObject(),
      sessionCount,
      reviewCount,
      rating,
    },
  });
});
