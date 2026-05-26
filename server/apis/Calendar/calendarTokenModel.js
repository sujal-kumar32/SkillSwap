const mongoose = require("mongoose");

const calendarTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  accessToken: String,
  refreshToken: String,
  scope: String,
  tokenType: String,
  expiryDate: Date,
  calendarEmail: String,
}, { timestamps: true });

module.exports = mongoose.model("CalendarToken", calendarTokenSchema);
