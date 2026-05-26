import React from "react";
import { Link } from "react-router-dom";

export const PageHeader = ({ title, subtitle, action }) => (
  <div className="learner-page-header d-flex flex-column flex-lg-row justify-content-between gap-3 mb-4">
    <div>
      <span className="text-primary fw-semibold small text-uppercase" style={{ letterSpacing: "0.5px" }}>
        SkillSwap Learner
      </span>
      <h1 className="fw-bold mb-1">{title}</h1>
      <p className="text-muted mb-0">{subtitle}</p>
    </div>
    {action && (
      <div className="d-flex align-items-center flex-shrink-0">
        {action}
      </div>
    )}
  </div>
);

export const StatCard = ({ icon, label, value, tone = "primary" }) => (
  <div className="col-sm-6 col-xl-3">
    <div className="learner-card p-4 h-100" style={{ cursor: "default" }}>
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <p className="text-muted mb-1 small fw-semibold text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.3px" }}>{label}</p>
          <h3 className="fw-bold mb-0" style={{ fontSize: "1.8rem" }}>{value}</h3>
        </div>
        <div className={`learner-icon bg-${tone} bg-opacity-10 text-${tone}`}>
          <i className={`fa ${icon}`} />
        </div>
      </div>
      <div style={{ marginTop: "16px", height: "3px", background: "#eef2f7", borderRadius: "999px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: "40%", background: tone === "primary" ? "linear-gradient(90deg, #0d6efd, #60a5fa)" : tone === "success" ? "linear-gradient(90deg, #198754, #4ade80)" : tone === "info" ? "linear-gradient(90deg, #0891b2, #67e8f9)" : "linear-gradient(90deg, #d97706, #fbbf24)", borderRadius: "999px", transition: "width 0.8s ease" }} />
      </div>
    </div>
  </div>
);

export const LoadingState = ({ label = "Loading data..." }) => (
  <div className="learner-card p-5 text-center">
    <div className="spinner-border text-primary mb-3" role="status" style={{ width: "2.5rem", height: "2.5rem" }} />
    <p className="text-muted mb-0">{label}</p>
  </div>
);

export const EmptyState = ({ title, text, actionLabel, actionTo }) => (
  <div className="learner-card p-5 text-center">
    <div className="learner-empty-icon mx-auto mb-3">
      <i className="fa fa-layer-group" />
    </div>
    <h5 className="fw-bold">{title}</h5>
    <p className="text-muted mb-4">{text}</p>
    {actionTo && (
      <Link to={actionTo} className="btn btn-primary rounded-pill px-4 fw-semibold">
        {actionLabel}
      </Link>
    )}
  </div>
);

export const StatusBadge = ({ status }) => {
  const map = {
    active: { gradient: "linear-gradient(135deg, #16a34a, #15803d)", color: "white", label: "Active" },
    accepted: { gradient: "linear-gradient(135deg, #16a34a, #15803d)", color: "white", label: "Accepted" },
    completed: { gradient: "linear-gradient(135deg, #0d6efd, #0a58ca)", color: "white", label: "Completed" },
    pending: { gradient: "linear-gradient(135deg, #eab308, #ca8a04)", color: "#1e293b", label: "Pending" },
    rejected: { gradient: "linear-gradient(135deg, #dc2626, #b91c1c)", color: "white", label: "Rejected" },
    cancelled: { gradient: "linear-gradient(135deg, #374151, #1f2937)", color: "white", label: "Cancelled" },
  };

  const { gradient, color, label } = map[status] || { gradient: "linear-gradient(135deg, #64748b, #475569)", color: "white", label: status || "Unknown" };

  return (
    <span style={{ background: gradient, color, padding: "4px 14px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.3px" }}>
      {label}
    </span>
  );
};

export const SessionCard = ({ session, onBook, onToggleSave }) => {
  const skill = session.skillId?.name || session.skill || "Skill";
  const category = session.skillId?.categoryId?.name || "Learning";
  const mentor = session.mentorId?.name || session.mentor || "SkillSwap Mentor";

  return (
    <div className="card learner-session-card h-100 border-0 shadow-sm">
      <div className="card-img-wrapper">
        <img
          src={session.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"}
          alt={session.title}
          className="card-img-top learner-session-img"
        />
        {onToggleSave && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSave?.(session); }}
            style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(8px)", zIndex: 3, transition: "all 0.2s" }}
            title={session.isSaved ? "Remove from wishlist" : "Save to wishlist"}
          >
            <i className={`fa ${session.isSaved ? "fa-heart" : "fa-heart-o"}`} style={{ color: session.isSaved ? "#dc2626" : "#64748b", fontSize: "0.85rem" }} />
          </button>
        )}
        <div className="position-absolute top-0 start-0 m-3 d-flex gap-2 flex-wrap" style={{ zIndex: 2 }}>
          <span className="badge rounded-pill" style={{ background: "rgba(255,255,255,0.9)", color: "#0d6efd", fontWeight: 600, backdropFilter: "blur(8px)" }}>
            {category}
          </span>
          {session.maxLearners > 0 && (
            <span className="badge rounded-pill" style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white", fontWeight: 600, fontSize: "0.7rem" }}>
              <i className="fa fa-users me-1" />Group
            </span>
          )}
          {session.isTrending && <span className="badge rounded-pill bg-danger">Trending</span>}
          {session.isAiRecommended && (
            <span className="badge rounded-pill" style={{ background: "rgba(6,182,212,0.9)", color: "white", backdropFilter: "blur(8px)" }}>
              AI Pick
            </span>
          )}
        </div>
      </div>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
          <h5 className="card-title mb-0">{session.title}</h5>
          <StatusBadge status={session.status} />
        </div>
        <p className="text-muted small mb-3">
          <i className="fa fa-user-tie text-primary" style={{ marginRight: 5 }} />
          {mentor}
        </p>
        <div className="d-flex flex-wrap small text-muted mb-3" style={{ gap: "15px" }}>
          {session.rating ? <span>
            <i className="fa fa-star text-warning" style={{ marginRight: 5 }} />
            {session.rating} <small className="text-muted">({session.reviewCount || 0})</small>
          </span> : null}
          {session.learners > 0 && <span>
            <i className="fa fa-users text-success" style={{ marginRight: 5 }} />
            {session.learners} learners
          </span>}
          {session.duration && <span>
            <i className="fa fa-clock text-primary" style={{ marginRight: 5 }} />
            {session.duration} min
          </span>}
          {session.maxLearners > 0 && (
            <span>
              <i className="fa fa-users" style={{ color: "#7c3aed", marginRight: 5 }} />
              {session.spotsFilled || 0}/{session.maxLearners} filled
            </span>
          )}
        </div>
        <p className="card-desc text-muted mb-4">
          {session.description || "A practical learning session led by an experienced mentor."}
        </p>
        <div className="d-flex align-items-center justify-content-between gap-2">
          <strong style={{ fontSize: "1.1rem", color: "#1e293b" }}>
            {session.price ? `₹${session.price}` : (
              <span className="text-success fw-bold">Free</span>
            )}
          </strong>
          <div className="btn-group">
            <Link
              to={`/learner/sessions/${session._id}`}
              className="btn btn-outline-primary btn-sm rounded-start-pill px-3 fw-semibold"
            >
              Details
            </Link>
            <button
              className="btn btn-primary btn-sm rounded-end-pill px-3 fw-semibold"
              onClick={() => onBook?.(session)}
            >
              Book
            </button>
          </div>
        </div>
        <div className="mt-3">
          <span className="badge rounded-pill" style={{ background: "#f1f5f9", color: "#64748b", fontWeight: 500 }}>
            <i className="fa fa-tag me-1" />
            {skill}
          </span>
        </div>
      </div>
    </div>
  );
};

export const ProgressBar = ({ value }) => (
  <div className="progress learner-progress">
    <div className="progress-bar" style={{ width: `${value}%` }}>
      {value}%
    </div>
  </div>
);
