const express = require("express");
const router = express.Router({ mergeParams: true });
const protect = require("../middleware/authMiddleware");
const { uploadMaterial } = require("../middleware/upload");

const {
  getMaterials,
  uploadMaterial: uploadMaterialHandler,
  deleteMaterial,
} = require("../apis/SessionMaterial/sessionMaterialController");

router.get("/", protect.optional, getMaterials);
router.post("/", protect, uploadMaterial.single("file"), uploadMaterialHandler);
router.delete("/:materialId", protect, deleteMaterial);

module.exports = router;
