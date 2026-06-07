import React, { useState, useEffect, useCallback, useMemo } from "react";
import Apiservices from "../../../Apiservices";
import { LoadingState } from "../learner/LearnerUI";
import UserLink from "../shared/UserLink";
import Pagination from "../Pagination";

const PAGE_SIZE = 10;

const typeStyles = {
  credit_earned: { bg: "#dcfce7", color: "#166534", icon: "fa-plus-circle", label: "Earned" },
  credit_spent: { bg: "#fee2e2", color: "#991b1b", icon: "fa-minus-circle", label: "Spent" },
  credit_refunded: { bg: "#fef3c7", color: "#92400e", icon: "fa-undo", label: "Refunded" },
};

const BalancesTab = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [loading, setLoading] = useState(true);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await Apiservices.getAdminCreditBalances({ page, limit: PAGE_SIZE, search: search || undefined, sort: sort || undefined });
      setData(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, sort]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="d-flex gap-3 mb-3 flex-wrap">
        <select className="form-select" value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
          style={{ width: 170, fontSize: "0.8rem", borderRadius: 10, borderColor: "#e2e8f0" }}>
          <option value="">Sort by name</option>
          <option value="available">By available</option>
          <option value="locked">By locked</option>
          <option value="total">By total</option>
        </select>
        <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
          <i className="fa fa-search" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "0.75rem" }} />
          <input className="form-control" placeholder="Search by name..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ paddingLeft: 32, fontSize: "0.8rem", borderRadius: 10, borderColor: "#e2e8f0" }} />
        </div>
      </div>

      {loading ? <LoadingState /> : !data.length ? (
        <div className="text-center py-5">
          <div style={{ width: 56, height: 56, borderRadius: 16, margin: "0 auto 12px", background: "#f1f5f9", display: "grid", placeItems: "center" }}>
            <i className="fa fa-coins" style={{ color: "#94a3b8", fontSize: "1.3rem" }} />
          </div>
          <p className="text-muted small mb-0">No wallets found</p>
        </div>
      ) : (
        <>
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #eef2f7", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "2px solid #eef2f7" }}>
                    <th style={{ padding: "12px 18px", textAlign: "left", fontWeight: 600, color: "#475569", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.3px", whiteSpace: "nowrap" }}>User</th>
                    <th style={{ padding: "12px 18px", textAlign: "center", fontWeight: 600, color: "#475569", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.3px", whiteSpace: "nowrap" }}>Available</th>
                    <th style={{ padding: "12px 18px", textAlign: "center", fontWeight: 600, color: "#475569", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.3px", whiteSpace: "nowrap" }}>Locked</th>
                    <th style={{ padding: "12px 18px", textAlign: "center", fontWeight: 600, color: "#475569", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.3px", whiteSpace: "nowrap" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((w, i) => {
                    const available = Math.max(0, (w.skillCredits || 0) - (w.lockedCredits || 0));
                    return (
                      <tr key={w._id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s", background: i % 2 === 0 ? "#fff" : "#fafbfc" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#f0f4ff"}
                        onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fafbfc"}>
                        <td style={{ padding: "14px 18px" }}>
                          <div className="d-flex align-items-center" style={{ gap: 10 }}>
                            <img src={w.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(w.name || "?")}&background=0d6efd&color=fff&size=28`}
                              alt="" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                            <div>
                              <div style={{ fontWeight: 500, color: "#1e293b", fontSize: "0.82rem" }}><UserLink userId={w.userId} name={w.name} /></div>
                              <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>{w.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "14px 18px", textAlign: "center", fontWeight: 600, color: available > 0 ? "#16a34a" : "#94a3b8", fontSize: "0.88rem" }}>{available}</td>
                        <td style={{ padding: "14px 18px", textAlign: "center", fontWeight: 600, color: w.lockedCredits > 0 ? "#d97706" : "#94a3b8" }}>{w.lockedCredits || 0}</td>
                        <td style={{ padding: "14px 18px", textAlign: "center", fontWeight: 700, color: "#1e293b" }}>{w.skillCredits || 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="d-flex justify-content-between align-items-center px-3 py-4">
            <small className="text-muted">Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)}-{Math.min(page * PAGE_SIZE, total)} of {total}</small>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
};

const HistoryTab = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await Apiservices.getAdminCreditHistory({ page, limit: PAGE_SIZE, search: search || undefined, type: typeFilter || undefined });
      setData(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="d-flex gap-3 mb-3 flex-wrap">
        <select className="form-select" value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          style={{ width: 170, fontSize: "0.8rem", borderRadius: 10, borderColor: "#e2e8f0" }}>
          <option value="">All types</option>
          <option value="credit_earned">Earned</option>
          <option value="credit_spent">Spent</option>
          <option value="credit_refunded">Refunded</option>
        </select>
        <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
          <i className="fa fa-search" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "0.75rem" }} />
          <input className="form-control" placeholder="Search reference or description..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ paddingLeft: 32, fontSize: "0.8rem", borderRadius: 10, borderColor: "#e2e8f0" }} />
        </div>
      </div>

      {loading ? <LoadingState /> : !data.length ? (
        <div className="text-center py-5">
          <div style={{ width: 56, height: 56, borderRadius: 16, margin: "0 auto 12px", background: "#f1f5f9", display: "grid", placeItems: "center" }}>
            <i className="fa fa-exchange-alt" style={{ color: "#94a3b8", fontSize: "1.3rem" }} />
          </div>
          <p className="text-muted small mb-0">No transactions found</p>
        </div>
      ) : (
        <>
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #eef2f7", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "2px solid #eef2f7" }}>
                    <th style={{ padding: "12px 18px", textAlign: "left", fontWeight: 600, color: "#475569", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.3px", whiteSpace: "nowrap" }}>User</th>
                    <th style={{ padding: "12px 18px", textAlign: "left", fontWeight: 600, color: "#475569", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.3px", whiteSpace: "nowrap" }}>Type</th>
                    <th style={{ padding: "12px 18px", textAlign: "right", fontWeight: 600, color: "#475569", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.3px", whiteSpace: "nowrap" }}>Amount</th>
                    <th style={{ padding: "12px 18px", textAlign: "left", fontWeight: 600, color: "#475569", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.3px", whiteSpace: "nowrap" }}>Reference</th>
                    <th style={{ padding: "12px 18px", textAlign: "right", fontWeight: 600, color: "#475569", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.3px", whiteSpace: "nowrap" }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((t, i) => {
                    const st = typeStyles[t.type] || { bg: "#f1f5f9", color: "#475569", icon: "fa-circle", label: t.type };
                    return (
                      <tr key={t._id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s", background: i % 2 === 0 ? "#fff" : "#fafbfc" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#f0f4ff"}
                        onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fafbfc"}>
                        <td style={{ padding: "14px 18px" }}>
                          <div className="d-flex align-items-center" style={{ gap: 10 }}>
                            <img src={t.userId?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.userId?.name || "?")}&background=0d6efd&color=fff&size=28`}
                              alt="" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                            <div>
                              <div style={{ fontWeight: 500, color: "#1e293b", fontSize: "0.82rem" }}><UserLink user={t.userId} name={t.userId?.name} /></div>
                              <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>{t.userId?.email || ""}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 999, fontSize: "0.7rem", fontWeight: 600, background: st.bg, color: st.color }}>
                            <i className={`fa ${st.icon}`} style={{ fontSize: "0.6rem" }} />
                            {st.label}
                          </span>
                        </td>
                        <td style={{ padding: "14px 18px", textAlign: "right", fontWeight: 700, color: t.type === "credit_earned" ? "#16a34a" : t.type === "credit_spent" ? "#dc2626" : "#d97706", fontSize: "0.88rem" }}>
                          {t.type === "credit_spent" ? "-" : "+"}{t.amount}
                        </td>
                        <td style={{ padding: "14px 18px", color: "#64748b", fontSize: "0.75rem", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {t.description || t.reference || "—"}
                        </td>
                        <td style={{ padding: "14px 18px", textAlign: "right", color: "#64748b", fontSize: "0.72rem", whiteSpace: "nowrap" }}>
                          {new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="d-flex justify-content-between align-items-center px-3 py-4">
            <small className="text-muted">Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)}-{Math.min(page * PAGE_SIZE, total)} of {total}</small>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
};

const AdminCreditHistory = () => {
  const [tab, setTab] = useState("balances");

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold mb-1" style={{ fontSize: "1.25rem" }}>Credit Management</h4>
          <p className="text-muted small mb-0">View user credit balances and transaction history</p>
        </div>
      </div>

      <div className="d-flex gap-2 mb-4" style={{ borderBottom: "1px solid #eef2f7" }}>
        {["balances", "history"].map((t) => (
          <button key={t} onClick={() => setTab(t)} className="btn btn-sm fw-semibold" style={{
            background: "none", border: "none", borderBottom: tab === t ? "2px solid #0d6efd" : "2px solid transparent",
            color: tab === t ? "#0d6efd" : "#64748b", padding: "8px 16px", marginBottom: -1, borderRadius: 0, fontSize: "0.85rem",
          }}>
            {t === "balances" ? "Balances" : "Transaction History"}
          </button>
        ))}
      </div>

      {tab === "balances" ? <BalancesTab /> : <HistoryTab />}
    </div>
  );
};

export default AdminCreditHistory;
