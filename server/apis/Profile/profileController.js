const bcrypt = require("bcryptjs");
const User = require("../Users/userModel");
const { uploadBuffer, destroyImage } = require("../../utilities/cloudinaryUpload");

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

exports.getProfile = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
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
      interests,
      goals,
      learningGoals,
      linkedin,
      github,
      portfolio,
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

    user.socialLinks = {
      ...(user.socialLinks || {}),
      ...(linkedin !== undefined ? { linkedin } : {}),
      ...(github !== undefined ? { github } : {}),
      ...(portfolio !== undefined ? { portfolio } : {}),
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
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
