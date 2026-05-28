import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { showToast } from "../../../utils/toastUtils";
import { useAuth } from "../../../App";

const TopBar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const userName = user?.name || "User";

  const handleLogout = async () => {
    await logout();
    showToast.success("Logged out successfully");
    navigate("/", { replace: true });
  };

  const btnStyle = {
    background: "rgba(255,255,255,0.8)",
    color: "#475569",
    border: "1px solid rgba(0,0,0,0.04)",
    fontSize: "0.85rem",
    padding: "8px 18px",
    borderRadius: "12px",
    fontWeight: 600,
    transition: "all 0.2s",
    backdropFilter: "blur(8px)",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.75)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(0,0,0,0.04)",
      padding: "0 32px",
      height: 64,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 1000,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <Link to="/workspace" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #0d6efd, #6610f2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontSize: "1rem",
          }}>
            <i className="fa fa-book-reader" />
          </div>
          <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1e293b" }}>SkillSwap</span>
        </Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Link to="/workspace" style={btnStyle}
          onMouseEnter={(e) => { e.target.style.background = "#eef2ff"; e.target.style.color = "#0d6efd"; }}
          onMouseLeave={(e) => { e.target.style.background = "rgba(255,255,255,0.8)"; e.target.style.color = "#475569"; }}>
          <i className="fa fa-th-large" /> Workspace
        </Link>

        <button style={btnStyle}
          onMouseEnter={(e) => { e.target.style.background = "#eef2ff"; e.target.style.color = "#0d6efd"; }}
          onMouseLeave={(e) => { e.target.style.background = "rgba(255,255,255,0.8)"; e.target.style.color = "#475569"; }}>
          <i className="fa fa-bell" /> Notifications
          <span style={{
            background: "#ef4444", color: "white", fontSize: "0.65rem",
            fontWeight: 700, padding: "2px 7px", borderRadius: 999,
            marginLeft: 2, lineHeight: 1,
          }}>3</span>
        </button>

        <Link to="/feed" style={btnStyle}
          onMouseEnter={(e) => { e.target.style.background = "#eef2ff"; e.target.style.color = "#0d6efd"; }}
          onMouseLeave={(e) => { e.target.style.background = "rgba(255,255,255,0.8)"; e.target.style.color = "#475569"; }}>
          <i className="fa fa-stream" /> Feed
        </Link>

        <Link to="/leaderboard" style={btnStyle}
          onMouseEnter={(e) => { e.target.style.background = "#eef2ff"; e.target.style.color = "#0d6efd"; }}
          onMouseLeave={(e) => { e.target.style.background = "rgba(255,255,255,0.8)"; e.target.style.color = "#475569"; }}>
          <i className="fa fa-trophy" /> Leaderboard
        </Link>

        <Link to="/settings" style={btnStyle}
          onMouseEnter={(e) => { e.target.style.background = "#eef2ff"; e.target.style.color = "#0d6efd"; }}
          onMouseLeave={(e) => { e.target.style.background = "rgba(255,255,255,0.8)"; e.target.style.color = "#475569"; }}>
          <i className="fa fa-cog" /> Settings
        </Link>

        <div style={{ width: 1, height: 28, background: "#e5e7eb", margin: "0 8px" }} />

        <Link to="/profile" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg, #0d6efd, #6610f2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontSize: "0.75rem", fontWeight: 700,
          }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1e293b" }}>{userName}</span>
        </Link>

        <button onClick={handleLogout} style={{
          ...btnStyle,
          background: "rgba(254,242,242,0.8)",
          color: "#ef4444",
          border: "1px solid rgba(239,68,68,0.12)",
          cursor: "pointer",
        }}
          onMouseEnter={(e) => { e.target.style.background = "#fef2f2"; }}
          onMouseLeave={(e) => { e.target.style.background = "rgba(254,242,242,0.8)"; }}>
          <i className="fa fa-sign-out-alt" /> Logout
        </button>
      </div>
    </div>
  );
};

export default TopBar;
