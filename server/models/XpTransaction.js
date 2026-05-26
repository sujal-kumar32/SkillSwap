const mongoose = require("mongoose");

const xpTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId },
  referenceModel: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("XpTransaction", xpTransactionSchema);
