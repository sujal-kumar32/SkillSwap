import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { showToast } from "../../../utils/toastUtils";

const links = [
  { to: "/admin", label: "Dashboard", icon: "fa-gauge-high", end: true },
  { to: "/admin/manage-users", label: "Manage Users", icon: "fa-users-gear" },
  { to: "/admin/categories", label: "Categories", icon: "fa-tags" },
  { to: "/admin/skill-approval", label: "Skill Approval", icon: "fa-clipboard-check" },
  { to: "/admin/manage-paid-sessions", label: "Manage Sessions", icon: "fa-video" },
  { to: "/admin/view-requests", label: "View Requests", icon: "fa-envelope" },
  { to: "/admin/bookings", label: "All Bookings", icon: "fa-calendar" },
  { to: "/admin/reviews", label: "Reviews & Ratings", icon: "fa-star" },
  { to: "/admin/progress", label: "Learner Progress", icon: "fa-chart-line" },
  { to: "/admin/settings", label: "Settings", icon: "fa-gear" },
];

const AdminSidebar = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("roles");
    window.dispatchEvent(new Event("authChange"));
    showToast.success("Logged out successfully");
    navigate("/", { replace: true });
  };

  return (
    <aside className="admin-sidebar">
      <div className="p-4 border-bottom" style={{ borderColor: "rgba(0,0,0,0.04)" }}>
        <Link to="/" className="text-decoration-none">
          <div className="d-flex align-items-center gap-2">
            <div className="admin-brand-icon">
              <i className="fa fa-shield-halved" />
            </div>
            <div>
              <h5 className="fw-bold mb-0" style={{ color: "#1e293b" }}>SkillSwap</h5>
              <small style={{ color: "#94a3b8", fontSize: "0.75rem" }}>Admin Panel</small>
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
              `admin-nav-link ${isActive ? "active" : ""}`
            }
          >
            <i className={`fa ${link.icon}`} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3" style={{ borderTop: "1px solid rgba(0,0,0,0.04)" }}>
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

export default AdminSidebar;
