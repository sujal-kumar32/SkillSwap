const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { requireMentor } = require("../middleware/roleMiddleware");

const {
  getEarnings,
  getEarningTransactions,
  requestWithdrawal,
} = require("../apis/Wallet/earningsController");

router.get("/", protect, requireMentor, getEarnings);
router.get("/transactions", protect, requireMentor, getEarningTransactions);
router.post("/withdraw", protect, requireMentor, requestWithdrawal);

module.exports = router;
