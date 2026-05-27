import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Apiservices from "../../../../Apiservices";
import { PageHeader } from "../../learner/LearnerUI";
import { useAuth } from "../../../App";

const MentorDashboard = () => {
  const [stats, setStats] = useState({ sessions: 0, learners: 0, reviews: 0, rating: "—" });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [profRes, bookingRes, sessRes] = await Promise.all([
          Apiservices.getProfileStats().catch(() => ({ data: { data: {} } })),
          Apiservices.getMentorBookings().catch(() => ({ data: { data: [] } })),
          Apiservices.getMySessions().catch(() => ({ data: { data: [] } })),
        ]);

        const d = profRes.data.data || {};
        const bookings = bookingRes.data.data || [];
        const sessions = sessRes.data.data || [];

        setStats({
          sessions: d.sessions || sessions.length,
          learners: d.reviews || new Set(bookings.map((b) => b.learnerId?._id)).size,
          reviews: d.reviews || 0,
          rating: d.rating || "—",
        });

        setRecentBookings(bookings.slice(0, 5));
        setRecentSessions(sessions.slice(0, 3));
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const { user } = useAuth();
  const userName = user?.name || "Mentor";

  return (
    <>
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start mb-4" style={{ gap: "10px" }}>
        <div>
          <span className="text-primary fw-semibold small text-uppercase" style={{ letterSpacing: "0.5px" }}>SkillSwap Mentor</span>
          <h1 className="fw-bold mb-1">Welcome back, {userName}</h1>
          <p className="text-muted mb-0">Manage your sessions, learners, and track your impact.</p>
        </div>
        <Link to="/mentor/create-session" className="btn btn-primary rounded-pill px-4 fw-semibold flex-shrink-0">
          <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}><i className="fa fa-plus" />Create Session</span>
        </Link>
      </div>

      <div className="row g-4 mb-4">
        {[
          { icon: "fa-video", label: "Sessions Created", value: loading ? "..." : stats.sessions, color: "primary" },
          { icon: "fa-users", label: "Learners", value: loading ? "..." : stats.learners, color: "success" },
          { icon: "fa-star", label: "Average Rating", value: loading ? "..." : stats.rating, color: "warning" },
          { icon: "fa-comments", label: "Reviews", value: loading ? "..." : stats.reviews, color: "info" },
        ].map((s) => (
          <div className="col-sm-6 col-lg-3" key={s.label}>
            <div className="learner-card p-3 d-flex align-items-center h-100">
              <div style={{ width: 50, textAlign: "center", flexShrink: 0 }}>
                <i className={`fa ${s.icon} text-${s.color}`} style={{ fontSize: "1.5rem" }} />
              </div>
              <div style={{ borderLeft: "1px solid #e2e8f0", paddingLeft: 16 }}>
                <h4 className="fw-bold mb-0">{s.value}</h4>
                <small className="text-muted">{s.label}</small>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="learner-card p-4 h-100">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div style={{ width: 50, textAlign: "center", flexShrink: 0 }}>
                <i className="fa fa-calendar-check text-primary" style={{ fontSize: "1.1rem" }} />
              </div>
              <h5 className="fw-bold mb-0">Recent Bookings</h5>
            </div>
            {loading ? (
              <div className="text-center py-4"><div className="spinner-border spinner-border-sm text-primary" /></div>
            ) : recentBookings.length > 0 ? (
              <div className="list-group list-group-flush">
                {recentBookings.map((b) => (
                  <div key={b._id} className="list-group-item px-0 d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="fw-bold mb-0 small">{b.sessionId?.title || "Session"}</h6>
                      <small className="text-muted">{b.learnerId?.name || "Learner"}{b.sessionId?.maxLearners > 0 ? " • Group" : ""}</small>
                    </div>
                    <span style={{ background: b.requestStatus === "accepted" ? "linear-gradient(135deg, #16a34a, #15803d)" : b.requestStatus === "pending" ? "linear-gradient(135deg, #eab308, #ca8a04)" : "linear-gradient(135deg, #64748b, #475569)", color: b.requestStatus === "pending" ? "#1e293b" : "white", padding: "4px 14px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.3px" }}>
                      {b.requestStatus}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted small mb-0">No bookings yet.</p>
            )}
            <Link to="/mentor/bookings" className="btn btn-outline-primary btn-sm rounded-pill mt-3 w-100">View All Bookings</Link>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="learner-card p-4 h-100">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div style={{ width: 50, textAlign: "center", flexShrink: 0 }}>
                <i className="fa fa-video text-success" style={{ fontSize: "1.1rem" }} />
              </div>
              <h5 className="fw-bold mb-0">Your Sessions</h5>
            </div>
            {loading ? (
              <div className="text-center py-4"><div className="spinner-border spinner-border-sm text-primary" /></div>
            ) : recentSessions.length > 0 ? (
              <div className="list-group list-group-flush">
                {recentSessions.map((s) => (
                  <div key={s._id} className="list-group-item px-0 d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="fw-bold mb-0 small">{s.title}</h6>
                      <small className="text-muted">{s.date || "Flexible"} • {s.duration || 60}min</small>
                    </div>
                    <span style={{ background: s.status === "active" ? "linear-gradient(135deg, #16a34a, #15803d)" : "linear-gradient(135deg, #64748b, #475569)", color: "white", padding: "4px 14px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.3px" }}>{s.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted small mb-0">No sessions created yet.</p>
            )}
            <Link to="/mentor/my-sessions" className="btn btn-outline-primary btn-sm rounded-pill mt-3 w-100">Manage Sessions</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default MentorDashboard;
