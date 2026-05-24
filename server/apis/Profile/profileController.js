const bcrypt = require("bcryptjs");
const User = require("../Users/userModel");
const Session = require("../Session/sessionModel");
const Request = require("../Request/requestModel");
const Review = require("../Reviews/reviewModel");
const Skill = require("../Skills/skillModel");
const { uploadBuffer, destroyImage } = require("../../utilities/cloudinaryUpload");
const asyncHandler = require("../../utilities/asyncHandler");

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
    if (email !== undefined) user.email = email.trim().toLowerCase();
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
      const parsed = typeof skills === "string" ? JSON.parse(skills) : skills;
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
