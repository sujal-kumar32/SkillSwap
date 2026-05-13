const Request = require("../Request/requestModel");
const User = require("../Users/userModel");

exports.getProgress = async (req, res) => {
  try {
    const bookings = await Request.find({ learnerId: req.user.id })
      .populate({
        path: "sessionId",
        select: "title skillId mentorId",
        populate: [
          { path: "skillId", select: "name" },
          { path: "mentorId", select: "name" },
        ],
      })
      .lean();

    const grouped = bookings.reduce((map, booking) => {
      const skillName = booking.sessionId?.skillId?.name || "General Learning";
      const existing = map.get(skillName) || {
        skill: skillName,
        sessions: 0,
        completedSessions: 0,
        mentor: booking.sessionId?.mentorId?.name || "SkillSwap Mentor",
        remark: "Keep learning consistently to improve your skill score.",
      };

      existing.sessions += 1;
      if (booking.requestStatus === "completed") {
        existing.completedSessions += 1;
      }

      map.set(skillName, existing);
      return map;
    }, new Map());

    const data = Array.from(grouped.values()).map((item) => ({
      ...item,
      completion: item.sessions
        ? Math.round((item.completedSessions / item.sessions) * 100)
        : 0,
    }));

    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(
      (booking) => booking.requestStatus === "completed",
    ).length;

    res.json({
      success: true,
      total: data.length,
      summary: {
        totalBookings,
        completedBookings,
        completion:
          totalBookings > 0
            ? Math.round((completedBookings / totalBookings) * 100)
            : 0,
      },
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getAllProgress = async (req, res) => {
  try {
    const learners = await User.find({ roles: "learner" }).select("name email profileImage").lean();

    const data = await Promise.all(
      learners.map(async (learner) => {
        const bookings = await Request.find({ learnerId: learner._id })
          .populate({ path: "sessionId", select: "title skillId mentorId", populate: { path: "skillId", select: "name" } })
          .lean();

        const totalBookings = bookings.length;
        const completedBookings = bookings.filter((b) => b.requestStatus === "completed").length;
        const completion = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;

        return {
          _id: learner._id,
          name: learner.name,
          email: learner.email,
          profileImage: learner.profileImage,
          totalBookings,
          completedBookings,
          completion,
          skills: [...new Set(bookings.map((b) => b.sessionId?.skillId?.name).filter(Boolean))],
        };
      }),
    );

    res.json({ success: true, total: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
