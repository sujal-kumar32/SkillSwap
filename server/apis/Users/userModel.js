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

    profilePublicId: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    interests: {
      type: [String],
      default: [],
    },

    learningGoals: {
      type: String,
      default: "",
    },

    socialLinks: {
      linkedin: String,
      github: String,
      portfolio: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
