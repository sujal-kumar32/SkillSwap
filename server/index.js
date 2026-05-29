require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const app = express();
const server = http.createServer(app);

const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const skillRoutes = require("./routes/skillRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const requestRoutes = require("./routes/requestRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const chatRoutes = require("./routes/chatRoutes");
const userRoutes = require("./routes/userRoutes");
const profileRoutes = require("./routes/profileRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const progressRoutes = require("./routes/progressRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const aiRoutes = require("./routes/aiRoutes");
const mentorApplicationRoutes = require("./routes/mentorApplicationRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const availabilityRoutes = require("./routes/availabilityRoutes");
const sessionMaterialRoutes = require("./routes/sessionMaterialRoutes");
const walletRoutes = require("./routes/walletRoutes");
const earningsRoutes = require("./routes/earningsRoutes");
const badgeRoutes = require("./routes/badgeRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const followRoutes = require("./routes/followRoutes");
const feedRoutes = require("./routes/feedRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

app.use(helmet());
app.set("trust proxy", 1);
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static("uploads"));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const PORT = process.env.PORT || 3000;

const adminSeeder = require("./config/seeder");
const { seedBadges } = require("./apis/Badges/badgeSeeder");
const cron = require("node-cron");
const { checkSessionReminders, autoCompleteSessions } = require("./jobs/sessionReminder");

adminSeeder();
seedBadges();

cron.schedule("* * * * *", () => {
  checkSessionReminders();
});

cron.schedule("*/5 * * * *", () => {
  autoCompleteSessions();
});

app.get("/", (req, res) => {
  res.send("welcome back");
});

app.get("/myself", (req, res) => {
  res.send("My name is sujal and i am a software developer");
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/mentor-applications", mentorApplicationRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/sessions/:sessionId/materials", sessionMaterialRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/earnings", earningsRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/disputes", require("./routes/disputeRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.use((err, req, res, next) => {
  const message = err?.error?.description || err?.message || "Internal server error";
  console.error("Unhandled Error:", message);
  if (err?.code === 11000) {
    return res.status(409).json({ success: false, message: "A record with this value already exists" });
  }
  const statusCode = err?.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message,
  });
});

process.on("uncaughtException", (err) => {
  console.error("FATAL:", err.message);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
  process.exit(1);
});

const { initSocket } = require("./socket");
const { setSocketIO: setNotifIO } = require("./services/notificationService");
const { setSocketIO: setChatIO } = require("./apis/Chat/chatController");

const io = initSocket(server);
app.set("io", io);
setNotifIO(io);
setChatIO(io);

server.listen(PORT, (err) => {
  if (err) {
    console.log("Server Error", err);
  } else {
    console.log("Server is Listening on", PORT);
  }
});

const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log("HTTP server closed.");
  });
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  } catch (e) {
    console.error("Error disconnecting MongoDB:", e.message);
  }
  io?.close(() => {
    console.log("Socket.io closed.");
    process.exit(0);
  });
  setTimeout(() => process.exit(0), 5000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
