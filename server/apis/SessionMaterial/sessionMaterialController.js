const SessionMaterial = require("./sessionMaterialModel");
const Session = require("../Session/sessionModel");
const { uploadBuffer, destroyImage } = require("../../utilities/cloudinaryUpload");
const asyncHandler = require("../../utilities/asyncHandler");

const mimeToType = (mime) => {
  if (mime === "application/pdf") return "pdf";
  if (
    mime === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    mime === "application/vnd.ms-powerpoint"
  )
    return "slide";
  if (
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "document";
  if (
    mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mime === "application/vnd.ms-excel"
  )
    return "spreadsheet";
  return "other";
};

exports.getMaterials = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const materials = await SessionMaterial.find({ sessionId })
    .populate("uploadedBy", "name profileImage")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: materials });
});

exports.uploadMaterial = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const session = await Session.findById(sessionId);
  if (!session) {
    return res.status(404).json({ success: false, message: "Session not found" });
  }

  if (session.mentorId?.toString() !== req.user.id && !req.user.roles?.includes("admin")) {
    return res.status(403).json({ success: false, message: "Only the session mentor can upload materials" });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file provided" });
  }

  const publicId = `session_material_${sessionId}_${Date.now()}`;
  const isImage = req.file.mimetype.startsWith("image/");
  const result = await uploadBuffer(req.file.buffer, {
    public_id: publicId,
    resource_type: isImage ? "image" : "raw",
  });

  const material = await SessionMaterial.create({
    sessionId,
    title: req.file.originalname.replace(/\.[^/.]+$/, ""),
    type: isImage ? "other" : mimeToType(req.file.mimetype),
    fileUrl: result.secure_url,
    filePublicId: result.public_id,
    fileSize: req.file.size,
    uploadedBy: req.user.id,
  });

  const populated = await material.populate("uploadedBy", "name profileImage");

  res.status(201).json({ success: true, data: populated });
});

exports.deleteMaterial = asyncHandler(async (req, res) => {
  const { sessionId, materialId } = req.params;

  const material = await SessionMaterial.findOne({ _id: materialId, sessionId });
  if (!material) {
    return res.status(404).json({ success: false, message: "Material not found" });
  }

  const session = await Session.findById(sessionId);
  if (
    session.mentorId?.toString() !== req.user.id &&
    !req.user.roles?.includes("admin")
  ) {
    return res.status(403).json({ success: false, message: "Only the session mentor can delete materials" });
  }

  if (material.filePublicId) {
    const isImage = material.type === "other" && material.fileUrl?.includes("/image/upload/");
    await destroyImage(material.filePublicId, {
      resource_type: isImage ? "image" : "raw",
    }).catch(() => {});
  }

  await material.deleteOne();

  res.json({ success: true, message: "Material deleted" });
});
