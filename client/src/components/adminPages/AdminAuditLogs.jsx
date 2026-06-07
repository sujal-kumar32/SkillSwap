import React, { useState, useEffect, useCallback, useMemo } from "react";
import Apiservices from "../../../Apiservices";
import { LoadingState } from "../learner/LearnerUI";

const ACTION_STYLES = {
  resolve_dispute:  { bg: "#e0e7ff", color: "#3730a3", icon: "fa-gavel" },
  broadcast:        { bg: "#fef3c7", color: "#92400e", icon: "fa-bullhorn" },
  block_user:       { bg: "#fee2e2", color: "#991b1b", icon: "fa-ban" },
  unblock_user:     { bg: "#dcfce7", color: "#166534", icon: "fa-check-circle" },
  update_user_status:{bg: "#f1f5f9", color: "#475569", icon: "fa-user-edit" },
  approve_mentor:   { bg: "#dbeafe", color: "#1d4ed8", icon: "fa-user-check" },
  approve_skill:    { bg: "#dcfce7", color: "#166534", icon: "fa-check" },
  reject_skill:     { bg: "#fee2e2", color: "#991b1b", icon: "fa-times" },
  create_category:  { bg: "#f0fdf4", color: "#15803d", icon: "fa-plus" },
  update_category:  { bg: "#fef9c3", color: "#854d0e", icon: "fa-pen" },
  delete_category:  { bg: "#fee2e2", color: "#991b1b", icon: "fa-trash" },
  force_complete:   { bg: "#e0e7ff", color: "#3730a3", icon: "fa-fast-forward" },
  force_cancel:     { bg: "#fce7f3", color: "#9d174d", icon: "fa-stop" },
  update_settings:  { bg: "#f3e8ff", color: "#6d28d9", icon: "fa-cog" },
};

const actionOptions = Object.keys(ACTION_STYLES);

