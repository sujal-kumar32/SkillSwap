const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  createPayment,
  getPayments,
} = require("../apis/Payment/paymentController");

router.post("/", protect, createPayment);
router.get("/", protect, getPayments);

module.exports = router;
