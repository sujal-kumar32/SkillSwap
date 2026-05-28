const { Server } = require("socket.io");

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

  io.on("connection", (socket) => {
    socket.join(`user:${socket.userId}`);

    socket.on("disconnect", () => {
      socket.leave(`user:${socket.userId}`);
    });
  });

  return io;
}

module.exports = { initSocket };
