const sgMail = require("@sendgrid/mail");

const API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@skillswap.com";
const FROM_NAME = process.env.SENDGRID_FROM_NAME || "SkillSwap";

if (API_KEY) {
  sgMail.setApiKey(API_KEY);
} else {
  console.warn("SENDGRID_API_KEY not set — emails will be skipped");
}

async function sendEmail({ to, subject, html, attachments }) {
  if (!API_KEY) {
    console.warn("SendGrid not configured — skipping email to", to);
    return;
  }

  const msg = {
    to,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject,
    html,
  };

  if (attachments && attachments.length) {
    msg.attachments = attachments.map((att) => {
      const isBuffer = Buffer.isBuffer(att.content);
      return {
        content: isBuffer ? att.content.toString("base64") : att.content,
        filename: att.filename,
        type: att.contentType || att.type || "application/octet-stream",
        disposition: att.disposition || "attachment",
      };
    });
  }

  try {
    await sgMail.send(msg);
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (err) {
    console.error(`Failed to send email to ${to}:`, err.message);
    if (err.response?.body) {
      console.error("SendGrid response:", JSON.stringify(err.response.body, null, 2));
    }
    throw err;
  }
}

module.exports = { sendEmail };
