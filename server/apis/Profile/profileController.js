const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../Users/userModel");
const Session = require("../Session/sessionModel");
const Request = require("../Request/requestModel");
const Review = require("../Reviews/reviewModel");
const Skill = require("../Skills/skillModel");
const { uploadBuffer, destroyImage } = require("../../utilities/cloudinaryUpload");
const { sendEmail } = require("../../utilities/emailService");
const { emailVerification } = require("../../utilities/emailTemplates");
const asyncHandler = require("../../utilities/asyncHandler");
const XpTransaction = require("../../models/XpTransaction");

const toArray = (value) => {
  if (Array.isArray(value)) return value.map((item) => item.trim()).filter(Boolean);
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

exports.getProfile = asyncHandler(async (req, res) => {

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
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const {
      name,
      email,
      bio,
      image,
      profileImage,
      coverImage,
      interests,
      goals,
      learningGoals,
      skills,
      phone,
      timezone,
      linkedin,
      github,
      portfolio,
      youtube,
      twitter,
      oldPassword,
      newPassword,
    } = req.body;

    if (name !== undefined) user.name = name.trim();

    if (email !== undefined) {
      const newEmail = email.trim().toLowerCase();
      if (newEmail !== user.email) {
        const existing = await User.findOne({ email: newEmail, _id: { $ne: user._id } });
        if (existing) {
          return res.status(400).json({ success: false, message: "Email already in use" });
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
      }
    }

    if (bio !== undefined) user.bio = bio.trim();

    if (req.file) {
      if (user.profilePublicId) {
        await destroyImage(user.profilePublicId).catch(() => {});
      }
      const result = await uploadBuffer(req.file.buffer, {
        public_id: `profile_${req.user.id}`,
      });
      user.profileImage = result.secure_url;
      user.profilePublicId = result.public_id;
    } else if (image !== undefined || profileImage !== undefined) {
      user.profileImage = image || profileImage || "";
    }

    if (interests !== undefined) user.interests = toArray(interests);
    if (goals !== undefined || learningGoals !== undefined) {
      user.learningGoals = goals || learningGoals || "";
    }
    if (skills !== undefined) {
      let parsed = skills;
      if (typeof skills === "string") {
        try { parsed = JSON.parse(skills); } catch { parsed = []; }
      }
      user.skills = Array.isArray(parsed) ? parsed : [];
    }
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

    if (newPassword) {
      if (!oldPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required",
        });
      }

      const matched = await bcrypt.compare(oldPassword, user.password);
      if (!matched) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

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
      skills = await Skill.countDocuments({ createdBy: req.user.id, isDeleted: { $ne: true } });
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

exports.getPublicProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select(
    "name email profileImage coverImage bio interests skills xp level followerCount followingCount roles socialLinks createdAt"
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
    rating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
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
