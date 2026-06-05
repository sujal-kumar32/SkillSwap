import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserLink from "../../../components/shared/UserLink";
import { showToast } from "../../../utils/toastUtils";
import Apiservices from "../../../../Apiservices";
import {
  EmptyState,
  PageHeader,
  SessionCard,
  StatCard,
  StatsCardSkeleton,
  StatusBadge,
} from "../../learner/LearnerUI";
import { DashboardSkeleton } from "../../ui/Skeleton";
import { useAuth } from "../../../App";
import OnboardingChecklist from "../../../components/shared/OnboardingChecklist";
const LearnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [progressSummary, setProgressSummary] = useState({ completion: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const [bookingRes, sessionRes, progressRes] = await Promise.all([
          Apiservices.fetchBookings(),
          Apiservices.fetchRecommendations().catch(() => Apiservices.fetchSessions()),
          Apiservices.fetchProgress().catch(() => ({ data: { summary: { completion: 0 } } })),
        ]);
        const fetchedBookings = bookingRes.data.data || [];
        setBookings(fetchedBookings);
        setSessions(sessionRes.data.data || []);
        setProgressSummary(progressRes.data.summary || { completion: 0 });

        const completedWithoutReview = fetchedBookings.filter(
          (b) => b.requestStatus === "completed",
        );
        if (completedWithoutReview.length > 0) {
          const reviewRes = await Apiservices.fetchReviews({ limit: 100 }).catch(() => ({ data: { data: [] } }));
          const myReviews = reviewRes.data.data || [];
          const reviewedSessionIds = new Set(myReviews.map((r) => r.sessionId?._id || r.sessionId).filter(Boolean));
          const unreviewed = completedWithoutReview.filter(
            (b) => !reviewedSessionIds.has(b.sessionId?._id || b.sessionId),
          );
          if (unreviewed.length > 0) {
            const key = `dismiss_review_prompt_${user?._id || "anon"}`;
            if (!localStorage.getItem(key)) {
              localStorage.setItem(key, "1");
              showToast.info(
                `${unreviewed.length} completed session${unreviewed.length > 1 ? "s" : ""} awaiting your review! Tap to review.`,
                { autoClose: 10000, onClick: () => navigate("/learner/reviews") },
              );
            }
          }
        }
      } catch (error) {
        console.log(error);
        setBookings([]);
        setSessions([]);
        setProgressSummary({ completion: 0 });
        setError(error.response?.data?.message || "Failed to load learner dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  const stats = useMemo(
    () => ({
      total: bookings.length,
      active: bookings.filter((item) => item.requestStatus === "accepted").length,
      completed: bookings.filter((item) => item.requestStatus === "completed").length,
      progress: `${progressSummary.completion || 0}%`,
    }),
    [bookings, progressSummary],
  );

  const handleBook = (session) => {
    navigate(`/learner/book/${session._id}`);
  };

  return (
    <>
      <PageHeader
        title="Welcome back"
        subtitle="Track your sessions, continue learning, and discover new skills."
        action={
          <Link to="/learner/explore" className="btn btn-primary rounded-pill px-4">
            Explore Sessions
          </Link>
        }
      />

      {error && <div className="alert alert-danger rounded-4">{error}</div>}

      <OnboardingChecklist role="learner" />

      {loading ? <DashboardSkeleton /> : (
      <>
      <div className="row g-4 mb-4">
        <StatCard icon="fa-calendar-check" label="Total Bookings" value={stats.total} />
        <StatCard icon="fa-video" label="Active Sessions" value={stats.active} tone="success" />
        <StatCard icon="fa-circle-check" label="Completed" value={stats.completed} tone="info" />
        <StatCard icon="fa-chart-line" label="Learning Progress" value={stats.progress} tone="warning" />
      </div>

      <div className="row g-4">
        <div className="col-xl-8">
          <div className="learner-card p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Upcoming Sessions</h5>
              <Link to="/learner/bookings" className="small fw-semibold">View all</Link>
            </div>
            {bookings.slice(0, 3).map((booking) => (
              <div key={booking._id} className="d-flex align-items-center justify-content-between border-top py-3">
                <div>
                  <h6 className="fw-bold mb-1">{booking.sessionId?.title}{booking.sessionId?.bookingTypes?.includes("credits") ? <span className="d-inline-flex align-items-center" style={{ gap: 3, padding: "1px 5px", borderRadius: 999, fontSize: "0.6rem", fontWeight: 600, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", marginLeft: 6, verticalAlign: "middle" }}><i className="fa fa-coins" />{booking.sessionId?.creditCost || ""}</span> : ""}</h6>
                  <small className="text-muted">
                    {booking.date} at {booking.timeSlot || booking.sessionId?.time}
                  </small>
                </div>
                <StatusBadge status={booking.requestStatus} />
              </div>
            ))}
            {!bookings.length && (
              <EmptyState title="No bookings yet" text="Book a session to see your schedule here." actionLabel="Explore" actionTo="/learner/explore" />
            )}
          </div>

          <div className="learner-card p-4" style={{ marginBottom: 6 }}>
            <h5 className="fw-bold mb-3">Progress Snapshot</h5>
            <div className="bg-light rounded-4 p-5 text-center">
              <i className="fa fa-chart-column fa-2x text-primary mb-3" />
              <h3 className="fw-bold">{stats.progress}</h3>
              <p className="text-muted mb-0">Overall completion from your booked sessions.</p>
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="learner-card p-4 mb-4">
            <span style={{ background: "linear-gradient(135deg, #0d6efd, #0a58ca)", color: "white", padding: "4px 14px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.3px", display: "inline-block" }}>AI Recommendations</span>
            <h5 className="fw-bold" style={{ marginTop: 12 }}>Smart picks for your goals</h5>
            <p className="text-muted small">Based on your booked sessions and interests.</p>
            <Link to="/learner/ai" className="btn btn-outline-primary rounded-pill w-100">Open AI Picks</Link>
          </div>

          <div className="learner-card p-4">
            <h5 className="fw-bold mb-3">Recommended Sessions</h5>
            {sessions.slice(0, 2).map((session) => (
              <div key={session._id} className="border-top py-3">
                <h6 className="fw-bold mb-1">{session.title}{session.bookingTypes?.includes("credits") ? <span className="d-inline-flex align-items-center" style={{ gap: 3, padding: "1px 5px", borderRadius: 999, fontSize: "0.6rem", fontWeight: 600, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", marginLeft: 6, verticalAlign: "middle" }}><i className="fa fa-coins" />{session.creditCost || ""}</span> : ""}</h6>
                <small className="text-muted"><UserLink user={session.mentorId} name={session.mentorId?.name} /> • {session.duration || 60} min</small>
              </div>
            ))}
            {!sessions.length && (
              <p className="text-muted small mb-0">No recommendations available yet.</p>
            )}
          </div>
        </div>
      </div>

      {sessions.length > 0 && (
        <div className="row g-4 mt-1">
          {sessions.slice(0, 3).map((session) => (
            <div className="col-md-6 col-xl-4" key={session._id}>
              <SessionCard session={session} onBook={handleBook} />
            </div>
          ))}
        </div>
      )}
      </>
      )}
    </>
  );
};

export default LearnerDashboard;
