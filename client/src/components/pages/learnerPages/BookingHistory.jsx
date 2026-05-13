import React, { useEffect, useMemo, useState } from "react";
import Apiservices from "../../../../Apiservices";
import { EmptyState, LoadingState, PageHeader, StatusBadge } from "../../learner/LearnerUI";

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
                {history.map((booking) => (
                  <tr key={booking._id}>
                    <td>
                      <h6 className="fw-bold mb-1">{booking.sessionId?.title}</h6>
                      <small className="text-muted">{booking.sessionId?.mentorId?.name}</small>
                    </td>
                    <td>{booking.date}</td>
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
        </div>
      ) : (
        <EmptyState title="No historical bookings" text="Completed and cancelled bookings will appear here." />
      )}
    </>
  );
};

export default BookingHistory;
