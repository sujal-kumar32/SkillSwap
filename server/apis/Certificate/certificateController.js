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
  const cx = pageWidth / 2;

  const gold = "#c9a848";
  const goldLight = "#e8d48b";
  const dark = "#0f172a";
  const muted = "#64748b";
  const blue = "#0d6efd";

  doc.rect(0, 0, pageWidth, pageHeight).fill("#fcf9f0");

  doc.lineWidth(3).rect(18, 18, pageWidth - 36, pageHeight - 36).stroke(gold);
  doc.lineWidth(1.5).rect(24, 24, pageWidth - 48, pageHeight - 48).stroke(goldLight);
  doc.lineWidth(0.5).rect(28, 28, pageWidth - 56, pageHeight - 56).stroke(gold);
  doc.rect(30, 30, pageWidth - 60, pageHeight - 60).fill("#ffffff");

  const ornSize = 18;
  [
    [30, 30], [pageWidth - 30 - ornSize, 30],
    [30, pageHeight - 30 - ornSize], [pageWidth - 30 - ornSize, pageHeight - 30 - ornSize],
  ].forEach(([x, y]) => {
    doc.rect(x, y, ornSize, ornSize).fill(gold);
  });

  for (let x = 30; x <= pageWidth - 30; x += 4) {
    const waveY = 30 + 6 * Math.sin((x - 30) * Math.PI / 180);
    doc.rect(x, 30 + 6, 2, waveY - 30 - 6 + 2).fill(gold);
  }

  doc.rect(30, 30, pageWidth - 60, 110).fill("#0f172a");

  doc.lineWidth(2).moveTo(30, 140).lineTo(pageWidth - 30, 140).stroke(gold);

  const emblemY = 80;
  doc.circle(cx, emblemY, 24).fill(gold);
  doc.circle(cx, emblemY, 20).fill("#0f172a");
  doc.circle(cx, emblemY, 16).fill(gold);

  const centerText = (text, x, y, opts = {}) => {
    const w = opts.width || pageWidth;
    doc.fontSize(opts.fontSize || 12)
      .font(opts.font || "Helvetica")
      .fillColor(opts.color || "#000")
      .text(text, x - w / 2, y, { align: "center", width: w });
  };

  centerText("S", cx, emblemY - 10, { fontSize: 18, font: "Helvetica-Bold", color: "#0f172a", width: 30 });
  centerText("SKILLSWAP", cx, 48, { fontSize: 24, font: "Helvetica-Bold", color: gold });
  centerText("CERTIFICATE OF COMPLETION", cx, 115, { fontSize: 10, color: "#94a3b8" });

  let y = 170;

  centerText("THIS CERTIFICATE IS PRESENTED TO", cx, y, { fontSize: 11, color: muted });
  y += 32;
  centerText(user.name, cx, y, { fontSize: 34, font: "Helvetica-Bold", color: dark });
  y += 52;

  doc.lineWidth(1).moveTo(pageWidth * 0.12, y - 10).lineTo(pageWidth * 0.35, y - 10).stroke(gold);
  doc.lineWidth(1).moveTo(pageWidth * 0.65, y - 10).lineTo(pageWidth * 0.88, y - 10).stroke(gold);

  centerText("FOR SUCCESSFULLY COMPLETING THE SKILL", cx, y, { fontSize: 11, color: muted });
  y += 32;
  centerText(skillName, cx, y, { fontSize: 26, font: "Helvetica-Bold", color: blue });
  y += 48;

  const badgeW = 260;
  doc.roundedRect(cx - badgeW / 2, y, badgeW, 32, 16).fill("#f1f5f9");
  centerText(`${completed}/${total} sessions completed`, cx, y + 9, { fontSize: 10, font: "Helvetica-Bold", color: dark, width: badgeW });

  y += 50;

  doc.lineWidth(1.5).moveTo(cx - 100, y).lineTo(cx + 100, y).stroke(gold);
  y += 18;

  centerText(`Mentor: ${mentorName}`, cx, y, { fontSize: 11, color: dark });
  y += 22;

  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  centerText(`Issued: ${dateStr}`, cx, y, { fontSize: 10, color: muted });
  y += 22;

  const certId = `SKL-${Date.now().toString(36).toUpperCase()}-${req.user.id.toString().slice(-6).toUpperCase()}`;
  centerText(`Certificate ID: ${certId}`, cx, y, { fontSize: 8, color: "#94a3b8" });

  doc.lineWidth(1).moveTo(48, 160).lineTo(48, pageHeight - 60).stroke(goldLight);
  doc.lineWidth(1).moveTo(pageWidth - 48, 160).lineTo(pageWidth - 48, pageHeight - 60).stroke(goldLight);

  for (let x = 30; x <= pageWidth - 30; x += 4) {
    const waveY = pageHeight - 38 + 4 * Math.sin((x - 30) * Math.PI / 60);
    doc.rect(x, pageHeight - 38, 2, waveY - (pageHeight - 38) + 2).fill(gold);
  }

  const sealX = pageWidth - 85;
  const sealY = pageHeight - 110;
  doc.circle(sealX, sealY, 28).fill(gold);
  doc.circle(sealX, sealY, 24).fill("#ffffff");
  doc.circle(sealX, sealY, 22).stroke(gold);
  centerText("SKILLSWAP", sealX, sealY - 3, { fontSize: 7, font: "Helvetica-Bold", color: gold, width: 44 });
  centerText("VERIFIED", sealX, sealY + 5, { fontSize: 6, color: muted, width: 44 });

  centerText("This certificate is digitally issued by SkillSwap. Verify authenticity at skillswap.app/verify", cx, pageHeight - 35, { fontSize: 7, color: "#cbd5e1" });

  doc.end();
});
