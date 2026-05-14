import React, { useEffect, useMemo, useState } from "react";
import Apiservices from "../../../../Apiservices";
import { EmptyState, LoadingState, PageHeader, StatusBadge } from "../../learner/LearnerUI";

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setError("");
        const response = await Apiservices.fetchBookings();
        setBookings(response.data.data || []);
      } catch (error) {
        console.log(error);
        setBookings([]);
        setError(error.response?.data?.message || "Failed to load booking history");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const history = useMemo(
    () => bookings.filter((booking) => ["completed", "cancelled", "rejected"].includes(booking.requestStatus)),
    [bookings],
  );

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(history.length / pageSize));
  const paginated = history.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <PageHeader title="Booking History" subtitle="Review previous bookings, payment history, invoices, and session timelines." />
      {error && <div className="alert alert-danger rounded-4">{error}</div>}
      {loading ? <LoadingState /> : history.length ? (
        <div className="learner-card learner-table-card">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Session</th>
                  <th>Date</th>
                  <th>Payment</th>
                  <th>Timeline</th>
                  <th className="text-end">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((booking) => (
                  <tr key={booking._id}>
                    <td>
                      <h6 className="fw-bold mb-1">{booking.sessionId?.title}</h6>
                      <small className="text-muted">{booking.sessionId?.mentorId?.name}</small>
                    </td>
                    <td>{booking.date || booking.sessionId?.date || "—"}</td>
                    <td>{booking.paymentStatus}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <StatusBadge status={booking.requestStatus} />
                        <span className="text-muted small">Requested → Confirmed → Completed</span>
                      </div>
                    </td>
                    <td className="text-end">
                      <button className="btn btn-outline-primary btn-sm rounded-pill" disabled>
                        Download Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center px-3 py-3 border-top">
              <small className="text-muted">Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, history.length)} of {history.length}</small>
              <div className="btn-group">
                <button className="btn btn-outline-primary btn-sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} className={`btn btn-sm ${p === page ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="btn btn-outline-primary btn-sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState title="No historical bookings" text="Completed and cancelled bookings will appear here." />
      )}
    </>
  );
};

export default BookingHistory;
