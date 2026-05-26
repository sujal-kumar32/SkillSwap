const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema({
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  timezone: {
    type: String,
    default: "UTC",
  },
  slots: [
    {
      dayOfWeek: { type: Number, min: 0, max: 6 },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Availability", availabilitySchema);
