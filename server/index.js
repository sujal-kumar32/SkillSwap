require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const app = express();

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
const badgeRoutes = require("./routes/badgeRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
app.use("/api/badges", badgeRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.message);
  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: "A record with this value already exists" });
  }
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.expose ? err.message : "Internal server error",
  });
});

process.on("uncaughtException", (err) => {
  console.error("FATAL:", err.message);
});

app.listen(PORT, (err) => {
  if (err) {
    console.log("Server Error", err);
  } else {
    console.log("Server is Listening on", PORT);
  }
});
