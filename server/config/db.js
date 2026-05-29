const mongoose = require("mongoose");

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  throw new Error("MONGO_URI is not configured");
}

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("DB Connected");
  })
  .catch((err) => {
    console.error("DB Connection Error:", err.message);
    process.exit(1);
  });
