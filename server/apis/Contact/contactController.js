const ContactMessage = require("./contactModel");
const asyncHandler = require("../../utilities/asyncHandler");
const { sendEmail } = require("../../utilities/emailService");

exports.submitContact = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "Name, email, and message are required" });
  }

  await ContactMessage.create({ name, email, subject, message });

  try {
    await sendEmail({
      to: process.env.EMAIL_FROM || "skillswap011@gmail.com",
      subject: `New Contact: ${subject || "No Subject"} — from ${name}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject || "—"}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });
  } catch (err) {
    console.error("Contact notification email failed:", err.message);
  }

  res.json({ success: true, message: "Thank you for reaching out! We'll get back to you soon." });
});
