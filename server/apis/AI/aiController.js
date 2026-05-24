const User = require("../Users/userModel");
const Session = require("../Session/sessionModel");
const Request = require("../Request/requestModel");
const ai = require("../../utilities/aiHelper");

const asyncHandler = require("../../utilities/asyncHandler");

exports.getRecommendations = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).lean();
  const bookings = await Request.find({ learnerId: req.user.id })
    .select("sessionId").lean();

  const bookedSessionIds = bookings.map((b) => b.sessionId);
  const interests = user?.interests || [];

  let sessions = await Session.find({
    status: "active",
    _id: { $nin: bookedSessionIds },
  })
    .populate({
      path: "skillId",
      populate: { path: "categoryId", select: "name" },
    })
    .populate("mentorId", "name email profileImage")
    .sort({ createdAt: -1 })
    .limit(12)
    .lean();

  let aiTag = "trending";
  let aiReason = "Popular active session";
  let aiEnhancedSessions = [];

  if (interests.length > 0) {
    try {
      const interestPrompt = `Based on learner interests: ${interests.join(", ")}, suggest the most relevant skill categories or topics. List 5 comma-separated topics.`;
      const aiSuggestion = await ai.generateTags(interestPrompt);
      const aiTopics = aiSuggestion.split(",").map((t) => t.trim().toLowerCase());

      aiEnhancedSessions = sessions.filter((s) => {
        const skillName = s.skillId?.name?.toLowerCase() || "";
        const catName = s.skillId?.categoryId?.name?.toLowerCase() || "";
        return aiTopics.some(
          (t) => skillName.includes(t) || catName.includes(t) || s.title.toLowerCase().includes(t)
        );
      });
    } catch (e) {
      console.log("Gemini recommendation fallback:", e.message);
    }
  }

  const result = (aiEnhancedSessions.length > 0 ? aiEnhancedSessions : sessions).map((s) => {
    const skillName = s.skillId?.name || "";
    const categoryName = s.skillId?.categoryId?.name || "";
    const isInterestMatch = interests.some((i) => {
      const n = i.toLowerCase();
      return skillName.toLowerCase().includes(n) || categoryName.toLowerCase().includes(n) || s.title.toLowerCase().includes(n);
    });

    if (isInterestMatch || aiEnhancedSessions.length > 0) {
      aiTag = "ai";
      aiReason = isInterestMatch
        ? "Matched with your interests"
        : "Recommended by SkillSwap AI";
    }

    return { ...s, rating: 4.7, learners: 0, isAiRecommended: aiTag === "ai", recommendationReason: aiReason };
  });

  result.sort((a, b) => Number(b.isAiRecommended) - Number(a.isAiRecommended));

  res.json({ success: true, total: result.length, data: result });
});

exports.generateTitle = asyncHandler(async (req, res) => {
  const { skill, topic, level } = req.body;
  if (!topic && !skill) {
    return res.status(400).json({ success: false, message: "Skill or topic is required" });
  }
  const prompt = [skill && `Skill: ${skill}`, topic && `Topic: ${topic}`, level && `Level: ${level}`]
    .filter(Boolean).join(", ");
  const title = await ai.generateTitle(prompt);
  res.json({ success: true, data: { title } });
});

exports.generateDescription = asyncHandler(async (req, res) => {
  const { skill, targetAudience, sessionType } = req.body;
  if (!skill) {
    return res.status(400).json({ success: false, message: "Skill is required" });
  }
  const prompt = [skill && `Skill: ${skill}`, targetAudience && `Target audience: ${targetAudience}`, sessionType && `Session type: ${sessionType}`]
    .filter(Boolean).join(", ");
  const description = await ai.generateDescription(prompt);
  res.json({ success: true, data: { description } });
});

exports.generateOutcomes = asyncHandler(async (req, res) => {
  const { skill, topic, level } = req.body;
  if (!skill && !topic) {
    return res.status(400).json({ success: false, message: "Skill or topic is required" });
  }
  const prompt = [skill && `Skill: ${skill}`, topic && `Topic: ${topic}`, level && `Level: ${level}`]
    .filter(Boolean).join(", ");
  const outcomes = await ai.generateOutcomes(prompt);
  res.json({ success: true, data: { outcomes } });
});

exports.generateTags = asyncHandler(async (req, res) => {
  const { skill, topic } = req.body;
  if (!skill && !topic) {
    return res.status(400).json({ success: false, message: "Skill or topic is required" });
  }
  const prompt = [skill && `Skill: ${skill}`, topic && `Topic: ${topic}`].filter(Boolean).join(", ");
  const tags = await ai.generateTags(prompt);
  res.json({ success: true, data: { tags } });
});

exports.generateRoadmap = asyncHandler(async (req, res) => {
  const { targetSkill, currentLevel } = req.body;
  if (!targetSkill) {
    return res.status(400).json({ success: false, message: "Target skill is required" });
  }
  const prompt = `Target skill: ${targetSkill}${currentLevel ? `, Current level: ${currentLevel}` : ""}`;
  const roadmap = await ai.generateRoadmap(prompt);
  res.json({ success: true, data: { roadmap } });
});

exports.mentorAssistant = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title && !description) {
    return res.status(400).json({ success: false, message: "Title or description is required" });
  }
  const prompt = [`Title: ${title || "(not provided)"}`, `Description: ${description || "(not provided)"}`].join("\n");
  const feedback = await ai.mentorAssistant(prompt);
  res.json({ success: true, data: { feedback } });
});

exports.searchSessions = asyncHandler(async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ success: false, message: "Search query is required" });
  }
  const keywords = await ai.searchSessions(query);
  const skills = await ai.generateTags(keywords);
  res.json({ success: true, data: { keywords, skills } });
});

exports.chatAssistant = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, message: "Message is required" });
  }
  const reply = await ai.chatAssistant(message);
  res.json({ success: true, data: { reply } });
});
