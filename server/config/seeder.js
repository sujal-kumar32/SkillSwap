const userModel = require("../apis/Users/userModel");
const bcrypt = require("bcryptjs");

module.exports = async () => {
  try {
    console.log("Seeding admin user...");

    const adminName = process.env.ADMIN_NAME || "admin";
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.warn(
        "Admin seeding skipped: ADMIN_EMAIL and ADMIN_PASSWORD must be set.",
      );
      return;
    }

    if (adminPassword.length < 8) {
      console.warn(
        "Admin seeding skipped: ADMIN_PASSWORD must be at least 8 characters.",
      );
      return;
    }

    const existing = await userModel.findOne({ email: adminEmail });
    if (existing) {
      console.log("Admin already exists");
    } else {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      await userModel.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        roles: ["admin"],
        status: "active", // Admin is always active
      });

      console.log("Admin created successfully");
    }
  } catch (err) {
    console.log("Error seeding admin user", err);
  }
};
