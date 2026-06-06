const Chat = require("./chatModel");
const User = require("../Users/userModel");
const Request = require("../Request/requestModel");
const asyncHandler = require("../../utilities/asyncHandler");
const { uploadBuffer } = require("../../utilities/cloudinaryUpload");
const multer = require("multer");
const path = require("path");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf|doc|docx|txt|zip/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype.split("/")[1]);
    cb(null, ext || mime);
  },
});

exports.uploadMiddleware = upload.single("file");

let _io = null;

function setSocketIO(io) {
  _io = io;
}

const isAdmin = (req) => req.user?.roles?.includes("admin");
const idsEqual = (left, right) => left && right && left.toString() === right.toString();

const checkBlocked = async (userIdA, userIdB) => {
  const users = await User.find({ _id: { $in: [userIdA, userIdB] } }).select("blockedUsers").lean();
  const blockedByA = users.find((u) => u._id.toString() === userIdA?.toString())?.blockedUsers || [];
  const blockedByB = users.find((u) => u._id.toString() === userIdB?.toString())?.blockedUsers || [];
  if (blockedByA.some((id) => id.toString() === userIdB?.toString())) return true;
  if (blockedByB.some((id) => id.toString() === userIdA?.toString())) return true;
  return false;
};

const canAccessRequest = (request, req) => {
  return (
    isAdmin(req) ||
    idsEqual(request.learnerId, req.user.id) ||
    idsEqual(request.mentorId, req.user.id)
  );
};

const getOrCreateRequestChat = async (requestId, req) => {
  const request = await Request.findById(requestId);
  if (!request) {
    return { error: [404, "Request not found"] };
  }
  if (!isAdmin(req) && !canAccessRequest(request, req)) {
    return { error: [403, "Access denied"] };
  }
  if (!isAdmin(req)) {
    const otherInRequest = idsEqual(request.learnerId, req.user.id) ? request.mentorId : request.learnerId;
    if (otherInRequest && (await checkBlocked(req.user.id, otherInRequest))) {
      return { error: [403, "Cannot message this user"] };
    }
  }

  let chat = await Chat.findOne({ requestId });
  if (!chat) {
    const participants = [request.learnerId, request.mentorId].filter(Boolean);
    chat = await Chat.findOne({
      participants: { $all: participants, $size: 2 },
    });
    if (chat) {
      chat.requestId = requestId;
    } else {
      chat = await Chat.create({ requestId, participants, messages: [] });
    }
  }
  return { chat };
};

const getOrCreateDirectChat = async (recipientId, req) => {
  if (!recipientId) {
    return { error: [400, "recipientId is required"] };
  }
  if (!isAdmin(req)) {
    if (idsEqual(recipientId, req.user.id)) {
      return { error: [400, "Cannot message yourself"] };
    }
    if (await checkBlocked(req.user.id, recipientId)) {
      return { error: [403, "Cannot message this user"] };
    }
  }

  let chat = await Chat.findOne({
    participants: { $all: [req.user.id, recipientId], $size: 2 },
  });

  if (!chat) {
    chat = await Chat.create({
      participants: [req.user.id, recipientId],
      messages: [],
    });
  }
  return { chat };
};

const computeLastContent = (message, attachments) => {
  if (message?.trim()) return message.trim().slice(0, 100);
  if (attachments?.length) return `📎 ${attachments[0].type === "image" ? "Image" : "File"}`;
  return "";
};

exports.sendMessage = asyncHandler(async (req, res) => {
  const { requestId, message, recipientId, attachments } = req.body;

  if (!message?.trim() && (!attachments || attachments.length === 0)) {
    return res.status(400).json({ success: false, message: "Message or attachment is required" });
  }

  if (!requestId && !recipientId) {
    return res.status(400).json({ success: false, message: "requestId or recipientId is required" });
  }

  const result = requestId
    ? await getOrCreateRequestChat(requestId, req)
    : await getOrCreateDirectChat(recipientId, req);
  if (result.error) {
    return res.status(result.error[0]).json({ success: false, message: result.error[1] });
  }
  const chat = result.chat;

  const newMessage = {
    senderId: req.user.id,
    message: (message || "").trim(),
    isSeen: false,
    createdAt: new Date(),
    attachments: attachments || [],
    reactions: [],
  };

  chat.messages.push(newMessage);
  chat.lastMessage = {
    content: computeLastContent(message, attachments),
    senderId: req.user.id,
    createdAt: new Date(),
  };
  await chat.save();

  const populated = await Chat.findById(chat._id)
    .populate("messages.senderId", "name profileImage")
    .populate("lastMessage.senderId", "name profileImage")
    .lean();

  const lastMsg = populated.messages[populated.messages.length - 1];

  if (_io) {
    for (const pid of chat.participants) {
      if (pid.toString() !== req.user.id) {
        _io.to(`user:${pid}`).emit("new_message", {
          chatId: chat._id,
          message: lastMsg,
          senderId: req.user.id,
        });
      }
    }
  }

  res.json({ success: true, data: populated });
});

