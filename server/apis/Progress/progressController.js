const Request = require("../Request/requestModel");
const User = require("../Users/userModel");
const Session = require("../Session/sessionModel");
const asyncHandler = require("../../utilities/asyncHandler");
const getPagination = require("../../utilities/paginate");

exports.getProgress = asyncHandler(async (req, res) => {

    const bookings = await Request.find({ learnerId: req.user.id })
      .populate({
        path: "sessionId",
        select: "title skillId mentorId",
        populate: [
          {
            path: "skillId",
            select: "name level thumbnail categoryId",
            populate: { path: "categoryId", select: "name icon" },
          },
          { path: "mentorId", select: "name" },
        ],
      })
      .lean();

    const grouped = bookings.reduce((map, booking) => {
      const skill = booking.sessionId?.skillId;
      const skillName = skill?.name || "General Learning";
      const existing = map.get(skillName) || {
        skill: skillName,
        category: skill?.categoryId?.name || "General",
        categoryIcon: skill?.categoryId?.icon || "fa-star",
        skillLevel: skill?.level || "all",
        sessions: 0,
        completedSessions: 0,
        mentor: booking.sessionId?.mentorId?.name || "SkillSwap Mentor",
        remark: "Keep learning consistently to improve your skill score.",
        skillThumbnail: skill?.thumbnail || "",
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

    data.sort((a, b) => b.completion - a.completion);

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

});

exports.getAllProgress = asyncHandler(async (req, res) => {

    const { page, limit, skip } = getPagination(req.query);

    const pipeline = [
      { $match: { roles: "learner" } },
      {
        $lookup: {
          from: "requests",
          let: { learnerId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$learnerId", "$$learnerId"] } } },
            {
              $lookup: {
                from: "sessions",
                localField: "sessionId",
                foreignField: "_id",
                as: "session",
              },
            },
            { $unwind: { path: "$session", preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: "skills",
                localField: "session.skillId",
                foreignField: "_id",
                as: "skill",
              },
            },
            { $unwind: { path: "$skill", preserveNullAndEmptyArrays: true } },
          ],
          as: "requests",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          profileImage: 1,
          totalBookings: { $size: "$requests" },
          completedBookings: {
            $size: {
              $filter: {
                input: "$requests",
                as: "r",
                cond: { $eq: ["$$r.requestStatus", "completed"] },
              },
            },
          },
          skills: {
            $let: {
              vars: {
                skillNames: {
                  $filter: {
                    input: { $map: { input: "$requests", as: "r", in: "$$r.skill.name" } },
                    as: "s",
                    cond: { $ne: ["$$s", null] },
                  },
                },
              },
              in: { $setUnion: ["$$skillNames", []] },
            },
          },
        },
      },
      {
        $addFields: {
          completion: {
            $cond: [
              { $gt: ["$totalBookings", 0] },
              { $round: [{ $multiply: [{ $divide: ["$completedBookings", "$totalBookings"] }, 100] }, 0] },
              0,
            ],
          },
        },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ];

    const result = await User.aggregate(pipeline);
    const total = result[0]?.metadata[0]?.total || 0;
    const data = result[0]?.data || [];

    res.json({ success: true, total, page, pages: Math.ceil(total / limit), data });

});
