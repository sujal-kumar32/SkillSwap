const PDFDocument = require("pdfkit");
const Request = require("../Request/requestModel");
const User = require("../Users/userModel");
const asyncHandler = require("../../utilities/asyncHandler");
const { sendEmail } = require("../../utilities/emailService");
const { certificateCompleted } = require("../../utilities/emailTemplates");

exports.downloadCertificate = asyncHandler(async (req, res) => {

  const { skillName } = req.params;

  const bookings = await Request.find({ learnerId: req.user.id })
    .populate({
      path: "sessionId",
      select: "title skillId mentorId",
      populate: [
        { path: "skillId", select: "name" },
        { path: "mentorId", select: "name" },
      ],
    })
    .lean();

  const skillBookings = bookings.filter(
    (b) => (b.sessionId?.skillId?.name || "General Learning") === skillName,
  );

  if (!skillBookings.length) {
    return res.status(404).json({ success: false, message: "No sessions found for this skill" });
  }

  const total = skillBookings.length;
  const completed = skillBookings.filter((b) => b.requestStatus === "completed").length;
  const completion = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (completion < 100) {
    return res.status(400).json({ success: false, message: "Skill not yet fully completed" });
  }

  const user = await User.findById(req.user.id).select("name email").lean();
  const mentorName = skillBookings[0]?.sessionId?.mentorId?.name || "SkillSwap Mentor";

  const doc = new PDFDocument({
    layout: "landscape",
    size: "A4",
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  const certFilename = `certificate-${skillName.replace(/\s+/g, "-").toLowerCase()}.pdf`;

  const buffers = [];
  doc.on("data", (chunk) => buffers.push(chunk));

  doc.on("end", async () => {
    const pdfBuffer = Buffer.concat(buffers);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${certFilename}"`);
    res.send(pdfBuffer);

    sendEmail({
      to: user.email,
      subject: `Congratulations ${user.name}! You earned a certificate for ${skillName}`,
      html: certificateCompleted(user.name, skillName, mentorName),
      attachments: [
        {
          filename: certFilename,
          content: pdfBuffer,
        },
      ],
    });
  });

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  const gold = "#c9a848";
  const dark = "#1e293b";
  const muted = "#64748b";

  doc.rect(0, 0, pageWidth, pageHeight).fill("#faf9f6");
  doc.lineWidth(2).rect(20, 20, pageWidth - 40, pageHeight - 40).stroke(gold);
  doc.lineWidth(1).rect(28, 28, pageWidth - 56, pageHeight - 56).stroke(gold);
  doc.rect(30, 30, pageWidth - 60, pageHeight - 60).fill("#ffffff");
  doc.rect(30, 30, pageWidth - 60, 100).fill("#1e293b");

  doc.fontSize(28).font("Helvetica-Bold").fillColor(gold)
    .text("SKILLSWAP", pageWidth / 2, 48, { align: "center" });
  doc.fontSize(11).font("Helvetica").fillColor("#94a3b8")
    .text("CERTIFICATE OF COMPLETION", pageWidth / 2, 82, { align: "center" });
  doc.fontSize(10).font("Helvetica").fillColor("#94a3b8")
    .text("SkillSwap Learning Platform", pageWidth / 2, 105, { align: "center" });

  const centerX = pageWidth / 2;
  let y = 170;

  doc.fontSize(13).font("Helvetica").fillColor(muted)
    .text("THIS CERTIFICATE IS PRESENTED TO", centerX, y, { align: "center" });
  y += 35;
  doc.fontSize(36).font("Helvetica-Bold").fillColor(dark)
    .text(user.name, centerX, y, { align: "center" });
  y += 55;
  doc.fontSize(13).font("Helvetica").fillColor(muted)
    .text("FOR SUCCESSFULLY COMPLETING THE SKILL", centerX, y, { align: "center" });
  y += 35;
  doc.fontSize(28).font("Helvetica-Bold").fillColor("#0d6efd")
    .text(skillName, centerX, y, { align: "center" });
  y += 50;
  doc.fontSize(11).font("Helvetica").fillColor(muted)
    .text(`Completed ${completed} of ${total} sessions | ${completion}% completion`, centerX, y, { align: "center" });
  y += 50;
  doc.moveTo(pageWidth / 2 - 120, y).lineTo(pageWidth / 2 + 120, y).stroke(gold);
  y += 20;
  doc.fontSize(12).font("Helvetica").fillColor(dark)
    .text(`Mentor: ${mentorName}`, centerX, y, { align: "center" });
  y += 25;
  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  doc.fontSize(11).font("Helvetica").fillColor(muted)
    .text(`Date: ${dateStr}`, centerX, y, { align: "center" });
  y += 25;
  const certId = `SKL-${Date.now().toString(36).toUpperCase()}-${req.user.id.toString().slice(-6).toUpperCase()}`;
  doc.fontSize(9).font("Helvetica").fillColor("#94a3b8")
    .text(`Certificate ID: ${certId}`, centerX, y, { align: "center" });
  doc.fontSize(8).font("Helvetica").fillColor("#cbd5e1")
    .text("This certificate is digitally issued by SkillSwap. Verify authenticity at skillswap.app/verify", centerX, pageHeight - 45, { align: "center" });

  doc.end();
});
