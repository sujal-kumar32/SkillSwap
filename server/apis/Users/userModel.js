const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    roles: {
      type: [String],
      enum: ["admin", "mentor", "learner"],
      default: ["learner"],
    },

    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },

    profileImage: String,
    coverImage: { type: String, default: "" },
    profilePublicId: { type: String, default: "" },

    bio: { type: String, default: "" },

    interests: { type: [String], default: [] },
    learningGoals: { type: String, default: "" },

    skills: [{
      name: { type: String, required: true },
      level: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
    }],

    phone: { type: String, default: "" },
    timezone: { type: String, default: "UTC" },

    socialLinks: {
      linkedin: String,
      github: String,
      portfolio: String,
      youtube: String,
      twitter: String,
    },

    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