exports.getConversations = asyncHandler(async (req, res) => {
  const [chats, currentUser] = await Promise.all([
    Chat.find({ participants: req.user.id })
      .populate("participants", "name profileImage")
      .populate("lastMessage.senderId", "name profileImage")
      .sort({ "lastMessage.createdAt": -1, updatedAt: -1 })
      .lean(),
    User.findById(req.user.id).select("blockedUsers").lean(),
  ]);
  const myBlocked = (currentUser?.blockedUsers || []).map((id) => id.toString());

  const otherIds = chats
    .map((c) => c.participants.find((p) => !idsEqual(p._id, req.user.id)))
    .filter(Boolean)
    .map((u) => u._id);
  const othersBlockedMe = otherIds.length
    ? await User.find({ _id: { $in: otherIds }, blockedUsers: req.user.id }).distinct("_id").then((ids) => ids.map((id) => id.toString()))
    : [];

  const data = chats
    .filter((c) => {
      const ou = c.participants.find((p) => !idsEqual(p._id, req.user.id));
      if (!ou) return true;
      if (myBlocked.includes(ou._id.toString())) return false;
      if (othersBlockedMe.includes(ou._id.toString())) return false;
      return true;
    })
    .map((c) => {
    const otherUser = c.participants.find((p) => !idsEqual(p._id, req.user.id)) || c.participants[0];
    const unread = c.messages.filter((m) => !m.isSeen && !idsEqual(m.senderId, req.user.id)).length;
    return {
      _id: c._id,
      requestId: c.requestId,
      otherUser,
      lastMessage: c.lastMessage,
      unread,
      updatedAt: c.updatedAt,
    };
  });

  res.json({ success: true, data });
});

exports.getChat = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.chatId)
    .populate("participants", "name profileImage")
    .populate("messages.senderId", "name profileImage")
    .lean();

  if (!chat) {
    return res.status(404).json({ success: false, message: "Chat not found" });
  }

  const isParticipant = chat.participants.some((p) => idsEqual(p._id, req.user.id));
  if (!isAdmin(req) && !isParticipant) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  const otherUser = chat.participants.find((p) => !idsEqual(p._id, req.user.id));
  const [me, them] = await Promise.all([
    User.findById(req.user.id).select("blockedUsers").lean(),
    otherUser ? User.findById(otherUser._id).select("blockedUsers").lean() : null,
  ]);
  const iBlockedThem = (me?.blockedUsers || []).some((id) => otherUser && idsEqual(id, otherUser._id));
  const theyBlockedMe = (them?.blockedUsers || []).some((id) => idsEqual(id, req.user.id));

  res.json({ success: true, data: { ...chat, blocked: iBlockedThem, theyBlockedMe } });
});

exports.markAsRead = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);
  if (!chat) {
    return res.status(404).json({ success: false, message: "Chat not found" });
  }

  let changed = false;
  for (const msg of chat.messages) {
    if (!msg.isSeen && !idsEqual(msg.senderId, req.user.id)) {
      msg.isSeen = true;
      changed = true;
    }
  }

  if (changed) {
    await chat.save();
    if (_io) {
      for (const pid of chat.participants) {
        if (pid.toString() !== req.user.id) {
          _io.to(`user:${pid}`).emit("messages_read", {
            chatId: chat._id,
            readBy: req.user.id,
          });
        }
      }
    }
  }
  res.json({ success: true });
});

exports.getUnreadCount = asyncHandler(async (req, res) => {
  const chats = await Chat.find({ participants: req.user.id }).lean();
  let total = 0;
  for (const chat of chats) {
    total += chat.messages.filter((m) => !m.isSeen && !idsEqual(m.senderId, req.user.id)).length;
  }
  res.json({ success: true, data: { count: total } });
});

exports.getOrCreateBookingChat = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const request = await Request.findById(requestId);
  if (!request) {
    return res.status(404).json({ success: false, message: "Request not found" });
  }
  if (!isAdmin(req) && !canAccessRequest(request, req)) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  if (!isAdmin(req)) {
    const otherInBooking = idsEqual(request.learnerId, req.user.id) ? request.mentorId : request.learnerId;
    if (otherInBooking && (await checkBlocked(req.user.id, otherInBooking))) {
      return res.status(403).json({ success: false, message: "Cannot message this user" });
    }
  }

  let chat = await Chat.findOne({ requestId })
    .populate("participants", "name profileImage")
    .populate("messages.senderId", "name profileImage")
    .lean();

  if (!chat) {
    const participants = [request.learnerId, request.mentorId].filter(Boolean);
    chat = await Chat.findOne({
      participants: { $all: participants, $size: 2 },
    })
      .populate("participants", "name profileImage")
      .populate("messages.senderId", "name profileImage")
      .lean();

    if (chat) {
      await Chat.findByIdAndUpdate(chat._id, { requestId });
      chat.requestId = requestId;
    } else {
      chat = await Chat.create({ requestId, participants, messages: [] });
      chat = await Chat.findById(chat._id)
        .populate("participants", "name profileImage")
        .populate("messages.senderId", "name profileImage")
        .lean();
    }
  }

  res.json({ success: true, data: chat });
});

