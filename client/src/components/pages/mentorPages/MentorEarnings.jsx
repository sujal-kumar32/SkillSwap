import React, { useCallback, useEffect, useState } from "react";
import Apiservices from "../../../../Apiservices";
import { showToast } from "../../../utils/toastUtils";
import { LoadingState, PageHeader } from "../../learner/LearnerUI";
import Pagination from "../../Pagination";

const typeLabels = {
  earning: { icon: "fa-arrow-left", color: "#16a34a", label: "Earning" },
  withdrawal: { icon: "fa-arrow-up", color: "#9333ea", label: "Withdrawal" },
};

const formatDate = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const MentorEarnings = () => {
  const [earnings, setEarnings] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEarnings = useCallback(async () => {
    try {
      const [earnRes, txRes] = await Promise.all([
        Apiservices.getEarnings(),
        Apiservices.getEarningTransactions({ page, limit: 10 }),
      ]);
      setEarnings(earnRes.data.data);
      setTransactions(txRes.data.data || []);
      setTotalPages(txRes.data.pages || 1);
    } catch {
      setEarnings(null);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) {
      showToast.warning("Enter a valid amount");
      return;
    }
    if (amount > (earnings?.balance || 0)) {
      showToast.warning("Amount exceeds available balance");
      return;
    }
    setWithdrawing(true);
    try {
      await Apiservices.withdrawEarnings(amount);
      showToast.success("Withdrawal request submitted");
      setWithdrawAmount("");
      fetchEarnings();
    } catch (err) {
      showToast.error(err.response?.data?.message || "Withdrawal failed");
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) return <LoadingState label="Loading earnings..." />;

  return (
    <>
      <PageHeader title="My Earnings" subtitle="Track your earnings and withdraw funds." />

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm p-4 rounded-4">
            <h6 className="fw-bold mb-3 d-flex align-items-center" style={{ gap: 8 }}>
              <i className="fa fa-credit-card text-primary" /> Earnings Summary
            </h6>
            <div className="d-flex flex-column" style={{ gap: 12 }}>
              <div className="p-3 rounded-3" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <small className="text-muted">Available Balance</small>
                <h3 className="fw-bold mb-0" style={{ color: "#16a34a" }}>₹{(earnings?.balance || 0).toLocaleString("en-IN")}</h3>
              </div>
              <div className="d-flex justify-content-between px-1">
                <small className="text-muted">Total Earned</small>
                <span className="fw-semibold">₹{(earnings?.totalEarned || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="d-flex justify-content-between px-1">
                <small className="text-muted">Total Withdrawn</small>
                <span className="fw-semibold">₹{(earnings?.totalWithdrawn || 0).toLocaleString("en-IN")}</span>
              </div>
            </div>
            <hr />
            <label className="form-label fw-semibold small">Withdraw Funds</label>
            <div className="d-flex flex-column" style={{ gap: 8 }}>
              <input
                type="number"
                className="form-control rounded-pill"
                placeholder="Amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                min="1"
                max={earnings?.balance || 0}
              />
              <button
                className="btn btn-outline-primary rounded-pill w-100 py-2 d-inline-flex align-items-center justify-content-center"
                style={{ gap: 6 }}
                onClick={handleWithdraw}
                disabled={withdrawing || !earnings?.balance}
              >
                {withdrawing ? (
                  <><span className="spinner-border spinner-border-sm" /> Processing</>
                ) : (
                  <><i className="fa fa-arrow-up" /> Withdraw</>
                )}
              </button>
              <small className="text-muted text-center">
                Withdrawals are processed manually. You'll be contacted within 3-5 business days.
              </small>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3 d-flex align-items-center" style={{ gap: 8 }}>
                <i className="fa fa-history text-primary" /> Transaction History
              </h6>
              {transactions.length === 0 ? (
                <p className="text-muted small mb-0 text-center py-4">No earnings yet. Complete sessions to earn!</p>
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
                          <span className="fw-bold" style={{ fontSize: "0.85rem", color: tx.type === "withdrawal" ? "#dc2626" : "#16a34a" }}>
                            {tx.type === "withdrawal" ? "-" : "+"}₹{tx.amount?.toLocaleString("en-IN") || "0"}
                          </span>
                          <br />
                          <small className="text-muted" style={{ fontSize: "0.65rem" }}>
                            {tx.status === "pending" ? <span className="text-warning">Pending</span> : `Balance: ₹${(tx.balanceAfter || 0).toLocaleString("en-IN")}`}
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
    </>
  );
};

export default MentorEarnings;
