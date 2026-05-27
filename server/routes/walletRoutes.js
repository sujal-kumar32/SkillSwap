const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { wallet } = require("../validations");

const {
  getWallet,
  addFunds,
  verifyFunds,
  getTransactions,
  payWithWallet,
} = require("../apis/Wallet/walletController");

router.get("/", protect, getWallet);
router.post("/add-funds", protect, validate(wallet.addFunds), addFunds);
router.post("/verify-funds", protect, validate(wallet.verifyFunds), verifyFunds);
router.get("/transactions", protect, getTransactions);
router.post("/pay", protect, payWithWallet);

module.exports = router;
