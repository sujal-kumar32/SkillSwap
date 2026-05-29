import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { showToast } from "../../../utils/toastUtils";
import { useAuth } from "../../../App";
import { useSocket } from "../../../context/SocketContext";

const links = [
  { to: "/admin", label: "Dashboard", icon: "fa-tachometer-alt", end: true },
  { to: "/admin/manage-users", label: "Manage Users", icon: "fa-users-cog" },
  { to: "/admin/mentor-requests", label: "Mentors", icon: "fa-handshake" },
  { to: "/admin/progress", label: "Learner Progress", icon: "fa-chart-line" },
  { to: "/admin/categories", label: "Categories", icon: "fa-tags" },
  { to: "/admin/add-skill", label: "Add Skill", icon: "fa-plus-circle" },
  { to: "/admin/skill-approval", label: "Skill Approval", icon: "fa-clipboard-check" },
  { to: "/admin/manage-paid-sessions", label: "Manage Sessions", icon: "fa-video" },
  { to: "/admin/view-requests", label: "View Requests", icon: "fa-envelope" },
  { to: "/admin/bookings", label: "All Bookings", icon: "fa-calendar" },
  { to: "/admin/disputes", label: "Disputes", icon: "fa-gavel" },
  { to: "/admin/payments", label: "Payment Ledger", icon: "fa-credit-card" },
  { to: "/admin/reviews", label: "Reviews & Ratings", icon: "fa-star" },
  { to: "/admin/broadcast", label: "Broadcast", icon: "fa-bullhorn" },
  { to: "/admin/settings", label: "Settings", icon: "fa-gear" },
];

const AdminSidebar = ({ sidebarOpen, onClose }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { unreadChatCount, unreadCount } = useSocket();

  const handleLogout = async () => {
    await logout();
    showToast.success("Logged out successfully");
    navigate("/", { replace: true });
  };

  const handleNav = () => { if (onClose) onClose(); };

  return (
    <aside className={`admin-sidebar${sidebarOpen ? " open" : ""}`}>
      <div className="p-4 border-bottom" style={{ borderColor: "rgba(0,0,0,0.04)" }}>
        <Link to="/" className="text-decoration-none">
          <div className="d-flex align-items-center gap-2">
            <div className="admin-brand-icon">
              <i className="fa fa-book-reader" />
            </div>
            <div>
              <h5 className="fw-bold mb-0" style={{ color: "#1e293b" }}>SkillSwap</h5>
              <small style={{ color: "#94a3b8", fontSize: "0.75rem" }}>Admin Panel</small>
            </div>
          </div>
        </Link>
      </div>

      <nav className="p-3 flex-grow-1" onClick={handleNav}>
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
        <div style={{ height: 1, background: "#eef2f7", margin: "8px 12px" }} />
        <NavLink to="/messages" className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}>
          <i className="fa fa-comment" />
          <span>Messages</span>
          {unreadChatCount > 0 && (
            <span style={{
              marginLeft: "auto", background: "#ef4444", color: "#fff", fontSize: "0.6rem", fontWeight: 700,
              padding: "1px 6px", borderRadius: 999, minWidth: 18, textAlign: "center",
            }}>
              {unreadChatCount > 99 ? "99+" : unreadChatCount}
            </span>
          )}
        </NavLink>
        <NavLink to="/notifications" className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}>
          <i className="fa fa-bell" />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span style={{
              marginLeft: "auto", background: "#ef4444", color: "#fff", fontSize: "0.6rem", fontWeight: 700,
              padding: "1px 6px", borderRadius: 999, minWidth: 18, textAlign: "center",
            }}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </NavLink>
      </nav>

      <div className="p-3" style={{ borderTop: "1px solid rgba(0,0,0,0.04)" }}>
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

export default AdminSidebar;
