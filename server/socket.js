const { Server } = require("socket.io");
const User = require("./apis/Users/userModel");
const Chat = require("./apis/Chat/chatModel");

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const cookieToken = socket.handshake.headers?.cookie?.split(";").find((c) => c.trim().startsWith("token="))?.split("=")[1];
    const authToken = socket.handshake.auth?.token;
    const token = cookieToken || authToken;
    if (!token) return next(new Error("Authentication required"));

    try {
      const jwt = require("jsonwebtoken");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    socket.join(`user:${socket.userId}`);

    // Presence (fire-and-forget with .catch)
    User.findByIdAndUpdate(socket.userId, { isOnline: true, lastActive: new Date() }).catch(() => {});
    socket.broadcast.emit("user_online", { userId: socket.userId });

    socket.on("typing", ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit("typing", { chatId, userId: socket.userId });
    });

    socket.on("stop_typing", ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit("stop_typing", { chatId, userId: socket.userId });
    });

    socket.on("join_chat", async ({ chatId }) => {
      const chat = await Chat.findById(chatId).select("participants").lean().catch(() => null);
      if (chat && chat.participants.some((p) => p.toString() === socket.userId)) {
        socket.join(`chat:${chatId}`);
      }
    });

    socket.on("leave_chat", ({ chatId }) => {
      socket.leave(`chat:${chatId}`);
    });

    socket.on("disconnect", async () => {
      socket.leave(`user:${socket.userId}`);
      User.findByIdAndUpdate(socket.userId, { isOnline: false, lastActive: new Date() }).catch(() => {});
      socket.broadcast.emit("user_offline", { userId: socket.userId });
    });
  });

  return io;
}

module.exports = { initSocket };
