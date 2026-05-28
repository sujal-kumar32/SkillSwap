const mongoose = require("mongoose");

const feedSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["session_created", "badge_earned", "review_written", "started_following", "level_up"],
      required: true,
    },
    target: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "targetModel",
    },
    targetModel: {
      type: String,
      enum: ["Session", "Badge", "Review", "User", null],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

feedSchema.index({ createdAt: -1 });
feedSchema.index({ actor: 1, createdAt: -1 });

module.exports = mongoose.model("Feed", feedSchema);
