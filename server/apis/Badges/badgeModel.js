const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  key: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  category: { type: String, enum: ["learner", "mentor", "general"], required: true },
  requirement: {
    type: { type: String, required: true },
    count: { type: Number, required: true },
  },
  color: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Badge", badgeSchema);
