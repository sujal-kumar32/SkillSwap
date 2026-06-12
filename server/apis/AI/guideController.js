const asyncHandler = require("../../utilities/asyncHandler");
const { generateGuideResponse } = require("../../utilities/aiGuideHelper");
const User = require("../Users/userModel");

exports.getWelcome = asyncHandler(async (req, res) => {
  const isGuest = !req.user;

  if (isGuest) {
    return res.json({
      success: true,
      data: {
        reply: "Welcome to SkillSwap! 👋 I'm SwapMind, your guide. Want to learn a new skill or share your expertise with others?",
        actions: [
          { label: "Explore Sessions", action: "navigate", path: "/courses" },
          { label: "Sign Up", action: "navigate", path: "/login" },
        ],
        onboardingStatus: "not_started",
        isGuest: true,
      },
    });
  }

  const user = await User.findById(req.user.id).select("name onboardingStatus roles").lean();
  const onboardingStatus = user.onboardingStatus || "not_started";

  const context = {
    name: user.name,
    roles: user.roles,
    onboardingStatus,
    currentPage: req.headers.referer || "/",
    isLoggedIn: true,
  };

  const rawReply = await generateGuideResponse(context, null, []);
  const parsed = JSON.parse(rawReply);

  res.json({
    success: true,
    data: {
      reply: parsed.reply,
      actions: parsed.actions || [],
      onboardingStatus: parsed.setOnboarding || onboardingStatus,
      isGuest: false,
    },
  });
});

exports.guideChat = asyncHandler(async (req, res) => {
  const { message, onboardingStatus: clientStatus, conversationHistory } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: "Message is required" });
  }

  const isGuest = !req.user;
  let userContext = null;

  if (!isGuest) {
    const user = await User.findById(req.user.id).select("name roles onboardingStatus").lean();
    userContext = {
      name: user.name,
      roles: user.roles,
      onboardingStatus: clientStatus || user.onboardingStatus || "not_started",
      currentPage: req.headers.referer || "/",
      isLoggedIn: true,
    };
  } else {
    userContext = {
      name: "Guest",
      roles: [],
      onboardingStatus: "not_started",
      currentPage: req.headers.referer || "/",
      isLoggedIn: false,
    };
  }

  const history = Array.isArray(conversationHistory) ? conversationHistory : [];

  const rawReply = await generateGuideResponse(userContext, message.trim(), history);
  const parsed = JSON.parse(rawReply);

  if (!isGuest && parsed.setOnboarding === "completed") {
    await User.findByIdAndUpdate(req.user.id, { onboardingStatus: "completed" });
  }

  res.json({
    success: true,
    data: {
      reply: parsed.reply,
      actions: parsed.actions || [],
      onboardingStatus: parsed.setOnboarding || clientStatus || "in_progress",
    },
  });
});

exports.updateOnboarding = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!["not_started", "in_progress", "completed"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  await User.findByIdAndUpdate(req.user.id, { onboardingStatus: status });

  res.json({ success: true, message: "Onboarding status updated" });
});
