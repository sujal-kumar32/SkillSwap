const Wallet = require("../apis/Wallet/walletModel");
const Transaction = require("../apis/Wallet/transactionModel");
const CREDIT_RATES = require("../config/creditRates");

function calculateCreditCost(session) {
  if (!session.creditSnapshot) return 0;
  const rate = CREDIT_RATES[session.creditSnapshot.level] || CREDIT_RATES.beginner;
  const hours = (session.creditSnapshot.duration || 60) / 60;
  return Math.round(rate * hours);
}

async function lockCredits(userId, amount, mongoSession) {
  const wallet = await Wallet.findOne({ userId }).session(mongoSession || null);
  if (!wallet) throw new Error("Wallet not found");
  const available = wallet.skillCredits - wallet.lockedCredits;
  if (available < amount) throw new Error("Insufficient credits");
  wallet.lockedCredits += amount;
  if (wallet.lockedCredits < 0 || wallet.skillCredits < 0)
    throw new Error("Invalid credit balance");
  await wallet.save({ session: mongoSession || null });
  return wallet;
}

async function releaseCredits(userId, amount, mongoSession) {
  const wallet = await Wallet.findOne({ userId }).session(mongoSession || null);
  if (!wallet) throw new Error("Wallet not found");
  wallet.lockedCredits = Math.max(0, wallet.lockedCredits - amount);
  if (wallet.lockedCredits < 0) throw new Error("Invalid locked credits");
  await wallet.save({ session: mongoSession || null });
  return wallet;
}

async function transferCredits(fromUserId, toUserId, amount, requestId, mongoSession) {
  const opts = mongoSession ? { session: mongoSession } : {};

  const learnerWallet = await Wallet.findOne({ userId: fromUserId }).session(mongoSession || null);
  if (!learnerWallet) throw new Error("Learner wallet not found");
  const learnerBefore = learnerWallet.skillCredits;
  learnerWallet.skillCredits -= amount;
  learnerWallet.lockedCredits -= amount;
  if (learnerWallet.skillCredits < 0 || learnerWallet.lockedCredits < 0)
    throw new Error("Invalid credit balance after transfer");
  await learnerWallet.save(opts);

  let mentorWallet = await Wallet.findOne({ userId: toUserId }).session(mongoSession || null);
  const mentorBefore = mentorWallet?.skillCredits || 0;
  if (!mentorWallet) {
    [mentorWallet] = await Wallet.create([{ userId: toUserId, skillCredits: amount }], opts);
  } else {
    mentorWallet.skillCredits += amount;
    await mentorWallet.save(opts);
  }

  await Transaction.create(
    [
      {
        walletId: learnerWallet._id,
        userId: fromUserId,
        type: "credit_spent",
        amount: amount,
        balanceBefore: learnerBefore,
        balanceAfter: learnerWallet.skillCredits,
        reference: String(requestId),
        referenceModel: "Request",
        referenceType: "request",
        description: "Credits spent on session",
        status: "completed",
      },
      {
        walletId: mentorWallet._id,
        userId: toUserId,
        type: "credit_earned",
        amount: amount,
        balanceBefore: mentorBefore,
        balanceAfter: mentorWallet.skillCredits || mentorBefore + amount,
        reference: String(requestId),
        referenceModel: "Request",
        referenceType: "request",
        description: "Credits earned from session",
        status: "completed",
      },
    ],
    opts
  );
}

module.exports = { calculateCreditCost, lockCredits, releaseCredits, transferCredits };
