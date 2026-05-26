import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { deleteConfirmAlert } from "../../../../src/utils/alertUtils";
import { showToast } from "../../../utils/toastUtils";
import LoadingButton from "../../../../src/utils/LoadingButton";
import Apiservices from "../../../../Apiservices";
import { PageHeader, LoadingState } from "../../learner/LearnerUI";
import Pagination from "../../Pagination";
import { getSessionState } from "../../../utils/sessionTimeUtils";

const fallbackImage =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop";

const formatDate = (date) => {
  if (!date) return "Not scheduled";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const stateBadge = (state) => {
  if (state === "live") return { cls: "bg-danger", label: "🔴 Live Now" };
  if (state === "upcoming") return { cls: "bg-success", label: "Upcoming" };
  if (state === "cancelled") return { cls: "bg-secondary", label: "Cancelled" };
  return { cls: "bg-secondary", label: "Completed" };
};

const MySessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tick, setTick] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await Apiservices.getMySessions({ page, limit: 12 });
      setSessions(response.data.data || []);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.log(error);
      showToast.error(error.response?.data?.message || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [page]);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const sessionStates = useMemo(() => {
    return sessions.map((s) => ({ ...s, _state: getSessionState(s) }));
  }, [sessions, tick]);

  const stats = useMemo(() => {
    const totalLearners = sessions.reduce(
      (sum, session) => sum + (session.bookings || 0),
      0,
    );

    return {
      total: sessions.length,
      learners: totalLearners,
      active: sessionStates.filter((s) => s._state === "upcoming" || s._state === "live").length,
    };
  }, [sessionStates]);

  const handleStatusChange = async (sessionId, newStatus) => {
    try {
      setUpdatingStatus(sessionId);
      await Apiservices.updateSession(sessionId, { status: newStatus });
      setSessions((prev) =>
        prev.map((s) =>
          s._id === sessionId ? { ...s, status: newStatus } : s,
        ),
      );
      showToast.success(
        newStatus === "completed" ? "Session marked as completed" : "Session cancelled",
      );
    } catch (error) {
      console.log(error);
      showToast.error(
        error.response?.data?.message || `Failed to update session`,
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async (sessionId) => {
    const confirmed = await deleteConfirmAlert("this session");
    if (!confirmed) return;
    try {
      setDeletingId(sessionId);
      await Apiservices.deleteSession(sessionId);
      setSessions((prev) => prev.filter((session) => session._id !== sessionId));
      showToast.success("Session deleted");
    } catch (error) {
      console.log(error);
      showToast.error(error.response?.data?.message || "Failed to delete session");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <PageHeader
        title="My Sessions"
        subtitle="Manage and track your learning sessions."
        action={
          <Link
            to="/mentor/create-session"
            className="btn btn-primary rounded-pill px-4 py-2 fw-semibold"
          >
            <i className="fa fa-plus-circle" style={{ marginRight: 10 }}></i>
            Create Session
          </Link>
        }
      />

      <div className="sessions-wrapper mb-5">
        <div className="container">
          <div className="row g-4 mb-5">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm stats-card">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="stats-icon bg-primary">
                      <i className="fa fa-video"></i>
                    </div>

                    <div className="ms-3">
                      <h3 className="fw-bold mb-0">{stats.total}</h3>

                      <small className="text-muted">Total Sessions</small>
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
                      <i className="fa fa-users"></i>
                    </div>

                    <div className="ms-3">
                      <h3 className="fw-bold mb-0">{stats.learners}</h3>

                      <small className="text-muted">Total Learners</small>
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
                      <i className="fa fa-star"></i>
                    </div>

                    <div className="ms-3">
                      <h3 className="fw-bold mb-0">{stats.active}</h3>

                      <small className="text-muted">Active Sessions</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {loading ? (
              <div className="col-12"><LoadingState /></div>
            ) : sessionStates.length ? (
              sessionStates.map((session) => {
                const badge = stateBadge(session._state);
                return (
                <div className="col-lg-4 col-md-6" key={session._id}>
                <div className="card border-0 shadow-sm session-card h-100">
                  <div className="position-relative">
                    <img
                      src={session.thumbnail || fallbackImage}
                      alt={session.title}
                      className="card-img-top session-image"
                    />

                    <span className={`badge session-badge ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="card-body p-4">
                    <small className="text-primary fw-semibold">
                      {session.skillId?.categoryId?.name || "Skill Session"}
                    </small>

                    <h5 className="fw-bold mt-2 mb-3">{session.title}</h5>

                    <div className="session-detail mb-2">
                      <i className="fa fa-calendar-alt text-primary" style={{ marginRight: 10 }}></i>

                      <span>
                        {formatDate(session.date)}
                        {session.time ? ` at ${session.time}` : ""}
                      </span>
                    </div>

                    <div className="session-detail mb-2">
                      <i className="fa fa-users text-success" style={{ marginRight: 10 }}></i>

                      <span>{session.bookings || 0} Bookings</span>
                    </div>

                    <div className="session-detail mb-4">
                      <i className="fa fa-wallet text-warning" style={{ marginRight: 10 }}></i>

                      <span>{session.price ? `₹${session.price}` : "Free"}</span>
                    </div>

                    <div className="d-flex flex-wrap" style={{ gap: "8px" }}>
                      {session.status === "active" && (
                        <>
                          <LoadingButton
                            loading={updatingStatus === session._id}
                            className="btn btn-outline-success rounded-pill flex-fill py-2"
                            onClick={() => handleStatusChange(session._id, "completed")}
                          >
                            <i className="fa fa-check-circle" style={{ marginRight: 6 }}></i>
                            Complete
                          </LoadingButton>
                          <LoadingButton
                            loading={updatingStatus === session._id}
                            className="btn btn-outline-warning rounded-pill px-3 py-2"
                            onClick={() => handleStatusChange(session._id, "cancelled")}
                          >
                            <i className="fa fa-ban"></i>
                          </LoadingButton>
                        </>
                      )}
                      {session.status !== "active" && (
                        <span className={`badge ${badge.cls} fs-6 px-3 py-2 flex-fill text-center`}>
                          {badge.label}
                        </span>
                      )}
                      <LoadingButton
                        loading={deletingId === session._id}
                        className="btn btn-outline-danger rounded-pill px-3 py-2"
                        onClick={() => handleDelete(session._id)}
                      >
                        <i className="fa fa-trash"></i>
                      </LoadingButton>
                    </div>

                    {session.sessionType === "online" && session.meetLink && (
                      session._state === "upcoming" ? (
                        <button
                          className="btn btn-success rounded-pill w-100 py-2 mt-2"
                          onClick={() => window.open(session.meetLink, "_blank")}
                        >
                          <i className="fa fa-video" style={{ marginRight: 6 }}></i>
                          Start Session
                        </button>
                      ) : session._state === "live" ? (
                        <button
                          className="btn btn-outline-success rounded-pill w-100 py-2 mt-2"
                          onClick={() => window.open(session.meetLink, "_blank")}
                        >
                          <i className="fa fa-video" style={{ marginRight: 6 }}></i>
                          Join Session
                        </button>
                      ) : null
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
                    <h5 className="fw-bold">No sessions yet</h5>
                    <p className="text-muted mb-4">
                      Create your first session to start receiving learner bookings.
                    </p>
                    <Link to="/mentor/create-session" className="btn btn-primary rounded-pill px-4">
                      Create Session
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      <style>
        {`
          .session-card {
            border-radius: 24px;
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            background: white;
          }

          .session-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 24px 55px rgba(15,23,42,0.1) !important;
          }

          .session-card .card-img-top {
            transition: transform 0.4s ease;
          }

          .session-card:hover .card-img-top {
            transform: scale(1.05);
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

          .session-image {
            height: 220px;
            object-fit: cover;
          }

          .session-badge {
            position: absolute;
            top: 15px;
            right: 15px;
            padding: 8px 16px;
            border-radius: 50px;
            font-size: 12px;
            font-weight: 600;
            backdrop-filter: blur(8px);
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

          .session-detail {
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

export default MySessions;
