import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { showToast } from "../../../utils/toastUtils";
import { confirmAlert } from "../../../utils/alertUtils";
import LoadingButton from "../../../../src/utils/LoadingButton";
import Apiservices from "../../../../Apiservices";
import { PageHeader, LoadingState } from "../../learner/LearnerUI";
import Pagination from "../../Pagination";


const avatarFor = (name = "Learner", image) =>
  image || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0d6efd&color=fff`;

const formatDate = (date) => {
  if (!date) return "Not scheduled";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await Apiservices.getMentorBookings({ page, limit: 12 });
      setBookings(response.data.data || []);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.log(error);
      showToast.error(error.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page]);

  const stats = useMemo(
    () => ({
      total: bookings.length,
      accepted: bookings.filter((booking) => booking.requestStatus === "accepted")
        .length,
      pending: bookings.filter((booking) => booking.requestStatus === "pending")
        .length,
    }),
    [bookings],
  );

  const handleStatus = async (bookingId, status) => {
    try {
      setUpdatingId(bookingId);
      await Apiservices.updateRequest(bookingId, status);
      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId
            ? { ...booking, requestStatus: status }
            : booking,
        ),
      );
      showToast.success(`Request ${status}`);
    } catch (error) {
      console.log(error);
      showToast.error(error.response?.data?.message || "Failed to update request");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Session Requests"
        subtitle="Manage learner bookings and session requests."
      />

      <div className="booking-wrapper mb-5">
        <div className="container">

          {/* STATS */}
          <div className="row g-4 mb-5">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm stats-card">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="stats-icon bg-primary">
                      <i className="fa fa-envelope"></i>
                    </div>

                    <div className="ms-3">
                      <h3 className="fw-bold mb-0">{stats.total}</h3>

                      <small className="text-muted">Total Requests</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm stats-card">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="stats-icon bg-success">
                      <i className="fa fa-check"></i>
                    </div>

                    <div className="ms-3">
                      <h3 className="fw-bold mb-0">{stats.accepted}</h3>

                      <small className="text-muted">Approved</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm stats-card">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="stats-icon bg-warning">
                      <i className="fa fa-clock"></i>
                    </div>

                    <div className="ms-3">
                      <h3 className="fw-bold mb-0">{stats.pending}</h3>

                      <small className="text-muted">Pending</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* REQUEST CARDS */}
          <div className="row g-4">
            {loading ? (
              <div className="col-12"><LoadingState /></div>
            ) : bookings.length ? (
              bookings.map((booking) => {
                    const learnerName = booking.learnerId?.name || "Learner";
                    const learnerImage = booking.learnerId?.profileImage;
                    const status = booking.requestStatus;
                    return (
                <div className="col-lg-4 col-md-6" key={booking._id}>
                  <div className="card border-0 shadow-sm booking-card h-100">
                    <div className="card-body p-4">
                      {/* USER */}
                      <div className="d-flex align-items-center mb-4">
                        <img
                          src={avatarFor(learnerName, learnerImage)}
                          alt={learnerName}
                          className="learner-image"
                        />

                      <div className="ms-3">
                        <h5 className="fw-bold mb-1">{learnerName}</h5>

                        <small className="text-muted">
                          {booking.learnerId?.email || "Learner"}
                        </small>
                      </div>
                    </div>

                    {/* SESSION */}
                    <div className="booking-detail mb-2">
                      <i className="fa fa-video text-primary" style={{ marginRight: 10 }}></i>

                      <span>{booking.sessionId?.title || "Session"}</span>
                    </div>

                    <div className="booking-detail mb-4">
                      <i className="fa fa-calendar text-success" style={{ marginRight: 10 }}></i>

                      <span>
                        {formatDate(booking.date || booking.sessionId?.date)}
                        {booking.timeSlot ? `, ${booking.timeSlot}` : ""}
                      </span>
                    </div>

                    {/* STATUS */}
                    <div className="mb-4">
                      <span
                        className={`badge px-3 py-2 rounded-pill ${
                          status === "accepted"
                            ? "bg-success"
                            : status === "pending"
                              ? "bg-warning text-dark"
                              : "bg-danger"
                        }`}
                      >
                        {status}
                      </span>
                    </div>

                    {/* BUTTONS - only for pending requests */}
                    {status === "pending" && (
                      <div className="d-flex gap-3 mt-3">
                        <LoadingButton
                          loading={updatingId === booking._id}
                          className="btn btn-success flex-fill rounded-pill py-2"
                          onClick={() => handleStatus(booking._id, "accepted")}
                        >
                          <i className="fa fa-check" style={{ marginRight: 10 }}></i>
                          Approve
                        </LoadingButton>

                        <LoadingButton
                          loading={updatingId === booking._id}
                          className="btn btn-outline-danger rounded-pill flex-fill py-2"
                          onClick={async () => {
                            const confirmed = await confirmAlert("Reject this booking request?");
                            if (confirmed) handleStatus(booking._id, "rejected");
                          }}
                        >
                          <i className="fa fa-times" style={{ marginRight: 10 }}></i>
                          Reject
                        </LoadingButton>
                      </div>
                    )}

                    {status === "accepted" && booking.sessionId?.meetLink && (
                      <div className="mt-3">
                        <button
                          className="btn btn-success rounded-pill w-100 py-2"
                          onClick={() => window.open(booking.sessionId.meetLink, "_blank")}
                        >
                          <i className="fa fa-video" style={{ marginRight: 10 }}></i>
                          Start Session
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
                );
              })
            ) : (
              <div className="col-12">
                <div className="card border-0 shadow-sm stats-card">
                  <div className="card-body text-center py-5">
                    <h5 className="fw-bold">No bookings yet</h5>
                    <p className="text-muted mb-0">
                      New learner requests will appear here.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {/* CSS */}
      <style>
        {`
          .booking-wrapper {
            position: relative;
            background:
              radial-gradient(circle at top left, rgba(13,110,253,0.06), transparent 25%),
              radial-gradient(circle at bottom right, rgba(25,135,84,0.05), transparent 25%),
              linear-gradient(to bottom, #f8fbff, #f5f7ff);
            overflow: hidden;
          }

          .booking-card {
            border-radius: 24px;
            background: white !important;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            overflow: hidden;
          }

          .booking-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 24px 55px rgba(15,23,42,0.1) !important;
          }

          .stats-card {
            border-radius: 20px;
            background: rgba(255,255,255,0.88) !important;
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255,255,255,0.7) !important;
            transition: all 0.3s ease;
          }

          .stats-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 16px 40px rgba(15,23,42,0.06) !important;
          }

          .stats-icon {
            width: 56px;
            height: 56px;
            border-radius: 16px;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            flex-shrink: 0;
          }

          .learner-image {
            width: 56px;
            height: 56px;
            object-fit: cover;
            border-radius: 50%;
            border: 3px solid #eef2ff;
            flex-shrink: 0;
          }

          .booking-detail {
            display: flex;
            align-items: center;
            color: #64748b;
            font-size: 14px;
          }

          .btn {
            font-weight: 600;
          }
        `}
      </style>
    </>
  );
};

export default Bookings;