exports.getOrCreateDM = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;

  if (idsEqual(userId, currentUserId)) {
    return res.status(400).json({ success: false, message: "Cannot chat with yourself" });
  }

  if (await checkBlocked(currentUserId, userId)) {
    return res.status(403).json({ success: false, message: "Cannot message this user" });
  }

  let chat = await Chat.findOne({
    participants: { $all: [currentUserId, userId], $size: 2 },
  }).populate("participants", "name profileImage")
    .populate("messages.senderId", "name profileImage")
    .lean();

  if (!chat) {
    chat = await Chat.create({
      participants: [currentUserId, userId],
      messages: [],
    });
    chat = await Chat.findById(chat._id)
      .populate("participants", "name profileImage")
      .populate("messages.senderId", "name profileImage")
      .lean();
  }

  res.json({ success: true, data: chat });
});

exports.uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }
  const isImage = req.file.mimetype.startsWith("image/");
  const resourceType = isImage ? "image" : "auto";
  const result = await uploadBuffer(req.file.buffer, {
    resource_type: resourceType,
    public_id: `chat_${Date.now()}_${Math.round(Math.random() * 1e9)}`,
  });
  res.json({
    success: true,
    data: {
      url: result.secure_url,
      publicId: result.public_id,
      type: isImage ? "image" : "file",
      name: req.file.originalname,
    },
  });
});

exports.searchMessages = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q?.trim()) {
    return res.status(400).json({ success: false, message: "Search query is required" });
  }

  const chats = await Chat.find({ participants: req.user.id })
    .populate("participants", "name profileImage")
    .lean();

  const results = [];

  for (const chat of chats) {
    const otherUser = chat.participants.find((p) => p._id.toString() !== req.user.id);
    for (const msg of chat.messages) {
      if (msg.message?.toLowerCase().includes(q.toLowerCase())) {
        results.push({
          chatId: chat._id,
          messageId: msg._id,
          content: msg.message,
          createdAt: msg.createdAt,
          otherUser: otherUser ? { _id: otherUser._id, name: otherUser.name } : null,
        });
      }
    }
  }

  res.json({ success: true, data: results.slice(0, 50) });
});

exports.deleteMessage = asyncHandler(async (req, res) => {
  const { chatId, messageId } = req.params;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(404).json({ success: false, message: "Chat not found" });
  }

  const isParticipant = chat.participants.some((p) => p.toString() === req.user.id);
  if (!isAdmin(req) && !isParticipant) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  const msg = chat.messages.id(messageId);
  if (!msg) {
    return res.status(404).json({ success: false, message: "Message not found" });
  }

  if (msg.senderId.toString() !== req.user.id && !isAdmin(req)) {
    return res.status(403).json({ success: false, message: "Can only delete your own messages" });
  }

  msg.message = "";
  msg.isDeleted = true;
  msg.attachments = [];
  msg.reactions = [];
  await chat.save();

  if (_io) {
    for (const pid of chat.participants) {
      if (pid.toString() !== req.user.id) {
        _io.to(`user:${pid}`).emit("message_deleted", {
          chatId: chat._id,
          messageId: msg._id,
        });
      }
    }
  }

  res.json({ success: true, data: { messageId: msg._id } });
});

exports.toggleReaction = asyncHandler(async (req, res) => {
  const { chatId, messageId } = req.params;
  const { emoji } = req.body;
  if (!emoji) {
    return res.status(400).json({ success: false, message: "Emoji is required" });
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(404).json({ success: false, message: "Chat not found" });
  }

  const isParticipant = chat.participants.some((p) => p.toString() === req.user.id);
  if (!isAdmin(req) && !isParticipant) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  const msg = chat.messages.id(messageId);
  if (!msg) {
    return res.status(404).json({ success: false, message: "Message not found" });
  }

  const existingIdx = msg.reactions.findIndex((r) => r.userId.toString() === req.user.id && r.emoji === emoji);
  if (existingIdx > -1) {
    msg.reactions.splice(existingIdx, 1);
  } else {
    msg.reactions.push({ emoji, userId: req.user.id });
  }

  await chat.save();

  if (_io) {
    for (const pid of chat.participants) {
      if (pid.toString() !== req.user.id) {
        _io.to(`user:${pid}`).emit("message_reaction", {
          chatId: chat._id,
          messageId: msg._id,
          reactions: msg.reactions,
        });
      }
    }
  }

  res.json({ success: true, data: { messageId: msg._id, reactions: msg.reactions } });
});

module.exports.setSocketIO = setSocketIO;
