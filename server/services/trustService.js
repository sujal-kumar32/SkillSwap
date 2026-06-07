const User = require("../apis/Users/userModel");
const Review = require("../apis/Reviews/reviewModel");
const mongoose = require("mongoose");

async function recalculateTrustScore(userId) {
  const oid = new mongoose.Types.ObjectId(userId);
  const user = await User.findById(oid);
  if (!user) return;

  const totalBookings = user.totalBookings || 0;
  const totalCompleted = user.totalCompletedSessions || 0;
  const totalCancelled = user.totalCancelledSessions || 0;
  const totalAttempted = totalCompleted + totalCancelled;

  const completionRate = totalAttempted > 0 ? totalCompleted / totalAttempted : 1;

  const ratingAgg = await Review.aggregate([
    { $match: { mentorId: oid } },
    { $group: { _id: null, avg: { $avg: "$rating" } } },
  ]);
  const avgRating = ratingAgg[0]?.avg || 0;

  const trustScore = Math.min(
    100,
    Math.max(0, Math.round(completionRate * 60 + (avgRating / 5) * 40))
  );

  await User.findByIdAndUpdate(oid, { trustScore });
  return trustScore;
}

module.exports = { recalculateTrustScore };
