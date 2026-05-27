const Wallet = require("./walletModel");
const Transaction = require("./transactionModel");
const asyncHandler = require("../../utilities/asyncHandler");
const getPagination = require("../../utilities/paginate");

exports.getEarnings = asyncHandler(async (req, res) => {
  let wallet = await Wallet.findOne({ userId: req.user.id });
  if (!wallet) {
    wallet = await Wallet.create({ userId: req.user.id });
  }

  res.json({
    success: true,
    data: {
      balance: wallet.balance,
      totalEarned: wallet.totalEarned,
      totalWithdrawn: wallet.totalWithdrawn,
    },
  });
});

exports.getEarningTransactions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const wallet = await Wallet.findOne({ userId: req.user.id });
  if (!wallet) {
    return res.json({ success: true, total: 0, page: 1, pages: 1, data: [] });
  }

  const filter = {
    walletId: wallet._id,
    type: { $in: ["earning", "withdrawal"] },
  };
  const [transactions, total] = await Promise.all([
    Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Transaction.countDocuments(filter),
  ]);

  res.json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: transactions,
  });
});

exports.requestWithdrawal = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: "Invalid amount" });
  }

  const wallet = await Wallet.findOne({ userId: req.user.id });
  if (!wallet || wallet.balance < amount) {
    return res.status(400).json({ success: false, message: "Insufficient balance" });
  }

  const transaction = await Transaction.create({
    walletId: wallet._id,
    userId: req.user.id,
    type: "withdrawal",
    amount: Number(amount),
    balanceBefore: wallet.balance,
    balanceAfter: wallet.balance - amount,
    description: `Withdrawal request`,
    status: "pending",
  });

  wallet.balance -= Number(amount);
  wallet.totalWithdrawn += Number(amount);
  await wallet.save();

  transaction.balanceAfter = wallet.balance;
  await transaction.save();

  res.json({
    success: true,
    message: "Withdrawal request submitted",
    data: { balance: wallet.balance, transaction },
  });
});
