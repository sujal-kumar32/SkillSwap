import React, { useEffect, useState } from "react";
import Apiservices from "../../../../Apiservices";
import { EmptyState, PageHeader, StatusBadge, TableSkeleton } from "../../learner/LearnerUI";
import Pagination from "../../Pagination";
import UserLink from "../../../components/shared/UserLink";

const PAGE_SIZE = 10;

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setError("");
        setLoading(true);
        const response = await Apiservices.fetchBookings({ page, limit: PAGE_SIZE, status: "completed,cancelled,rejected" });
        setBookings(response.data.data || []);
        setTotalPages(response.data.pages || 1);
        setTotal(response.data.total || 0);
      } catch (error) {
        setBookings([]);
        setError(error.response?.data?.message || "Failed to load booking history");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [page]);

  return (
    <>
      <PageHeader title="Booking History" subtitle="Review previous bookings, payment history, invoices, and session timelines." />
      {error && <div className="alert alert-danger rounded-4">{error}</div>}
      {loading ? <TableSkeleton rows={5} cols={5} /> : bookings.length ? (
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
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>
                      <h6 className="fw-bold mb-1">{booking.sessionId?.title}</h6>
                      <small className="text-muted"><UserLink user={booking.sessionId?.mentorId} name={booking.sessionId?.mentorId?.name} /></small>
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
          <div className="d-flex justify-content-between align-items-center px-3 py-4 border-top">
            <small className="text-muted">Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} of {total}</small>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      ) : (
        <EmptyState title="No historical bookings" text="Completed and cancelled bookings will appear here." />
      )}
    </>
  );
};

export default BookingHistory;
