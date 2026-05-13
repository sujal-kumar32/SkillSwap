const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const { review } = require("../validations");
const protect = require("../middleware/authMiddleware");

const {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
} = require("../apis/Reviews/reviewController");

router.get("/", protect, getReviews);
router.post("/", protect, validate(review.create), createReview);
router.put("/:id", protect, validate(review.update), updateReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;
