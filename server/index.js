require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
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

app.use(cors());
app.use(express.urlencoded());

app.use(express.json());
const PORT = process.env.PORT || 3000;

const adminSeeder = require("./config/seeder");


adminSeeder();

app.get("/", (req, res) => {
  res.send("welcome back");
});

app.get("/myself", (req, res) => {
  res.send("My name is sujal and i am a software developer");
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/users", userRoutes);

app.listen(PORT, (err) => {
  if (err) {
    console.log("Server Error", err);
  } else {
    console.log("Server is Listening on ", PORT);
  }
});
