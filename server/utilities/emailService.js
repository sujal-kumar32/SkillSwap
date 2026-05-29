const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify()
  .then(() => console.log("SMTP connected"))
  .catch((err) => console.error("SMTP connection failed:", err.message));

async function sendEmail({ to, subject, html, attachments }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP not configured — skipping email to", to);
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  };

  if (attachments && attachments.length) {
    mailOptions.attachments = attachments;
  }

  await transporter.sendMail(mailOptions);
}

module.exports = { sendEmail };
