const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: "SkillSwap" },
    siteDescription: { type: String, default: "A platform for skill sharing and mentorship." },
    contactEmail: { type: String, default: "admin@skillswap.com" },
    maxLearnersPerSession: { type: Number, default: 30 },
    defaultSessionDuration: { type: Number, default: 60 },
    enableRegistration: { type: Boolean, default: true },
    platformFee: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    timezone: { type: String, default: "Asia/Kolkata" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Setting", settingsSchema);
