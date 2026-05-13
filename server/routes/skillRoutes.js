const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const { skill } = require("../validations");

const upload = require("../middleware/upload");
const protect = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");

const {
  createSkill,
  getSkills,
  getSkill,
  updateSkill,
  deleteSkill,
} = require("../apis/Skills/skillController");

router.post("/", protect, upload.single("thumbnail"), validate(skill.create), createSkill);
router.get("/", protect.optional, getSkills);
router.get("/:id", protect.optional, getSkill);
router.put("/:id", protect, requireAdmin, upload.single("thumbnail"), validate(skill.update), updateSkill);
router.delete("/:id", protect, requireAdmin, deleteSkill);

module.exports = router;
