import React, { useEffect, useMemo, useState } from "react";
import { showToast } from "../../utils/toastUtils";
import Apiservices from "../../../Apiservices";
import { LoadingState } from "../learner/LearnerUI";
import Pagination from "../Pagination";

const PAGE_SIZE = 10;

const AdminBookings = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await Apiservices.getRequests();
        setRequests(res.data.data || []);
      } catch (err) {
        showToast.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => { setPage(1); }, [filter]);

  const filtered = useMemo(() => {
    return requests.filter((r) => filter === "All" || r.requestStatus === filter);
  }, [requests, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statusLabels = {
    pending: "Awaiting Approval",
    accepted: "Confirmed",
    completed: "Completed",
    rejected: "Declined",
    cancelled: "Cancelled",
  };

  const statusColors = {
    pending: { bg: "bg-warning text-dark", color: "#d97706" },
    accepted: { bg: "bg-success", color: "#198754" },
    completed: { bg: "bg-primary", color: "#0891b2" },
    rejected: { bg: "bg-danger", color: "#dc3545" },
    cancelled: { bg: "bg-secondary", color: "#6c757d" },
  };

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((r) => r.requestStatus === "pending").length,
    accepted: requests.filter((r) => r.requestStatus === "accepted").length,
    completed: requests.filter((r) => r.requestStatus === "completed").length,
  }), [requests]);

  const CalendarIcon = ({ date }) => {
    if (!date) return null;
    const d = new Date(date);
    return (
      <div style={{ width: 48, height: 48, borderRadius: 12, background: "#f1f5f9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <small style={{ fontSize: "0.65rem", fontWeight: 700, color: "#ef4444", textTransform: "uppercase", lineHeight: 1 }}>
          {d.toLocaleString("en", { month: "short" })}
        </small>
        <span style={{ fontSize: "1rem", fontWeight: 800, color: "#1e293b", lineHeight: 1.2 }}>
          {d.getDate()}
        </span>
      </div>
    );
  };

  return (
    <div>
      <div className="admin-page-header mb-4">
        <h1 className="fw-bold mb-1">All Bookings</h1>
        <p className="text-muted mb-0">View all session bookings across the platform.</p>
      </div>

      <div className="row g-4 mb-4">
        {[
          { label: "Total", value: stats.total, color: "#0d6efd" },
          { label: statusLabels.pending, value: stats.pending, color: "#d97706" },
          { label: statusLabels.accepted, value: stats.accepted, color: "#198754" },
          { label: statusLabels.completed, value: stats.completed, color: "#0891b2" },
        ].map((s) => (
          <div className="col-sm-3" key={s.label}>
            <div className="admin-card p-4">
              <p className="text-muted mb-1 small fw-semibold text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.3px" }}>{s.label}</p>
              <h3 className="fw-bold mb-0" style={{ color: s.color }}>{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <LoadingState />
      ) : (
        <div className="admin-card">
          <div className="p-4">
            <div className="d-flex justify-content-between align-items-center gap-3 mb-4 flex-wrap">
              <div className="d-flex gap-3 flex-wrap">
                {["All", ...Object.keys(statusLabels)].map((s) => (
                  <button key={s} className={`btn btn-sm rounded-pill fw-semibold px-3 py-2 ${filter === s ? "btn-primary" : "btn-outline-secondary"}`}
                    style={{ fontSize: "0.8rem" }} onClick={() => setFilter(s)}>
                    {s === "All" ? "All" : statusLabels[s]}
                  </button>
                ))}
              </div>
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <small className="text-muted">{filtered.length} bookings</small>
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </div>

            <div className="row g-3">
              {paginated.length ? (
                paginated.map((r) => (
                  <div className="col-lg-6" key={r._id}>
                    <div className="d-flex align-items-center gap-3 p-3 rounded-4" style={{ background: "#f8faff", border: "1px solid #eef2f7" }}>
                      <CalendarIcon date={r.date || r.createdAt} />
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <h6 className="fw-bold mb-1" style={{ fontSize: "0.9rem" }}>{r.sessionId?.title || "Session"}</h6>
                        <small className="text-muted d-block">
                          {r.userId?.name || r.learnerId?.name} → {r.sessionId?.mentorId?.name || "Mentor"}
                        </small>
                        <small className="text-muted">{r.timeSlot || r.sessionId?.time || ""}</small>
                      </div>
                      <span className={`badge rounded-pill fw-medium ${statusColors[r.requestStatus]?.bg || "bg-secondary"}`}
                        style={{ fontSize: "0.7rem" }}>
                        {statusLabels[r.requestStatus] || r.requestStatus}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center py-4 text-muted">No bookings found</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
