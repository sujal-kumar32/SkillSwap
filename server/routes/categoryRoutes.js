const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const { category } = require("../validations");

const multer = require("multer");
const upload = multer();
const protect = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");

const {
  createCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  toggleStatus,
} = require("../apis/Categories/categoryController");

router.post("/", protect, requireAdmin, upload.single("file"), validate(category.create), createCategory);
router.get("/", getAllCategories);
router.get("/:id", getCategory);
router.put(
  "/:id",
  protect,
  requireAdmin,
  upload.single("file"),
  validate(category.update),
  updateCategory,
);
router.delete("/:id", protect, requireAdmin, deleteCategory);
router.patch("/toggle/:id", protect, requireAdmin, toggleStatus);

module.exports = router;
