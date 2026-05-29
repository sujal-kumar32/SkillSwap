import React, { useEffect, useState, useCallback } from "react";
import { showToast } from "../../utils/toastUtils";
import Apiservices from "../../../Apiservices";
import { LoadingState } from "../learner/LearnerUI";

const STATUS_STYLE = {
  open: { bg: "#fef9c3", color: "#854d0e", label: "Open" },
  under_review: { bg: "#e0e7ff", color: "#3730a3", label: "Under Review" },
  resolved: { bg: "#dcfce7", color: "#166534", label: "Resolved" },
  dismissed: { bg: "#fee2e2", color: "#991b1b", label: "Dismissed" },
};

const RESOLVE_OPTIONS = [
  { value: "refund_approved", label: "Approve Full Refund", color: "#16a34a" },
  { value: "refund_partial", label: "Approve Partial Refund", color: "#ca8a04" },
  { value: "dismissed", label: "Dismiss Dispute", color: "#ef4444" },
];

const AdminDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [resolveData, setResolveData] = useState({ status: "", resolution: "", adminNotes: "" });
  const [resolving, setResolving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      const res = await Apiservices.getAllDisputes(params);
      setDisputes(res.data.data || []);
      setPagination(res.data.pagination);
    } catch {
      showToast.error("Failed to load disputes");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openResolve = (dispute) => {
    setSelected(dispute);
    setResolveData({ status: "", resolution: "", adminNotes: "" });
  };

  const handleResolve = async () => {
    if (!resolveData.status) return;
    setResolving(true);
    try {
      const body = { status: resolveData.status };
      if (resolveData.status === "resolved") body.resolution = resolveData.resolution;
      if (resolveData.adminNotes.trim()) body.adminNotes = resolveData.adminNotes.trim();

      await Apiservices.resolveDispute(selected._id, body);
      showToast.success("Dispute resolved");
      setSelected(null);
      fetchData();
    } catch (err) {
      showToast.error(err.response?.data?.message || "Failed to resolve");
    } finally {
      setResolving(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold mb-1" style={{ fontSize: "1.25rem" }}>Dispute Resolution</h4>
          <p className="text-muted small mb-0">Manage and resolve booking disputes</p>
        </div>
      </div>

      <div className="d-flex gap-2 mb-3">
        <select className="form-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ width: 170, fontSize: "0.8rem", borderRadius: 10, borderColor: "#e2e8f0" }}>
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="under_review">Under Review</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>

      {loading ? <LoadingState /> : disputes.length === 0 ? (
        <div className="text-center py-5">
          <div style={{ width: 56, height: 56, borderRadius: 16, margin: "0 auto 12px", background: "#f1f5f9", display: "grid", placeItems: "center" }}>
            <i className="fa fa-gavel" style={{ color: "#94a3b8", fontSize: "1.3rem" }} />
          </div>
          <p className="text-muted small mb-0">No disputes found</p>
        </div>
      ) : (
        <>
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #eef2f7", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "2px solid #eef2f7" }}>
                    <th style={{ padding: "12px 18px", textAlign: "left", fontWeight: 600, color: "#475569", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.3px" }}>Raised By</th>
                    <th style={{ padding: "12px 18px", textAlign: "left", fontWeight: 600, color: "#475569", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.3px" }}>Session</th>
                    <th style={{ padding: "12px 18px", textAlign: "left", fontWeight: 600, color: "#475569", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.3px" }}>Reason</th>
                    <th style={{ padding: "12px 18px", textAlign: "left", fontWeight: 600, color: "#475569", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.3px" }}>Status</th>
                    <th style={{ padding: "12px 18px", textAlign: "right", fontWeight: 600, color: "#475569", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.3px" }}>Date</th>
                    <th style={{ padding: "12px 18px", textAlign: "center", fontWeight: 600, color: "#475569", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.3px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {disputes.map((d, i) => {
                    const st = STATUS_STYLE[d.status] || STATUS_STYLE.open;
                    return (
                      <tr key={d._id} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafbfc" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#f0f4ff"}
                        onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fafbfc"}>
                        <td style={{ padding: "14px 18px" }}>
                          <div className="d-flex align-items-center" style={{ gap: 12 }}>
                            <img src={d.raisedBy?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.raisedBy?.name || "?")}&size=28`}
                              alt="" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                            <div>
                              <div style={{ fontWeight: 500, color: "#1e293b", fontSize: "0.82rem" }}>{d.raisedBy?.name}</div>
                              <div style={{ fontSize: "0.62rem", color: "#94a3b8" }}>vs {d.raisedAgainst?.name}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "14px 18px", color: "#475569", fontSize: "0.8rem" }}>{d.requestId?.sessionId?.title || "—"}</td>
                        <td style={{ padding: "14px 18px", fontSize: "0.78rem", color: "#475569" }}>{d.reason?.replace(/_/g, " ")}</td>
                        <td style={{ padding: "14px 18px" }}>
                          <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 999, fontSize: "0.7rem", fontWeight: 600, background: st.bg, color: st.color }}>{st.label}</span>
                        </td>
                        <td style={{ padding: "14px 18px", textAlign: "right", color: "#64748b", fontSize: "0.72rem", whiteSpace: "nowrap" }}>
                          {new Date(d.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </td>
                        <td style={{ padding: "14px 18px", textAlign: "center" }}>
                          {d.status === "open" || d.status === "under_review" ? (
                            <button onClick={() => openResolve(d)} className="btn btn-sm fw-semibold"
                              style={{ borderRadius: 8, fontSize: "0.7rem", background: "#0d6efd", color: "#fff", border: "none", padding: "4px 14px" }}>
                              Resolve
                            </button>
                          ) : (
                            <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                              {d.resolution?.replace(/_/g, " ") || d.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">Page {pagination.page} of {pagination.pages}</small>
              <div className="d-flex gap-1">
                <button className="btn btn-sm btn-outline-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><i className="fa fa-chevron-left" /></button>
                <button className="btn btn-sm btn-outline-secondary" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}><i className="fa fa-chevron-right" /></button>
              </div>
            </div>
          )}
        </>
      )}

      {selected && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1050, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "8vh" }}>
          <div onClick={() => setSelected(null)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
          <div style={{ position: "relative", width: 520, maxWidth: "90vw", background: "#fff", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #eef2f7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h5 className="fw-bold mb-0" style={{ fontSize: "1rem" }}>Resolve Dispute</h5>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: "1.2rem", color: "#94a3b8", cursor: "pointer", padding: 0 }}><i className="fa fa-times" /></button>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: 14, marginBottom: 16 }}>
<div className="d-flex align-items-center" style={{ gap: 12, marginBottom: 8 }}>
                            <img src={selected.raisedBy?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(selected.raisedBy?.name || "?")}&size=32`}
                              alt="" style={{ width: 32, height: 32, borderRadius: "50%" }} />
                            <div>
                              <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{selected.raisedBy?.name}</div>
                              <div style={{ fontSize: "0.7rem", color: "#64748b" }}>raised a dispute on {new Date(selected.createdAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 4 }}>Reason: {selected.reason?.replace(/_/g, " ")}</div>
                <div style={{ fontSize: "0.85rem", color: "#1e293b", background: "#fff", borderRadius: 8, padding: 10, border: "1px solid #eef2f7" }}>{selected.description}</div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold small">Resolution Decision</label>
                <div className="d-flex flex-column" style={{ gap: 8 }}>
                  {RESOLVE_OPTIONS.map((opt) => (
                    <button key={opt.value} type="button" onClick={() => setResolveData((prev) => ({ ...prev, status: opt.value === "dismissed" ? "dismissed" : "resolved", resolution: opt.value }))}
                      style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10,
                        border: `2px solid ${resolveData.resolution === opt.value ? opt.color : "#e2e8f0"}`,
                        background: resolveData.resolution === opt.value ? `${opt.color}10` : "#fff",
                        fontWeight: 500, fontSize: "0.82rem", cursor: "pointer", textAlign: "left", color: "#1e293b",
                      }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: opt.color, flexShrink: 0 }} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold small">Admin Notes (optional)</label>
                <textarea className="form-control" rows={3} placeholder="Notes about the resolution..." value={resolveData.adminNotes}
                  onChange={(e) => setResolveData((prev) => ({ ...prev, adminNotes: e.target.value }))} maxLength={1000}
                  style={{ fontSize: "0.85rem", borderRadius: 10, borderColor: "#e2e8f0", resize: "vertical" }} />
              </div>

              <div className="d-flex gap-4 justify-content-end pt-2">
                <button onClick={() => setSelected(null)} className="btn btn-light fw-semibold" style={{ borderRadius: 10, fontSize: "0.85rem" }}>Cancel</button>
                <button onClick={handleResolve} disabled={resolving || !resolveData.status}
                  className="btn fw-semibold" style={{ borderRadius: 10, fontSize: "0.85rem", background: "#0d6efd", color: "#fff", border: "none", opacity: resolving || !resolveData.status ? 0.6 : 1 }}>
                  {resolving ? <span className="spinner-border spinner-border-sm" /> : "Apply Resolution"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDisputes;
