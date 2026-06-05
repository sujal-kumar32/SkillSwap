import React, { useCallback, useEffect, useState } from "react";
import Apiservices from "../../../../Apiservices";
import LoadingButton from "../../../../src/utils/LoadingButton";
import { showToast } from "../../../utils/toastUtils";
import { EmptyState, LoadingState, PageHeader } from "../../learner/LearnerUI";
import Pagination from "../../Pagination";

const typeLabels = {
  deposit: { icon: "fa-plus-circle", color: "#16a34a", label: "Deposit" },
  payment: { icon: "fa-arrow-right", color: "#dc2626", label: "Payment" },
  earning: { icon: "fa-arrow-left", color: "#0d6efd", label: "Earning" },
  withdrawal: { icon: "fa-arrow-up", color: "#9333ea", label: "Withdrawal" },
  refund: { icon: "fa-undo", color: "#2563eb", label: "Refund" },
  credit_earned: { icon: "fa-coins", color: "#16a34a", label: "Credits Earned" },
  credit_spent: { icon: "fa-arrow-right", color: "#dc2626", label: "Credits Spent" },
  credit_refunded: { icon: "fa-undo", color: "#2563eb", label: "Credits Refunded" },
};

const formatDate = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const LearnerWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositing, setDepositing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("money");
  const [creditData, setCreditData] = useState(null);
  const [creditTransactions, setCreditTransactions] = useState([]);
  const [creditPage, setCreditPage] = useState(1);
  const [creditPages, setCreditPages] = useState(1);

  const fetchWallet = useCallback(async () => {
    try {
      const [walletRes, txRes, creditRes] = await Promise.all([
        Apiservices.getWallet(),
        Apiservices.getWalletTransactions({ page, limit: 10 }),
        Apiservices.getCreditHistory({ page: creditPage, limit: 10 }).catch(() => null),
      ]);
      setWallet(walletRes.data.data);
      setTransactions(txRes.data.data || []);
      setTotalPages(txRes.data.pages || 1);
      if (creditRes?.data?.data) {
        setCreditData(creditRes.data.data);
        setCreditTransactions(creditRes.data.data.transactions || []);
        setCreditPages(creditRes.data.pages || 1);
      }
    } catch {
      setWallet(null);
    } finally {
      setLoading(false);
    }
  }, [page, creditPage]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const loadRazorpay = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handleDeposit = async () => {
    const amount = Number(depositAmount);
    if (!amount || amount <= 0) {
      showToast.warning("Enter a valid amount");
      return;
    }
    setDepositing(true);
    try {
      const ready = await loadRazorpay();
      if (!ready) {
        showToast.error("Payment system unavailable");
        setDepositing(false);
        return;
      }

      const orderRes = await Apiservices.addWalletFunds(amount);
      const { orderId, amount: amt, currency, keyId } = orderRes.data.data;

      const options = {
        key: keyId,
        amount: amt,
        currency,
        name: "SkillSwap",
        description: "Add funds to wallet",
        order_id: orderId,
        handler: async (response) => {
          try {
            await Apiservices.verifyWalletFunds({
              orderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            showToast.success("Funds added to wallet");
            setDepositAmount("");
            fetchWallet();
          } catch {
            showToast.error("Payment verification failed");
          }
        },
        modal: { ondismiss: () => setDepositing(false) },
        prefill: { contact: "", email: "" },
        theme: { color: "#0d6efd" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        showToast.error("Payment failed");
        setDepositing(false);
      });
      rzp.open();
    } catch (err) {
      showToast.error(err.response?.data?.message || "Failed to initiate deposit");
    } finally {
      setDepositing(false);
    }
  };

  if (loading) return <LoadingState label="Loading wallet..." />;

  return (
    <>
      <PageHeader title="SkillWallet" subtitle="Manage your money balance and skill credits." />

      <div className="d-flex gap-2 mb-4">
        <button className={`px-4 py-2 fw-semibold rounded-pill border-0 ${activeTab === "money" ? "btn btn-primary" : "btn btn-outline-secondary"}`}
          style={{ fontSize: "0.85rem" }} onClick={() => setActiveTab("money")}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><i className="fa fa-wallet" /> Money</span>
        </button>
        <button className={`px-4 py-2 fw-semibold rounded-pill border-0 ${activeTab === "credits" ? "btn btn-success" : "btn btn-outline-secondary"}`}
          style={{ fontSize: "0.85rem" }} onClick={() => setActiveTab("credits")}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><i className="fa fa-coins" /> Skill Credits</span>
        </button>
      </div>

      {activeTab === "money" ? (
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm p-4 rounded-4 text-center">
              <div className="d-flex align-items-center justify-content-center" style={{ gap: 10 }}>
                <i className="fa fa-wallet text-primary" style={{ fontSize: "2rem" }} />
                <h5 className="fw-bold mb-0">Balance</h5>
              </div>
              <h2 className="fw-bold mt-3 mb-0" style={{ color: "#0d6efd" }}>
                ₹{wallet?.balance?.toLocaleString("en-IN") || "0"}
              </h2>
              <p className="text-muted small mt-2 mb-0">
                Total deposited: ₹{(wallet?.totalDeposited || 0).toLocaleString("en-IN")}
              </p>
              <hr />
              <div className="mb-3">
                <label className="form-label fw-semibold small">Add Funds</label>
                <div className="d-flex" style={{ gap: 8 }}>
                  <input
                    type="number"
                    className="form-control rounded-pill"
                    placeholder="Amount"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    min="1"
                  />
                </div>
              </div>
              <LoadingButton
                className="btn btn-primary rounded-pill w-100 py-2 d-inline-flex align-items-center justify-content-center"
                style={{ gap: 6 }}
                loading={depositing}
                onClick={handleDeposit}
              >
                <i className="fa fa-credit-card" /> {depositing ? "Processing..." : "Deposit"}
              </LoadingButton>
              <p className="text-muted small mt-3 mb-0 text-center" style={{ fontSize: "0.75rem" }}>
                <i className="fa fa-info-circle me-1" /> Deposits are non-refundable and can only be used for bookings.
              </p>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3 d-flex align-items-center" style={{ gap: 8 }}>
                  <i className="fa fa-history text-primary" /> Transaction History
                </h6>
                {transactions.length === 0 ? (
                  <p className="text-muted small mb-0 text-center py-4">No transactions yet</p>
                ) : (
                  <div className="d-flex flex-column" style={{ gap: 6 }}>
                    {transactions.map((tx) => {
                      const info = typeLabels[tx.type] || { icon: "fa-circle", color: "#6b7280", label: tx.type };
                      return (
                        <div
                          key={tx._id}
                          className="d-flex align-items-center justify-content-between px-3 py-2 rounded-3"
                          style={{ background: "#f8fafc", border: "1px solid #e9ecef" }}
                        >
                          <div className="d-flex align-items-center" style={{ gap: 10, minWidth: 0 }}>
                            <span
                              className="d-flex align-items-center justify-content-center"
                              style={{ width: 34, height: 34, borderRadius: 8, background: info.color, color: "white", fontSize: "0.85rem", flexShrink: 0 }}
                            >
                              <i className={`fa ${info.icon}`} />
                            </span>
                            <div>
                              <p className="fw-semibold mb-0" style={{ fontSize: "0.82rem" }}>{info.label}</p>
                              <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                                {tx.description || tx.type}
                                {tx.createdAt ? ` • ${formatDate(tx.createdAt)}` : ""}
                              </small>
                            </div>
                          </div>
                          <div className="text-end" style={{ flexShrink: 0 }}>
                            <span className="fw-bold" style={{ fontSize: "0.85rem", color: ["payment", "withdrawal"].includes(tx.type) ? "#dc2626" : "#16a34a" }}>
                              {["payment", "withdrawal"].includes(tx.type) ? "-" : "+"}₹{tx.amount?.toLocaleString("en-IN") || "0"}
                            </span>
                            <br />
                            <small className="text-muted" style={{ fontSize: "0.65rem" }}>
                              Balance: ₹{(tx.balanceAfter || 0).toLocaleString("en-IN")}
                            </small>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="mt-3">
                  <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm p-4 rounded-4 text-center">
              <div className="d-flex align-items-center justify-content-center" style={{ gap: 10 }}>
                <i className="fa fa-coins text-success" style={{ fontSize: "2rem" }} />
                <h5 className="fw-bold mb-0">Skill Credits</h5>
              </div>
              <h2 className="fw-bold mt-3 mb-0" style={{ color: "#16a34a" }}>
                {creditData?.skillCredits || 0}
              </h2>
              <p className="text-muted small mt-2 mb-0">
                Locked in bookings: {creditData?.lockedCredits || 0}
              </p>
              <hr />
              <p className="text-muted small mb-0" style={{ fontSize: "0.75rem" }}>
                <i className="fa fa-info-circle me-1" /> Earn credits by teaching sessions. Credits can only be spent on learning — not converted to money.
              </p>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3 d-flex align-items-center" style={{ gap: 8 }}>
                  <i className="fa fa-history text-success" /> Credit History
                </h6>
                {creditTransactions.length === 0 ? (
                  <p className="text-muted small mb-0 text-center py-4">No credit transactions yet. Teach a session to earn credits!</p>
                ) : (
                  <div className="d-flex flex-column" style={{ gap: 6 }}>
                    {creditTransactions.map((tx) => {
                      const info = typeLabels[tx.type] || { icon: "fa-coins", color: "#6b7280", label: tx.type };
                      const isSpend = tx.type === "credit_spent";
                      return (
                        <div
                          key={tx._id}
                          className="d-flex align-items-center justify-content-between px-3 py-2 rounded-3"
                          style={{ background: "#f8fafc", border: "1px solid #e9ecef" }}
                        >
                          <div className="d-flex align-items-center" style={{ gap: 10, minWidth: 0 }}>
                            <span
                              className="d-flex align-items-center justify-content-center"
                              style={{ width: 34, height: 34, borderRadius: 8, background: info.color, color: "white", fontSize: "0.85rem", flexShrink: 0 }}
                            >
                              <i className={`fa ${info.icon}`} />
                            </span>
                            <div>
                              <p className="fw-semibold mb-0" style={{ fontSize: "0.82rem" }}>{info.label}</p>
                              <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                                {tx.description || tx.type}
                                {tx.createdAt ? ` • ${formatDate(tx.createdAt)}` : ""}
                              </small>
                            </div>
                          </div>
                          <div className="text-end" style={{ flexShrink: 0 }}>
                            <span className="fw-bold" style={{ fontSize: "0.85rem", color: isSpend ? "#dc2626" : "#16a34a" }}>
                              {isSpend ? "-" : "+"}{tx.amount}
                            </span>
                            <br />
                            <small className="text-muted" style={{ fontSize: "0.65rem" }}>
                              Balance: {tx.balanceAfter || 0}
                            </small>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="mt-3">
                  <Pagination page={creditPage} totalPages={creditPages} onPageChange={setCreditPage} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LearnerWallet;
