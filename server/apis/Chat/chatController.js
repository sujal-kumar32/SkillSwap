const Chat = require("./chatModel");
const Request = require("../Request/requestModel");
const asyncHandler = require("../../utilities/asyncHandler");

const isAdmin = (req) => req.user?.roles?.includes("admin");
const idsEqual = (left, right) => {
  return left && right && left.toString() === right.toString();
};

const canAccessRequest = (request, req) => {
  return (
    isAdmin(req) ||
    idsEqual(request.learnerId, req.user.id) ||
    idsEqual(request.mentorId, req.user.id)
  );
};

// SEND MESSAGE
exports.sendMessage = asyncHandler(async (req, res) => {

    const { requestId, message } = req.body;

    if (!requestId || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "requestId and message are required",
      });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (!canAccessRequest(request, req)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this chat",
      });
    }

    let chat = await Chat.findOne({ requestId });

    if (!chat) {
      const participants = [request.learnerId, request.mentorId].filter(Boolean);

      if (!participants.some((participant) => idsEqual(participant, req.user.id))) {
        participants.push(req.user.id);
      }

      chat = await Chat.create({
        requestId,
        participants,
        messages: [],
      });
    } else if (!chat.participants.some((participant) => idsEqual(participant, req.user.id))) {
      chat.participants.push(req.user.id);
    }

    chat.messages.push({
      senderId: req.user.id,
      message: message.trim(),
    });

    await chat.save();

    res.json({
      success: true,
      message: "Message sent",
      data: chat,
    });


});

// GET CHAT BY REQUEST
exports.getChat = asyncHandler(async (req, res) => {

    const request = await Request.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (!canAccessRequest(request, req)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this chat",
      });
    }

    const chat = await Chat.findOne({ requestId: req.params.requestId })
      .populate("messages.senderId", "name")
      .lean();

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    res.json({
      success: true,
      data: chat,
    });


});
