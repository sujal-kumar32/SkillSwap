const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const { payment } = require("../validations");
const protect = require("../middleware/authMiddleware");

const {
  createOrder,
  verifyPayment,
  createPayment,
  getPayments,
} = require("../apis/Payment/paymentController");

router.post("/create-order", protect, validate(payment.createOrder), createOrder);
router.post("/verify-payment", protect, validate(payment.verifyPayment), verifyPayment);
router.post("/", protect, validate(payment.create), createPayment);
router.get("/", protect, getPayments);

module.exports = router;
