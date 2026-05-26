import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { showToast } from "../../../../utils/toastUtils";
import { useAuth } from "../../../../App";

const links = [
  { to: "/mentor", label: "Dashboard", icon: "fa-tachometer-alt", end: true },
  { to: "/mentor/create-skill", label: "Create Skill", icon: "fa-lightbulb" },
  { to: "/mentor/my-skills", label: "My Skills", icon: "fa-code" },
  { to: "/mentor/create-session", label: "Create Session", icon: "fa-plus-circle" },
  { to: "/mentor/my-sessions", label: "My Sessions", icon: "fa-chalkboard-teacher" },
  { to: "/mentor/availability", label: "Availability", icon: "fa-clock" },
  { to: "/mentor/bookings", label: "Bookings", icon: "fa-calendar-check" },
  { to: "/mentor/learners", label: "Learners", icon: "fa-users" },
  { to: "/mentor/reviews", label: "Reviews", icon: "fa-star" },
];

const MentorSidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    showToast.success("Logged out successfully");
    navigate("/", { replace: true });
  };

  return (
    <aside className="learner-sidebar">
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

      <nav className="p-3 flex-grow-1">
        {links.map((link) => (
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
          </NavLink>
        ))}
      </nav>

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
