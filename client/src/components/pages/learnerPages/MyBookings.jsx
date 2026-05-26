import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { showToast } from "../../../utils/toastUtils";
import { deleteConfirmAlert } from "../../../utils/alertUtils";
import Apiservices from "../../../../Apiservices";
import { EmptyState, LoadingState, PageHeader, StatCard, StatusBadge } from "../../learner/LearnerUI";
import { getSessionState } from "../../../utils/sessionTimeUtils";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setError("");
        const response = await Apiservices.fetchBookings();
        setBookings(response.data.data || []);
      } catch (error) {
        console.log(error);
        setBookings([]);
        setError(error.response?.data?.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const bookingsWithState = useMemo(() => {
    return bookings.map((b) => ({ ...b, _sessionState: getSessionState(b.sessionId) }));
  }, [bookings, tick]);

  const filtered = useMemo(
    () =>
      bookingsWithState.filter((booking) => {
        const title = booking.sessionId?.title?.toLowerCase() || "";
        const matchQuery = title.includes(query.toLowerCase());
        const matchFilter = filter === "all" || booking.requestStatus === filter;
        return matchQuery && matchFilter;
      }),
    [bookingsWithState, query, filter],
  );

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { setPage(1); }, [query, filter]);

  return (
    <>
      <PageHeader title="My Bookings" subtitle="Manage upcoming, pending, completed, and cancelled learning sessions." />
      {error && <div className="alert alert-danger rounded-4">{error}</div>}
      <div className="row g-4 mb-4">
        <StatCard icon="fa-calendar-alt" label="All Bookings" value={bookings.length} />
        <StatCard icon="fa-clock" label="Pending" value={bookings.filter((b) => b.requestStatus === "pending").length} tone="warning" />
        <StatCard icon="fa-video" label="Upcoming" value={bookings.filter((b) => b._sessionState === "upcoming" || b._sessionState === "live").length} tone="success" />
        <StatCard icon="fa-circle-check" label="Completed" value={bookings.filter((b) => b._sessionState === "completed" || b.requestStatus === "completed" || b.requestStatus === "rejected" || b.requestStatus === "cancelled").length} tone="info" />
      </div>

      <div className="learner-card p-4 mb-4">
        <div className="row g-3">
          <div className="col-md-8">
            <input className="form-control rounded-pill" placeholder="Search booked sessions..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="col-md-4">
            <select className="form-select rounded-pill" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? <LoadingState /> : filtered.length ? (
        <div className="learner-card learner-table-card">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Session</th>
                  <th>Date</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((booking) => (
                  <tr key={booking._id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <img src={booking.sessionId?.thumbnail} alt="" className="rounded-3" width="72" height="54" style={{ objectFit: "cover" }} />
                        <div>
                          <h6 className="fw-bold mb-1">
                            {booking.sessionId?.title}
                            {booking._sessionState === "live" && booking.requestStatus === "accepted" && (
                              <span style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)", color: "white", padding: "4px 14px", borderRadius: 999, fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.3px" }} className="ms-2">🔴 Live</span>
                            )}
                            {booking._sessionState === "upcoming" && booking.requestStatus === "accepted" && (
                              <span style={{ background: "linear-gradient(135deg, #16a34a, #15803d)", color: "white", padding: "4px 14px", borderRadius: 999, fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.3px" }} className="ms-2">Upcoming</span>
                            )}
                          </h6>
                          <small className="text-muted">{booking.sessionId?.mentorId?.name}</small>
                        </div>
                      </div>
                    </td>
                    <td>{booking.date || booking.sessionId?.date || "—"} <span className="text-muted">{booking.timeSlot || booking.sessionId?.time || ""}</span></td>
                    <td>{booking.paymentStatus}</td>
                    <td><StatusBadge status={booking.requestStatus} /></td>
                    <td className="text-end">
                      <div className="d-flex gap-3 justify-content-end">
                        <Link to={`/learner/sessions/${booking.sessionId?._id}`} className="btn btn-sm btn-outline-primary rounded-pill px-3 py-2 fw-semibold">Details</Link>
                        {(booking._sessionState === "live" || booking._sessionState === "upcoming") && booking.requestStatus === "accepted" && booking.sessionId?.sessionType === "online" ? (
                          <button className="btn btn-sm btn-primary rounded-pill px-3 py-2 fw-semibold"
                            onClick={() => {
                              const link = booking.sessionId?.meetLink;
                              if (link) window.open(link, "_blank");
                              else showToast.info("Meeting link not available");
                            }}>{booking._sessionState === "live" ? "Join" : "Join Early"}</button>
                        ) : (
                          <button className="btn btn-sm btn-secondary rounded-pill px-3 py-2 fw-semibold" disabled>Join</button>
                        )}
                        <button
                          className="btn btn-sm btn-outline-danger rounded-pill px-3 py-2 fw-semibold"
                          disabled={!["pending", "accepted"].includes(booking.requestStatus)}
                          onClick={async () => {
                            const confirmed = await deleteConfirmAlert("this booking");
                            if (!confirmed) return;
                            try {
                              await Apiservices.updateRequest(booking._id, "cancelled");
                              setBookings((prev) =>
                                prev.map((item) =>
                                  item._id === booking._id
                                    ? { ...item, requestStatus: "cancelled" }
                                    : item,
                                ),
                              );
                              showToast.success("Booking cancelled");
                            } catch (error) {
                              console.log(error);
                              showToast.error(error.response?.data?.message || "Failed to cancel booking");
                            }
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center px-3 py-4 border-top">
              <small className="text-muted">Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} of {filtered.length}</small>
              <div className="d-flex gap-3">
                <button className="btn btn-sm btn-outline-secondary rounded-pill px-4 py-2 fw-semibold" disabled={page === 1} onClick={() => setPage((p) => p - 1)}><i className="fa fa-chevron-left" style={{ marginRight: 10 }} />Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold ${p === page ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="btn btn-sm btn-outline-secondary rounded-pill px-4 py-2 fw-semibold" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next<i className="fa fa-chevron-right ms-2" /></button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState title="No bookings found" text="Book sessions to start your learning journey." actionLabel="Explore Sessions" actionTo="/learner/explore" />
      )}
    </>
  );
};

export default MyBookings;
