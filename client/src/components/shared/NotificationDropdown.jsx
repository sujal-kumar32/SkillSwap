import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { timeAgo } from "../../utils/timeUtils";

const typeIcons = {
  follow: "fa-user-plus",
  booking_request: "fa-calendar-plus",
  booking_accepted: "fa-check-circle",
  booking_completed: "fa-flag-checkered",
  new_review: "fa-star",
  badge_earned: "fa-trophy",
};

const typeColors = {
  follow: "#16a34a",
  booking_request: "#0d6efd",
  booking_accepted: "#16a34a",
  booking_completed: "#7c3aed",
  new_review: "#f59e0b",
  badge_earned: "#eab308",
};

const NotificationDropdown = ({ onClose }) => {
  const { latestNotifications, refreshNotifications } = useSocket();

  useEffect(() => {
    refreshNotifications();
  }, []);

  return (
    <div style={{
      position: "absolute", top: "100%", right: 0, marginTop: 8, zIndex: 9999,
      background: "#fff", borderRadius: 16, width: 380,
      boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      border: "1px solid #eef2f7", overflow: "hidden",
    }}>
      <div style={{
        padding: "16px 20px", borderBottom: "1px solid #eef2f7",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <h6 className="fw-bold mb-0">Notifications</h6>
        <Link to="/notifications" onClick={onClose} style={{ fontSize: "0.8rem", color: "#0d6efd", textDecoration: "none", fontWeight: 600 }}>
          View All
        </Link>
      </div>

      <div style={{ maxHeight: 400, overflow: "auto" }}>
        {latestNotifications.length === 0 ? (
          <div className="text-center py-4" style={{ color: "#94a3b8" }}>
            <i className="fa fa-bell" style={{ fontSize: "1.5rem", display: "block", marginBottom: 8 }} />
            <small>No new notifications</small>
          </div>
        ) : (
          latestNotifications.map((n) => (
            <Link key={n._id} to={n.link || "#"} onClick={onClose} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "12px 20px", transition: "background 0.15s",
                borderBottom: "1px solid #f8fafc",
              }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0, overflow: "hidden",
                  background: `${typeColors[n.type] || "#64748b"}15`,
                  display: "grid", placeItems: "center", color: typeColors[n.type] || "#64748b", fontSize: "0.8rem",
                }}>
                  {n.actor?.profileImage ? (
                    <img src={n.actor.profileImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : n.actor?.name ? (
                    <span style={{ fontWeight: 700, fontSize: "0.7rem" }}>{n.actor.name.charAt(0).toUpperCase()}</span>
                  ) : (
                    <i className={`fa ${typeIcons[n.type] || "fa-bell"}`} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.82rem", lineHeight: 1.4, color: "#1e293b" }}>{n.message}</div>
                  <small style={{ fontSize: "0.65rem", color: "#94a3b8" }}>{timeAgo(n.createdAt)}</small>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
