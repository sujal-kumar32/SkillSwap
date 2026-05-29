import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserLink from "../../../components/shared/UserLink";
import { showToast } from "../../../utils/toastUtils";
import { deleteConfirmAlert } from "../../../utils/alertUtils";
import Apiservices from "../../../../Apiservices";
import { EmptyState, PageHeader, StatCard, StatusBadge, TableSkeleton } from "../../learner/LearnerUI";
import Pagination from "../../Pagination";
import { getSessionState } from "../../../utils/sessionTimeUtils";

const PAGE_SIZE = 10;

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [tick, setTick] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setError("");
        setLoading(true);
        const params = { page, limit: PAGE_SIZE };
        if (filter !== "all") params.status = filter;
        const response = await Apiservices.fetchBookings(params);
        setBookings(response.data.data || []);
        setTotalPages(response.data.pages || 1);
        setTotal(response.data.total || 0);
      } catch (error) {
        setBookings([]);
        setError(error.response?.data?.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [page, filter]);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const bookingsWithState = useMemo(() => {
    return bookings.map((b) => ({ ...b, _sessionState: getSessionState(b.sessionId) }));
  }, [bookings, tick]);

  const filtered = useMemo(() =>
    bookingsWithState.filter((b) => {
      const title = b.sessionId?.title?.toLowerCase() || "";
      return title.includes(query.toLowerCase());
    }),
    [bookingsWithState, query],
  );

  useEffect(() => { setPage(1); }, [query, filter]);

  return (
    <>
      <PageHeader title="My Bookings" subtitle="Manage upcoming, pending, completed, and cancelled learning sessions." />
      {error && <div className="alert alert-danger rounded-4">{error}</div>}
      <div className="row g-4 mb-4">
        <StatCard icon="fa-calendar-alt" label="All Bookings" value={total} />
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

      {loading ? <TableSkeleton rows={5} cols={5} /> : filtered.length ? (
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
                {filtered.map((booking) => (
                  <tr key={booking._id} style={{ borderBottom: "12px solid #f1f5f9" }}>
                    <td>
                      <div className="d-flex align-items-center" style={{ gap: 10 }}>
                        <img src={booking.sessionId?.thumbnail} alt="" className="rounded-3" width="72" height="54" style={{ objectFit: "cover" }} />
                        <div>
                          <h6 className="fw-bold mb-1 d-flex align-items-center" style={{ gap: 8 }}>
                            {booking.sessionId?.title}
                            {booking._sessionState === "live" && booking.requestStatus === "accepted" && (
                              <span style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)", color: "white", padding: "4px 14px", borderRadius: 999, fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.3px" }}>Live</span>
                            )}
                            {booking._sessionState === "upcoming" && booking.requestStatus === "accepted" && (
                              <span style={{ background: "linear-gradient(135deg, #16a34a, #15803d)", color: "white", padding: "4px 14px", borderRadius: 999, fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.3px" }}>Upcoming</span>
                            )}
                          </h6>
                          <small className="text-muted"><UserLink user={booking.sessionId?.mentorId} name={booking.sessionId?.mentorId?.name} /></small>
                        </div>
                      </div>
                    </td>
                    <td>{booking.date || booking.sessionId?.date || "—"} <span className="text-muted">{booking.timeSlot || booking.sessionId?.time || ""}</span></td>
                    <td>{booking.paymentStatus}</td>
                    <td><StatusBadge status={booking.requestStatus} /></td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end flex-wrap" style={{ gap: 6 }}>
                        <button onClick={() => {
                          Apiservices.getOrCreateBookingChat(booking._id).then((res) => {
                            navigate(`/messages/${res.data.data._id}`);
                          }).catch(() => {});
                        }}
                          className="btn btn-sm btn-outline-info rounded-pill px-3 py-2 fw-semibold">
                          <i className="fa fa-comment" />
                        </button>
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
          <div className="d-flex justify-content-between align-items-center px-3 py-4 border-top">
            <small className="text-muted">Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} of {total}</small>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      ) : (
        <EmptyState title="No bookings found" text="Book sessions to start your learning journey." actionLabel="Explore Sessions" actionTo="/learner/explore" />
      )}
    </>
  );
};

export default MyBookings;
