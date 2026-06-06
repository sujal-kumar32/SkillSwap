import React, { useEffect, useState, useCallback } from "react";
import { showToast } from "../../utils/toastUtils";
import Apiservices from "../../../Apiservices";
import { LoadingState } from "../learner/LearnerUI";

const STATUS_STYLE = {
  success: { bg: "#dcfce7", color: "#166534", icon: "fa-check-circle", label: "Success" },
  pending: { bg: "#fef9c3", color: "#854d0e", icon: "fa-clock", label: "Pending" },
  failed: { bg: "#fee2e2", color: "#991b1b", icon: "fa-times-circle", label: "Failed" },
  refunded: { bg: "#e0e7ff", color: "#3730a3", icon: "fa-undo", label: "Refunded" },
  refund_initiated: { bg: "#f3e8ff", color: "#6b21a8", icon: "fa-spinner", label: "Refunding" },
};

const PaymentRow = ({ p, index }) => {
  const st = STATUS_STYLE[p.paymentStatus] || STATUS_STYLE.pending;
  return (
    <tr style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s", background: index % 2 === 0 ? "#fff" : "#fafbfc" }}
      onMouseEnter={(e) => e.currentTarget.style.background = "#f0f4ff"}
      onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? "#fff" : "#fafbfc"}>
      <td style={{ padding: "14px 18px" }}>
        <div style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#1e293b", fontWeight: 500 }}>{p.transactionId || p.orderId || "—"}</div>
        {p.requestId?.requestStatus && (
          <div style={{ fontSize: "0.62rem", color: "#94a3b8", marginTop: 2 }}>Booking: {p.requestId.requestStatus}</div>
        )}
      </td>
      <td style={{ padding: "14px 18px" }}>
        <div className="d-flex align-items-center" style={{ gap: 10 }}>
          <img src={p.learnerId?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.learnerId?.name || "?")}&background=0d6efd&color=fff&size=28`}
            alt="" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
          <span style={{ fontWeight: 500, color: "#1e293b" }}>{p.learnerId?.name || "Unknown"}</span>
        </div>
      </td>
      <td style={{ padding: "14px 18px" }}>
        <div className="d-flex align-items-center" style={{ gap: 10 }}>
          <img src={p.mentorId?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.mentorId?.name || "?")}&background=6610f2&color=fff&size=28`}
            alt="" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
          <span style={{ fontWeight: 500, color: "#1e293b" }}>{p.mentorId?.name || "Unknown"}</span>
        </div>
      </td>
      <td style={{ padding: "14px 18px", color: "#475569", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.sessionId?.title || "—"}</td>
      <td style={{ padding: "14px 18px", textAlign: "right", fontWeight: 700, color: "#1e293b", fontSize: "0.88rem" }}>₹{p.amount?.toFixed(2)}</td>
      <td style={{ padding: "14px 18px", textAlign: "center" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "4px 12px", borderRadius: 999,
          fontSize: "0.7rem", fontWeight: 600,
          background: st.bg, color: st.color,
        }}>
          <i className={`fa ${st.icon}`} style={{ fontSize: "0.6rem" }} />
          {st.label}
        </span>
      </td>
      <td style={{ padding: "14px 18px", textAlign: "right", color: "#64748b", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
        {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </td>
    </tr>
  );
};

const PaginationBar = ({ page, pagination, onPageChange }) => {
  if (!pagination || pagination.pages <= 1) return null;
  return (
    <div className="d-flex align-items-center" style={{ gap: 4 }}>
      <button className="btn btn-sm" onClick={() => onPageChange(1)} disabled={page <= 1}
        style={{ borderRadius: 8, border: "1px solid #e2e8f0", color: page <= 1 ? "#cbd5e1" : "#475569", background: "#fff", padding: "6px 10px", fontSize: "0.72rem" }}>
        <i className="fa fa-angle-double-left" />
      </button>
      <button className="btn btn-sm" onClick={() => onPageChange((p) => p - 1)} disabled={page <= 1}
        style={{ borderRadius: 8, border: "1px solid #e2e8f0", color: page <= 1 ? "#cbd5e1" : "#475569", background: "#fff", padding: "6px 10px", fontSize: "0.72rem" }}>
        <i className="fa fa-angle-left" />
      </button>
      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
        const start = Math.max(1, Math.min(page - 2, pagination.pages - 4));
        const num = start + i;
        if (num > pagination.pages) return null;
        return (
          <button key={num} className="btn btn-sm" onClick={() => onPageChange(num)}
            style={{
              borderRadius: 8, border: "1px solid #e2e8f0", padding: "6px 12px", fontSize: "0.72rem", fontWeight: 600,
              background: num === page ? "#0d6efd" : "#fff",
              color: num === page ? "#fff" : "#475569",
            }}>
            {num}
          </button>
        );
      })}
      <button className="btn btn-sm" onClick={() => onPageChange((p) => p + 1)} disabled={page >= pagination.pages}
        style={{ borderRadius: 8, border: "1px solid #e2e8f0", color: page >= pagination.pages ? "#cbd5e1" : "#475569", background: "#fff", padding: "6px 10px", fontSize: "0.72rem" }}>
        <i className="fa fa-angle-right" />
      </button>
      <button className="btn btn-sm" onClick={() => onPageChange(pagination.pages)} disabled={page >= pagination.pages}
        style={{ borderRadius: 8, border: "1px solid #e2e8f0", color: page >= pagination.pages ? "#cbd5e1" : "#475569", background: "#fff", padding: "6px 10px", fontSize: "0.72rem" }}>
        <i className="fa fa-angle-double-right" />
      </button>
    </div>
  );
};

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();
      const res = await Apiservices.getAdminPayments(params);
      setPayments(res.data.data || []);
      setPagination(res.data.pagination);
    } catch {
      showToast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold mb-1" style={{ fontSize: "1.25rem" }}>Payment Ledger</h4>
          <p className="text-muted small mb-0">View and manage all platform transactions</p>
        </div>
      </div>

      <div className="d-flex gap-3 mb-3 flex-wrap">
        <select className="form-select" value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ width: 170, fontSize: "0.8rem", borderRadius: 10, borderColor: "#e2e8f0" }}>
          <option value="">All Status</option>
          <option value="success">Success</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
          <option value="refund_initiated">Refund Initiated</option>
        </select>
        <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
          <i className="fa fa-search" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "0.75rem" }} />
          <input className="form-control" placeholder="Search transaction or order ID..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ paddingLeft: 32, fontSize: "0.8rem", borderRadius: 10, borderColor: "#e2e8f0" }} />
        </div>
      </div>

      {loading ? <LoadingState /> : payments.length === 0 ? (
        <div className="text-center py-5">
          <div style={{ width: 56, height: 56, borderRadius: 16, margin: "0 auto 12px", background: "#f1f5f9", display: "grid", placeItems: "center" }}>
            <i className="fa fa-credit-card" style={{ color: "#94a3b8", fontSize: "1.3rem" }} />
          </div>
          <p className="text-muted small mb-0">No payments found</p>
        </div>
      ) : (
        <>
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #eef2f7", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "2px solid #eef2f7" }}>
                    <th style={{ padding: "12px 18px", textAlign: "left", fontWeight: 600, color: "#475569", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.3px", whiteSpace: "nowrap" }}>Transaction</th>
                    <th style={{ padding: "12px 18px", textAlign: "left", fontWeight: 600, color: "#475569", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.3px", whiteSpace: "nowrap" }}>Learner</th>
                    <th style={{ padding: "12px 18px", textAlign: "left", fontWeight: 600, color: "#475569", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.3px", whiteSpace: "nowrap" }}>Mentor</th>
                    <th style={{ padding: "12px 18px", textAlign: "left", fontWeight: 600, color: "#475569", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.3px", whiteSpace: "nowrap" }}>Session</th>
                    <th style={{ padding: "12px 18px", textAlign: "right", fontWeight: 600, color: "#475569", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.3px", whiteSpace: "nowrap" }}>Amount</th>
                    <th style={{ padding: "12px 18px", textAlign: "center", fontWeight: 600, color: "#475569", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.3px", whiteSpace: "nowrap" }}>Status</th>
                    <th style={{ padding: "12px 18px", textAlign: "right", fontWeight: 600, color: "#475569", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.3px", whiteSpace: "nowrap" }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, i) => (
                    <PaymentRow key={p._id} p={p} index={i} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
              {pagination ? `Showing page ${pagination.page} of ${pagination.pages} (${pagination.total} total)` : ""}
            </div>
            <PaginationBar page={page} pagination={pagination} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPayments;
