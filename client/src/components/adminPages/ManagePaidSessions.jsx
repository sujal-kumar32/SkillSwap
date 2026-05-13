import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { deleteConfirmAlert } from "../../utils/alertUtils";
import { showToast } from "../../utils/toastUtils";
import LoadingButton from "../../utils/LoadingButton";
import Apiservices from "../../../Apiservices";

const ManagePaidSessions = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paidFilter, setPaidFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await Apiservices.fetchSessions({ page, limit: 10 });
      if (response.data.success) {
        setSessions(response.data.data);
        setTotalPages(response.data.pages || 1);
      } else {
        setError(response.data.message || "Failed to load sessions");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load sessions");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [page]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const q = search.toLowerCase();
      const matchSearch = s.title?.toLowerCase().includes(q) || s.mentorId?.name?.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || s.status?.toLowerCase() === statusFilter.toLowerCase();
      const matchPaid = paidFilter === "All" || (paidFilter === "Paid" ? s.isPaid : !s.isPaid);
      return matchSearch && matchStatus && matchPaid;
    });
  }, [sessions, search, statusFilter, paidFilter]);

  const totalRevenue = useMemo(
    () => sessions.reduce((acc, s) => acc + (s.price ?? 0) * (s.bookings ?? 0), 0),
    [sessions],
  );

  const StatCard = ({ label, value, icon, color }) => (
    <div className="col-md-4 mb-3">
      <div className="admin-card p-4 h-100">
        <div className="d-flex align-items-center gap-3">
          <div className="admin-stat-icon" style={{ background: `${color}15`, color }}>
            <i className={`fa ${icon}`} />
          </div>
          <div>
            <p className="text-muted mb-0 small fw-semibold text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.3px" }}>{label}</p>
            <h3 className="fw-bold mb-0">{value}</h3>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="admin-page-header mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h1 className="fw-bold mb-1">Manage Sessions</h1>
            <p className="text-muted mb-0">Monitor, edit and control all sessions — paid and free.</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary rounded-pill px-3 fw-semibold" style={{ fontSize: "0.85rem" }}>Export</button>
            <button className="btn btn-outline-primary rounded-pill px-3 fw-semibold" style={{ fontSize: "0.85rem" }} onClick={fetchSessions}>
              <i className="fa fa-refresh me-1" /> Refresh
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" role="status" /></div>
      ) : (
        <>
          {error && <div className="alert alert-danger rounded-4">{error}</div>}

          <div className="row g-4 mb-4">
            <StatCard label="Total Sessions" value={sessions.length} icon="fa-video" color="#0d6efd" />
            <StatCard label="Active" value={sessions.filter((s) => s.status === "active").length} icon="fa-play" color="#198754" />
            <StatCard label="Paid" value={sessions.filter((s) => s.isPaid).length} icon="fa-indian-rupee-sign" color="#d97706" />
            <StatCard label="Free" value={sessions.filter((s) => !s.isPaid).length} icon="fa-gift" color="#6c2bd9" />
          </div>

          <div className="admin-card">
            <div className="p-4">
              <div className="d-flex flex-column gap-4 mb-4">
                <div>
                  <label className="small text-muted fw-semibold mb-2 d-block">Search</label>
                  <input type="search" className="form-control rounded-pill" placeholder="Search by session or mentor"
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    style={{ background: "#f8faff", border: "1px solid #eef2f7", padding: "10px 16px", maxWidth: 420 }} />
                </div>
                <div>
                  <span className="small text-muted fw-semibold d-block mb-2">Type</span>
                  <div className="d-flex flex-wrap gap-3">
                    {["All", "Paid", "Free"].map((p) => (
                      <button key={p} className={`btn btn-sm rounded-pill fw-semibold px-3 ${paidFilter === p ? "btn-primary" : "btn-outline-secondary"}`}
                        style={{ fontSize: "0.85rem" }} onClick={() => setPaidFilter(p)}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="small text-muted fw-semibold d-block mb-2">Status</span>
                  <div className="d-flex flex-wrap gap-3">
                    {["All", "active", "completed", "cancelled"].map((s) => (
                      <button key={s} className={`btn btn-sm rounded-pill fw-semibold px-3 ${statusFilter === s ? "btn-primary" : "btn-outline-secondary"}`}
                        style={{ fontSize: "0.85rem" }} onClick={() => setStatusFilter(s)}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead>
                    <tr>
                      <th className="fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", letterSpacing: "0.3px", borderBottom: "2px solid #eef2f7" }}>Session</th>
                      <th className="fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", letterSpacing: "0.3px", borderBottom: "2px solid #eef2f7" }}>Mentor</th>
                      <th className="fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", letterSpacing: "0.3px", borderBottom: "2px solid #eef2f7" }}>Price</th>
                      <th className="fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", letterSpacing: "0.3px", borderBottom: "2px solid #eef2f7" }}>Bookings</th>
                      <th className="fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", letterSpacing: "0.3px", borderBottom: "2px solid #eef2f7" }}>Status</th>
                      <th className="text-end fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", letterSpacing: "0.3px", borderBottom: "2px solid #eef2f7" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSessions.length ? (
                      filteredSessions.map((s) => (
                        <tr key={s._id}>
                          <td className="fw-semibold" style={{ color: "#1e293b" }}>{s.title}</td>
                          <td style={{ color: "#64748b" }}>{s.mentorId?.name || "Unknown"}</td>
                          <td className="fw-semibold">₹{s.price ?? 0}</td>
                          <td>{s.bookings ?? 0}</td>
                          <td>
                            <span className={`badge rounded-pill fw-medium ${s.status === "active" ? "bg-success" : s.status === "completed" ? "bg-primary" : "bg-danger"}`}
                              style={{ fontSize: "0.75rem" }}>{s.status}</span>
                          </td>
                          <td className="text-end">
                            <LoadingButton className="btn btn-sm btn-outline-primary rounded-pill me-1 fw-semibold"
                              style={{ fontSize: "0.8rem" }}
                              onClick={() => navigate(`/admin/session/${s._id}`)}>View</LoadingButton>
                            <LoadingButton className="btn btn-sm btn-outline-warning rounded-pill me-1 fw-semibold"
                              style={{ fontSize: "0.8rem" }}
                              onClick={() => navigate(`/admin/session/${s._id}/edit`)}>Edit</LoadingButton>
                            <LoadingButton loading={actionLoading === s._id} className="btn btn-sm btn-outline-danger rounded-pill fw-semibold"
                              style={{ fontSize: "0.8rem" }}
                              onClick={async () => {
                                const confirmed = await deleteConfirmAlert("this session");
                                if (!confirmed) return;
                                setActionLoading(s._id);
                                try {
                                  const response = await Apiservices.deleteSession(s._id);
                                  if (response.data.success) {
                                    setSessions((prev) => prev.filter((item) => item._id !== s._id));
                                    showToast.success("Session deleted");
                                  } else {
                                    showToast.error(response.data.message || "Failed to delete session");
                                  }
                                } catch (err) {
                                  console.log(err);
                                  showToast.error("Failed to delete session");
                                } finally {
                                  setActionLoading(null);
                                }
                              }}>Delete</LoadingButton>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="6" className="text-center py-4 text-muted">No sessions found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <div className="btn-group">
            <button className="btn btn-outline-primary btn-sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => (
              <button key={i + 1} className={`btn btn-sm ${page === i + 1 ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
            ))}
            {totalPages > 10 && <button className="btn btn-sm btn-outline-primary" disabled>...</button>}
            <button className="btn btn-outline-primary btn-sm" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePaidSessions;
