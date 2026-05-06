const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = multer();
const protect = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");

const {
  createSkill,
  getSkills,
  getSkill,
  updateSkill,
  deleteSkill,
} = require("../apis/Skills/skillController");

router.post("/", protect, upload.single("thumbnail"), createSkill);
router.get("/", protect.optional, getSkills);
router.get("/:id", protect.optional, getSkill);
router.put("/:id", protect, requireAdmin, updateSkill);
router.delete("/:id", protect, requireAdmin, deleteSkill);

module.exports = router;
