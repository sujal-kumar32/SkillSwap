import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { showToast } from "../../../../utils/toastUtils";
import { useAuth } from "../../../../App";
import { useSocket } from "../../../../context/SocketContext";

const links = [
  { to: "/mentor", label: "Dashboard", icon: "fa-tachometer-alt", end: true },
  { to: "/mentor/my-skills", label: "My Skills", icon: "fa-code" },
  { to: "/mentor/create-skill", label: "Create Skill", icon: "fa-lightbulb" },
  { to: "/mentor/my-sessions", label: "My Sessions", icon: "fa-chalkboard-teacher" },
  { to: "/mentor/create-session", label: "Create Session", icon: "fa-plus-circle" },
  { to: "/mentor/availability", label: "Availability", icon: "fa-clock" },
  { to: "/mentor/bookings", label: "Bookings", icon: "fa-calendar-check", badgeKey: "pendingBookings" },
  { to: "/mentor/learners", label: "Learners", icon: "fa-users" },
  { to: "/mentor/reviews", label: "Reviews", icon: "fa-star" },
  { to: "/mentor/analytics", label: "Analytics", icon: "fa-chart-bar" },
  { to: "/mentor/earnings", label: "Earnings", icon: "fa-credit-card" },
];

const XpWidget = ({ user }) => {
  if (!user) return null;
  const xp = user.xp || 0;
  const level = user.level || 1;
  const nextLevelXp = 50 * level * (level + 1);
  const currentLevelXp = 50 * level * (level - 1);
  const progress = nextLevelXp > currentLevelXp
    ? Math.min(100, ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100)
    : 0;
  return (
    <Link to="/profile" className="text-decoration-none">
      <div className="mx-3 mb-2 p-3 rounded-4" style={{ background: "linear-gradient(135deg, #0d6efd08, #6610f208)", border: "1px solid #eef2f7" }}>
        <div className="d-flex align-items-center justify-content-between mb-1">
          <small className="fw-bold text-muted" style={{ fontSize: "0.67rem", letterSpacing: "0.3px" }}>LEVEL {level}</small>
          <small className="fw-bold text-primary" style={{ fontSize: "0.7rem" }}>
            <i className="fa fa-bolt me-1" />{xp} XP
          </small>
        </div>
        <div style={{ height: 4, background: "#eef2f7", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.min(100, progress)}%`, background: "linear-gradient(90deg, #0d6efd, #6610f2)", borderRadius: 999, transition: "width 0.5s ease" }} />
        </div>
        <small className="text-muted" style={{ fontSize: "0.6rem", marginTop: 2, display: "block" }}>
          {xp - currentLevelXp} / {nextLevelXp - currentLevelXp} XP to next level
        </small>
      </div>
    </Link>
  );
};

const badgeStyle = {
  marginLeft: "auto", background: "#ef4444", color: "#fff", fontSize: "0.6rem", fontWeight: 700,
  padding: "1px 6px", borderRadius: 999, minWidth: 18, textAlign: "center",
};

const MentorSidebar = ({ sidebarOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { sidebarCounts } = useSocket();

  const handleLogout = async () => {
    await logout();
    showToast.success("Logged out successfully");
    navigate("/", { replace: true });
  };

  const handleNav = () => { if (onClose) onClose(); };

  return (
    <aside className={`learner-sidebar${sidebarOpen ? " open" : ""}`}>
      <div className="p-4 border-bottom" style={{ borderColor: "rgba(0,0,0,0.04)" }}>
        <Link to="/workspace" className="text-decoration-none">
          <div className="d-flex align-items-center gap-2">
            <div className="learner-brand-icon">
              <i className="fa fa-chalkboard-teacher" />
            </div>
            <div>
              <h5 className="fw-bold mb-0" style={{ color: "#1e293b" }}>SkillSwap</h5>
              <small style={{ color: "#94a3b8", fontSize: "0.75rem" }}>Mentor Studio</small>
            </div>
          </div>
        </Link>
      </div>

      <nav className="p-3 flex-grow-1" onClick={handleNav}>
        {links.map((link) => {
          const count = link.badgeKey ? sidebarCounts[link.badgeKey] : 0;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `learner-nav-link ${isActive ? "active" : ""}`
              }
            >
              <i className={`fa ${link.icon}`} />
              <span>{link.label}</span>
              {count > 0 && <span style={badgeStyle}>{count > 99 ? "99+" : count}</span>}
            </NavLink>
          );
        })}
      </nav>

      <XpWidget user={user} />
      <div className="p-3" style={{ borderTop: "1px solid rgba(0,0,0,0.04)" }}>
        <Link
          to="/workspace"
          className="btn w-100 rounded-pill mb-2 fw-semibold"
          style={{ background: "#f1f5f9", color: "#475569", border: "none", fontSize: "0.85rem" }}
        >
          <i className="fa fa-exchange-alt" style={{ marginRight: 10 }} />
          Switch Role
        </Link>
        <button
          className="btn w-100 rounded-pill fw-semibold"
          style={{ background: "transparent", color: "#ef4444", border: "1px solid #fee2e2", fontSize: "0.85rem" }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default MentorSidebar;
