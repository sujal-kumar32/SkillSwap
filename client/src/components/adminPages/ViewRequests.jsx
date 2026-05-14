import React, { useEffect, useMemo, useState } from "react";
import { showToast } from "../../utils/toastUtils";
import Apiservices from "../../../Apiservices";

const PAGE_SIZE = 10;

const ViewRequests = () => {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await Apiservices.getRequests();
        setRequests(res.data.data || []);
      } catch (err) {
        console.log(err);
        showToast.error("Failed to load requests");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  useEffect(() => { setPage(1); }, [search, filter]);

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const q = search.toLowerCase();
      const matchSearch = (r.learnerId?.name || "").toLowerCase().includes(q) || (r.sessionId?.title || "").toLowerCase().includes(q);
      const matchFilter = filter === "All" || r.requestStatus?.toLowerCase() === filter.toLowerCase();
      return matchSearch && matchFilter;
    });
  }, [requests, search, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));
  const paginated = filteredRequests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pendingCount = useMemo(() => requests.filter((r) => r.requestStatus === "pending").length, [requests]);

  return (
    <div>
      <div className="admin-page-header mb-4">
        <h1 className="fw-bold mb-1">Monitor Requests</h1>
        <p className="text-muted mb-0">View all session requests. Mentors handle approvals; admin monitors.</p>
      </div>

      {pendingCount > 0 && (
        <div className="row mb-4">
          <div className="col-sm-4">
            <div className="admin-card p-4">
              <p className="text-muted mb-1 small fw-semibold text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.3px" }}>Pending Requests</p>
              <h3 className="fw-bold mb-0" style={{ color: "#d97706" }}>{pendingCount}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="admin-card">
        <div className="p-4">
          <div className="row align-items-center g-3 mb-4">
            <div className="col-md-6">
              <input type="search" className="form-control rounded-pill" placeholder="Search by user or session"
                value={search} onChange={(e) => setSearch(e.target.value)}
                style={{ background: "#f8faff", border: "1px solid #eef2f7", padding: "10px 16px" }} />
            </div>
            <div className="col-md-6 text-md-end">
              {["All", "pending", "accepted", "rejected", "completed", "cancelled"].map((s) => (
                <button key={s} className={`btn btn-sm rounded-pill mx-1 fw-semibold ${filter === s ? "btn-primary" : "btn-outline-secondary"}`}
                  style={{ fontSize: "0.8rem" }} onClick={() => setFilter(s)}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="text-center py-4 text-muted">Loading...</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th className="fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", letterSpacing: "0.3px", borderBottom: "2px solid #eef2f7" }}>Learner</th>
                    <th className="fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", letterSpacing: "0.3px", borderBottom: "2px solid #eef2f7" }}>Session</th>
                    <th className="fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", letterSpacing: "0.3px", borderBottom: "2px solid #eef2f7" }}>Mentor</th>
                    <th className="fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", letterSpacing: "0.3px", borderBottom: "2px solid #eef2f7" }}>Date</th>
                    <th className="fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", letterSpacing: "0.3px", borderBottom: "2px solid #eef2f7" }}>Status</th>
                    <th className="text-end fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", letterSpacing: "0.3px", borderBottom: "2px solid #eef2f7" }}>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length ? (
                    paginated.map((r) => (
                      <tr key={r._id}>
                        <td className="fw-semibold" style={{ color: "#1e293b" }}>{r.learnerId?.name}</td>
                        <td style={{ color: "#64748b" }}>{r.sessionId?.title}</td>
                        <td style={{ color: "#64748b" }}>{r.mentorId?.name}</td>
                        <td style={{ color: "#64748b" }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge rounded-pill fw-medium ${r.requestStatus === "accepted" ? "bg-success" : r.requestStatus === "pending" ? "bg-warning text-dark" : "bg-danger"}`}
                            style={{ fontSize: "0.75rem" }}>{r.requestStatus}</span>
                        </td>
                        <td className="text-end">
                          <span className={`badge rounded-pill fw-medium ${r.paymentStatus === "paid" ? "bg-success" : "bg-secondary"}`}
                            style={{ fontSize: "0.75rem" }}>{r.paymentStatus || "pending"}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="6" className="text-center py-4 text-muted">No requests found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <small className="text-muted">Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filteredRequests.length)} of {filteredRequests.length}</small>
              <div className="btn-group">
                <button className="btn btn-outline-primary btn-sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => (
                  <button key={i + 1} className={`btn btn-sm ${page === i + 1 ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
                ))}
                <button className="btn btn-outline-primary btn-sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewRequests;
