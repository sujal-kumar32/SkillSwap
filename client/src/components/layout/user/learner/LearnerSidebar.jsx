import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";

const links = [
  { to: "/learner", label: "Dashboard", icon: "fa-gauge-high", end: true },
  { to: "/learner/explore", label: "Explore Sessions", icon: "fa-compass" },
  { to: "/learner/bookings", label: "My Bookings", icon: "fa-calendar-check" },
  { to: "/learner/progress", label: "Learning Progress", icon: "fa-chart-line" },
  { to: "/learner/reviews", label: "Reviews", icon: "fa-star" },
  { to: "/learner/profile", label: "Profile", icon: "fa-user" },
  { to: "/learner/history", label: "Booking History", icon: "fa-clock-rotate-left" },
  { to: "/learner/ai", label: "AI Recommendations", icon: "fa-wand-magic-sparkles" },
];

const LearnerSidebar = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("roles");
    window.dispatchEvent(new Event("authChange"));
    navigate("/", { replace: true });
  };

  return (
    <aside className="learner-sidebar">
      <div className="p-4 border-bottom" style={{ borderColor: "rgba(0,0,0,0.04)" }}>
        <Link to="/workspace" className="text-decoration-none">
          <div className="d-flex align-items-center gap-2">
            <div className="learner-brand-icon">
              <i className="fa fa-book-reader" />
            </div>
            <div>
              <h5 className="fw-bold mb-0" style={{ color: "#1e293b" }}>SkillSwap</h5>
              <small style={{ color: "#94a3b8", fontSize: "0.75rem" }}>Learner Studio</small>
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
          <i className="fa fa-exchange-alt me-2" />
          Switch Role
        </Link>
        <button
          className="btn w-100 rounded-pill fw-semibold"
          style={{ background: "transparent", color: "#ef4444", border: "1px solid #fee2e2", fontSize: "0.85rem" }}
          onClick={logout}
          onMouseEnter={(e) => { e.target.style.background = "#fef2f2"; }}
          onMouseLeave={(e) => { e.target.style.background = "transparent"; }}
        >
          <i className="fa fa-sign-out-alt me-2" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default LearnerSidebar;