const PAGE_SIZE = 30;

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTS(date) {
  return new Date(date).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [actionFilter, setActionFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: PAGE_SIZE };
      if (actionFilter) params.action = actionFilter;
      if (search.trim()) params.search = search.trim();
      const res = await Apiservices.getAuditLogs(params);
      setLogs(res.data.data || []);
      setPagination(res.data.pagination);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => { setPage(1); }, [actionFilter, search]);

  const summary = useMemo(() => {
    const uniqueAdmins = new Set();
    const uniqueActions = new Set();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let todayCount = 0;
    for (const log of logs) {
      if (log.adminId?._id) uniqueAdmins.add(log.adminId._id);
      uniqueActions.add(log.action);
      if (new Date(log.createdAt) >= today) todayCount++;
    }
    return {
      total: pagination?.total || 0,
      admins: uniqueAdmins.size,
      actionTypes: uniqueActions.size,
      today: todayCount,
    };
  }, [logs, pagination]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold mb-1" style={{ fontSize: "1.25rem" }}>Audit Logs</h4>
          <p className="text-muted small mb-0">Every admin action is permanently recorded</p>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="p-3 rounded-4" style={{ background: "#fff", border: "1px solid #eef2f7" }}>
            <div className="d-flex align-items-center" style={{ gap: 18 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "#eef2ff", display: "grid", placeItems: "center" }}>
                <i className="fa fa-history" style={{ color: "#6366f1", fontSize: "1rem" }} />
              </div>
              <div>
                <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "#1e293b", lineHeight: 1.2 }}>{summary.total}</div>
                <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.3px" }}>Total Logs</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 rounded-4" style={{ background: "#fff", border: "1px solid #eef2f7" }}>
            <div className="d-flex align-items-center" style={{ gap: 18 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "#fef3c7", display: "grid", placeItems: "center" }}>
                <i className="fa fa-tag" style={{ color: "#d97706", fontSize: "1rem" }} />
              </div>
              <div>
                <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "#1e293b", lineHeight: 1.2 }}>{summary.actionTypes}</div>
                <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.3px" }}>Actions</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 rounded-4" style={{ background: "#fff", border: "1px solid #eef2f7" }}>
            <div className="d-flex align-items-center" style={{ gap: 18 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "#dcfce7", display: "grid", placeItems: "center" }}>
                <i className="fa fa-users" style={{ color: "#16a34a", fontSize: "1rem" }} />
              </div>
              <div>
                <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "#1e293b", lineHeight: 1.2 }}>{summary.admins}</div>
                <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.3px" }}>Admins</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 rounded-4" style={{ background: "#fff", border: "1px solid #eef2f7" }}>
            <div className="d-flex align-items-center" style={{ gap: 18 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "#fce7f3", display: "grid", placeItems: "center" }}>
                <i className="fa fa-clock" style={{ color: "#db2777", fontSize: "1rem" }} />
              </div>
              <div>
                <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "#1e293b", lineHeight: 1.2 }}>{summary.today}</div>
                <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.3px" }}>Today</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 mb-4 rounded-4" style={{ background: "#fff", border: "1px solid #eef2f7" }}>
        <div className="row g-2 align-items-center">
          <div className="col-md-4">
            <div style={{ position: "relative" }}>
              <i className="fa fa-search" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "0.75rem" }} />
              <input className="form-control" placeholder="Search by details..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 32, fontSize: "0.82rem", borderRadius: 10, borderColor: "#e2e8f0" }} />
            </div>
          </div>
          <div className="col-md-3">
            <select className="form-select" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}
              style={{ fontSize: "0.82rem", borderRadius: 10, borderColor: "#e2e8f0" }}>
              <option value="">All Actions</option>
              {actionOptions.map((act) => (
                <option key={act} value={act}>{act.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
          <div className="col-md-5 text-md-end">
            <small className="text-muted">
              {pagination ? `Showing ${logs.length} of ${pagination.total} entries` : ""}
            </small>
          </div>
        </div>
      </div>

      {loading ? <LoadingState /> : !logs.length ? (
        <div className="text-center py-5 rounded-4" style={{ background: "#fff", border: "1px solid #eef2f7" }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, margin: "0 auto 12px", background: "#f1f5f9", display: "grid", placeItems: "center" }}>
            <i className="fa fa-history" style={{ color: "#94a3b8", fontSize: "1.5rem" }} />
          </div>
          <p className="text-muted small mb-1" style={{ fontSize: "0.9rem" }}>No audit logs found</p>
          <p className="text-muted mb-0" style={{ fontSize: "0.78rem" }}>Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #eef2f7", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "2px solid #eef2f7" }}>
                    <th style={{ padding: "12px 18px", textAlign: "left", fontWeight: 600, color: "#475569", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.3px", whiteSpace: "nowrap", width: 140 }}>Timestamp</th>
                    <th style={{ padding: "12px 18px", textAlign: "left", fontWeight: 600, color: "#475569", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.3px", whiteSpace: "nowrap" }}>Admin</th>
                    <th style={{ padding: "12px 18px", textAlign: "left", fontWeight: 600, color: "#475569", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.3px", whiteSpace: "nowrap", width: 130 }}>Action</th>
                    <th style={{ padding: "12px 18px", textAlign: "left", fontWeight: 600, color: "#475569", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.3px", whiteSpace: "nowrap" }}>Details</th>
                    <th style={{ padding: "12px 18px", textAlign: "right", fontWeight: 600, color: "#475569", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.3px", whiteSpace: "nowrap", width: 100 }}>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => {
                    const st = ACTION_STYLES[log.action] || { bg: "#f1f5f9", color: "#475569", icon: "fa-circle" };
                    return (
                      <tr key={log._id} onClick={() => setSelectedLog(log)}
                        style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "background 0.15s", background: i % 2 === 0 ? "#fff" : "#fafbfc" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#f0f4ff"}
                        onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fafbfc"}>
                        <td style={{ padding: "14px 18px", whiteSpace: "nowrap" }}>
                          <div style={{ color: "#1e293b", fontSize: "0.82rem", fontWeight: 500 }}>{timeAgo(log.createdAt)}</div>
                          <div style={{ color: "#94a3b8", fontSize: "0.65rem", marginTop: 1 }}>{formatTS(log.createdAt)}</div>
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <div className="d-flex align-items-center" style={{ gap: 10 }}>
                            <img src={log.adminId?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(log.adminId?.name || "?")}&size=28`}
                              alt="" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                            <span style={{ fontWeight: 500, color: "#1e293b", fontSize: "0.82rem" }}>{log.adminId?.name || "Unknown"}</span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "3px 10px", borderRadius: 999, fontSize: "0.7rem", fontWeight: 600, background: st.bg, color: st.color, whiteSpace: "nowrap" }}>
                            <i className={`fa ${st.icon}`} style={{ fontSize: "0.65rem" }} />
                            {log.action.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td style={{ padding: "14px 18px", color: "#475569", fontSize: "0.78rem", maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {log.details}
                        </td>
                        <td style={{ padding: "14px 18px", textAlign: "right", color: "#94a3b8", fontSize: "0.68rem", fontFamily: "monospace" }}>
                          {log.ip || "—"}
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

      {selectedLog && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1050, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "8vh" }}>
          <div onClick={() => setSelectedLog(null)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
          <div style={{ position: "relative", width: 560, maxWidth: "90vw", background: "#fff", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #eef2f7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h5 className="fw-bold mb-0" style={{ fontSize: "1rem" }}>Audit Log Detail</h5>
              <button onClick={() => setSelectedLog(null)} style={{ background: "none", border: "none", fontSize: "1.2rem", color: "#94a3b8", cursor: "pointer", padding: 0, lineHeight: 1 }}>
                <i className="fa fa-times" />
              </button>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <div className="d-flex align-items-center" style={{ gap: 18 }}>
                <img src={selectedLog.adminId?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedLog.adminId?.name || "?")}&size=44`}
                  alt="" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{selectedLog.adminId?.name || "Unknown Admin"}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{selectedLog.adminId?.email || ""}</div>
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 2 }}>Action</div>
                    <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#1e293b" }}>
                      {(() => {
                        const st = ACTION_STYLES[selectedLog.action] || { bg: "#f1f5f9", color: "#475569", icon: "fa-circle" };
                        return (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "3px 10px", borderRadius: 999, fontSize: "0.7rem", fontWeight: 600, background: st.bg, color: st.color }}>
                            <i className={`fa ${st.icon}`} style={{ fontSize: "0.6rem" }} />
                            {selectedLog.action.replace(/_/g, " ")}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 2 }}>Timestamp</div>
                    <div style={{ fontWeight: 500, fontSize: "0.85rem", color: "#1e293b" }}>{formatTS(selectedLog.createdAt)}</div>
                    <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{timeAgo(selectedLog.createdAt)}</div>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 4 }}>Details</div>
                  <div style={{ fontSize: "0.85rem", color: "#1e293b", lineHeight: 1.5 }}>{selectedLog.details}</div>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-6">
                  <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 2 }}>Target</div>
                    <div style={{ fontWeight: 500, fontSize: "0.85rem", color: "#1e293b" }}>{selectedLog.targetModel || "—"}</div>
                    {selectedLog.targetId && (
                      <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontFamily: "monospace", cursor: "pointer", marginTop: 2 }}
                        onClick={() => navigator.clipboard.writeText(selectedLog.targetId)}
                        title={`Click to copy full ID: ${selectedLog.targetId}`}>
                        #{String(selectedLog.targetId).slice(-6).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-6">
                  <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 2 }}>IP Address</div>
                    <div style={{ fontWeight: 500, fontSize: "0.85rem", color: "#1e293b", fontFamily: "monospace" }}>{selectedLog.ip || "—"}</div>
                  </div>
                </div>
              </div>

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div className="mt-3">
                  <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 4 }}>Metadata</div>
                    <pre style={{ fontSize: "0.75rem", color: "#475569", margin: 0, whiteSpace: "pre-wrap", fontFamily: "monospace", lineHeight: 1.6 }}>
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogs;
