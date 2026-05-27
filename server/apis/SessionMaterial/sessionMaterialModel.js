const mongoose = require("mongoose");

const sessionMaterialSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["pdf", "slide", "document", "spreadsheet", "other"],
      default: "other",
    },
    fileUrl: {
      type: String,
      required: true,
    },
    filePublicId: {
      type: String,
      default: "",
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("SessionMaterial", sessionMaterialSchema);
