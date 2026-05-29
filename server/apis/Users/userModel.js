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
      enum: ["active", "blocked", "deleted"],
      default: "active",
    },
    deletedBy: {
      type: String,
      enum: ["self", "admin"],
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

    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    verificationTokenExpires: Date,

    followerCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },

    isOnline: { type: Boolean, default: false },
    lastActive: { type: Date, default: Date.now },

    onboardingDismissed: { type: Boolean, default: false },

    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    earnedBadges: [{
      badgeId: { type: mongoose.Schema.Types.ObjectId, ref: "Badge" },
      earnedAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true },
);

userSchema.index({ name: 1 });
userSchema.index({ blockedUsers: 1 });

userSchema.pre("save", async function () {
  if (this.isModified("status") && this.status === "deleted") {
    const userId = this._id;

    await Promise.all([
      mongoose.model("Follow").deleteMany({
        $or: [{ follower: userId }, { following: userId }],
      }),

      mongoose.model("RefreshToken").deleteMany({ userId }),

      mongoose.model("Wishlist").deleteMany({ userId }),

      mongoose.model("Wallet").deleteOne({ userId }).then(() =>
        mongoose.model("Transaction").deleteMany({ userId }),
      ),

      mongoose.model("CalendarToken").deleteMany({ userId }),

      mongoose.model("XpTransaction").deleteMany({ userId }),

      mongoose.model("Notification").deleteMany({ recipient: userId }),

      mongoose.model("MentorApplication").deleteMany({ userId }),

      mongoose.model("Availability").deleteMany({ mentorId: userId }),
    ]);
  }
});

module.exports = mongoose.model("User", userSchema);
