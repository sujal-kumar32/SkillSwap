// One-time migration: add "paid" to existing sessions that only have "credits" in bookingTypes
// Usage: node scripts/fixBookingTypes.js

const mongoose = require("mongoose");

async function run() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/skillswap";
  await mongoose.connect(uri);
  console.log("Connected to DB");

  const db = mongoose.connection.db;
  const result = await db.collection("sessions").updateMany(
    { bookingTypes: ["credits"] },
    { $set: { bookingTypes: ["paid", "credits"] } },
  );

  console.log(`Fixed ${result.modifiedCount} sessions`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
