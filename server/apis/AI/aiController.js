const User = require("../Users/userModel");
const Session = require("../Session/sessionModel");
const Request = require("../Request/requestModel");

exports.getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    const bookings = await Request.find({ learnerId: req.user.id })
      .select("sessionId")
      .lean();

    const bookedSessionIds = bookings.map((booking) => booking.sessionId);
    const interests = user?.interests || [];

    const query = {
      status: "active",
      _id: { $nin: bookedSessionIds },
    };

    let sessions = await Session.find(query)
      .populate({
        path: "skillId",
        populate: { path: "categoryId", select: "name" },
      })
      .populate("mentorId", "name email profileImage")
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    sessions = sessions.map((session) => {
      const skillName = session.skillId?.name || "";
      const categoryName = session.skillId?.categoryId?.name || "";
      const isInterestMatch = interests.some((interest) => {
        const normalized = interest.toLowerCase();
        return (
          skillName.toLowerCase().includes(normalized) ||
          categoryName.toLowerCase().includes(normalized) ||
          session.title.toLowerCase().includes(normalized)
        );
      });

      return {
        ...session,
        rating: 4.7,
        learners: 0,
        isAiRecommended: isInterestMatch || interests.length === 0,
        recommendationReason: isInterestMatch
          ? "Matched with your saved interests"
          : "Popular active session",
      };
    });

    sessions.sort(
      (left, right) =>
        Number(right.isAiRecommended) - Number(left.isAiRecommended),
    );

    res.json({
      success: true,
      total: sessions.length,
      data: sessions,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
