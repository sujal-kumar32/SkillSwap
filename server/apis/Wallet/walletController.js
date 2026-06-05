const Wallet = require("./walletModel");
const Transaction = require("./transactionModel");
const Request = require("../Request/requestModel");
const Session = require("../Session/sessionModel");
const razorpay = require("../../config/razorpay");
const asyncHandler = require("../../utilities/asyncHandler");
const getPagination = require("../../utilities/paginate");

const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = await Wallet.create({ userId });
  }
  return wallet;
};

exports.getWallet = asyncHandler(async (req, res) => {
  const wallet = await getOrCreateWallet(req.user.id);
  res.json({ success: true, data: wallet });
});

exports.addFunds = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: "Invalid amount" });
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({ success: false, message: "Payment gateway not configured" });
  }

  const wallet = await getOrCreateWallet(req.user.id);

  if (amount < 1) {
    return res.status(400).json({ success: false, message: "Minimum deposit is ₹1" });
  }

  const amountInPaisa = Math.round(amount * 100);
  let order;
  try {
    order = await razorpay.orders.create({
      amount: amountInPaisa,
      currency: "INR",
      receipt: `wallet_${req.user.id}_${Date.now()}`.slice(0, 40),
      notes: { userId: String(req.user.id), type: "wallet_deposit" },
    });
  } catch (razorpayErr) {
    const detail = razorpayErr?.error?.description || razorpayErr?.message || "Payment gateway error";
    return res.status(razorpayErr?.statusCode || 502).json({ success: false, message: detail });
  }

  const transaction = await Transaction.create({
    walletId: wallet._id,
    userId: req.user.id,
    type: "deposit",
    amount: Number(amount),
    balanceBefore: wallet.balance,
    balanceAfter: wallet.balance,
    reference: order.id,
    description: `Add funds to wallet`,
    status: "pending",
  });

  res.json({
    success: true,
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      transactionId: transaction._id,
    },
  });
});

exports.verifyFunds = asyncHandler(async (req, res) => {
  const { orderId, razorpayPaymentId, razorpaySignature } = req.body;

  const crypto = require("crypto");
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(orderId + "|" + razorpayPaymentId)
    .digest("hex");

  if (generatedSignature !== razorpaySignature) {
    return res.status(400).json({ success: false, message: "Invalid payment signature" });
  }

  const transaction = await Transaction.findOne({ reference: orderId, status: "pending" });
  if (!transaction) {
    return res.status(404).json({ success: false, message: "Transaction not found" });
  }

  const wallet = await Wallet.findById(transaction.walletId);
  if (!wallet) {
    return res.status(404).json({ success: false, message: "Wallet not found" });
  }

  transaction.balanceBefore = wallet.balance;
  wallet.balance += transaction.amount;
  wallet.totalDeposited += transaction.amount;
  await wallet.save();

  transaction.balanceAfter = wallet.balance;
  transaction.status = "completed";
  transaction.reference = razorpayPaymentId;
  await transaction.save();

  res.json({
    success: true,
    message: "Funds added successfully",
    data: { balance: wallet.balance, transaction },
  });
});

exports.getTransactions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const wallet = await getOrCreateWallet(req.user.id);

  const filter = { walletId: wallet._id };
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

exports.payWithWallet = asyncHandler(async (req, res) => {
  const { requestId } = req.body;

  const request = await Request.findById(requestId).populate("sessionId");
  if (!request) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }

  if (request.learnerId.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: "Not your booking" });
  }

  if (request.bookingSource === "credits") {
    return res.status(400).json({ success: false, message: "Credit bookings use credits, not wallet balance" });
  }

  if (request.paymentStatus === "paid") {
    return res.status(400).json({ success: false, message: "Already paid" });
  }

  const price = Number(request.sessionId?.price) || 0;
  if (price <= 0) {
    return res.status(400).json({ success: false, message: "Session is free" });
  }

  const wallet = await getOrCreateWallet(req.user.id);
  if (wallet.balance < price) {
    return res.status(400).json({
      success: false,
      message: "Insufficient wallet balance",
      balance: wallet.balance,
      required: price,
    });
  }

  const transaction = await Transaction.create({
    walletId: wallet._id,
    userId: req.user.id,
    type: "payment",
    amount: price,
    balanceBefore: wallet.balance,
    balanceAfter: wallet.balance - price,
    reference: requestId,
    referenceModel: "Request",
    description: `Payment for session booking`,
    status: "completed",
  });

  wallet.balance -= price;
  await wallet.save();

  transaction.balanceAfter = wallet.balance;
  await transaction.save();

  request.paymentStatus = "paid";
  await request.save();

  res.json({
    success: true,
    message: "Payment successful",
    data: { balance: wallet.balance, transaction, request },
  });
});

// GET CREDIT TRANSACTION HISTORY
exports.getCreditHistory = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const filter = {
    userId: req.user.id,
    type: { $in: ["credit_earned", "credit_spent", "credit_refunded"] },
  };

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Transaction.countDocuments(filter),
  ]);

  const wallet = await Wallet.findOne({ userId: req.user.id }).select("skillCredits lockedCredits").lean();

  res.json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: {
      skillCredits: wallet?.skillCredits || 0,
      lockedCredits: wallet?.lockedCredits || 0,
      transactions,
    },
  });
});
