import React from "react";
import { Link } from "react-router-dom";

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const eventConfig = {
  session_created: { icon: "fa-video", color: "#0d6efd", bg: "#e8f4fd", label: "Created a session" },
  badge_earned: { icon: "fa-trophy", color: "#eab308", bg: "#fef9e7", label: "Earned a badge" },
  review_written: { icon: "fa-star", color: "#f59e0b", bg: "#fffbeb", label: "Wrote a review" },
  started_following: { icon: "fa-user-plus", color: "#16a34a", bg: "#f0fdf4", label: "Started following" },
  level_up: { icon: "fa-bolt", color: "#7c3aed", bg: "#f5f3ff", label: "Leveled up" },
};

const FeedCard = ({ event }) => {
  const cfg = eventConfig[event.type] || eventConfig.level_up;
  const actor = event.actor || {};
  const meta = event.metadata || {};

  return (
    <div style={{
      background: "#fff", borderRadius: 16, padding: "16px 20px",
      border: "1px solid #eef2f7", transition: "box-shadow 0.2s",
    }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)"}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <Link to={`/profile/${actor._id}`} style={{ flexShrink: 0 }}>
          <img
            src={actor.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(actor.name || "?")}&background=0d6efd&color=fff&size=44`}
            alt="" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }}
          />
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
            <div>
              <Link to={`/profile/${actor._id}`} style={{ color: "inherit", textDecoration: "none", fontWeight: 600, fontSize: "0.9rem" }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}>
                {actor.name || "Unknown"}
              </Link>
              <span style={{ color: "#64748b", fontSize: "0.85rem", marginLeft: 6 }}>{cfg.label}</span>
            </div>
            <span style={{ color: "#94a3b8", fontSize: "0.7rem", whiteSpace: "nowrap", flexShrink: 0 }}>{timeAgo(event.createdAt)}</span>
          </div>

          {event.type === "session_created" && meta.title && (
            <div style={{ marginTop: 8, padding: "10px 14px", background: "#f8fafc", borderRadius: 12, fontSize: "0.85rem" }}>
              <i className="fa fa-video me-2" style={{ color: cfg.color }} />{meta.title}
              {meta.skillName && <span style={{ color: "#94a3b8", marginLeft: 8, fontSize: "0.75rem" }}>in {meta.skillName}</span>}
            </div>
          )}

          {event.type === "badge_earned" && meta.badgeName && (
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#f8fafc", borderRadius: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `${meta.badgeColor || cfg.color}18`, display: "grid", placeItems: "center", color: meta.badgeColor || cfg.color, fontSize: "0.85rem" }}>
                <i className={`fa ${meta.badgeIcon || "fa-trophy"}`} />
              </div>
              <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{meta.badgeName}</span>
            </div>
          )}

          {event.type === "review_written" && (
            <div style={{ marginTop: 8, padding: "10px 14px", background: "#f8fafc", borderRadius: 12, fontSize: "0.85rem" }}>
              {meta.sessionTitle && <span>{meta.sessionTitle}</span>}
              {meta.rating && (
                <span style={{ marginLeft: 8, color: "#f59e0b" }}>
                  {"★".repeat(meta.rating)}{"☆".repeat(5 - meta.rating)}
                </span>
              )}
            </div>
          )}

          {event.type === "started_following" && meta.targetName && (
            <div style={{ marginTop: 8, fontSize: "0.85rem", color: "#64748b" }}>
              <i className="fa fa-arrow-right me-2" style={{ color: cfg.color, fontSize: "0.7rem" }} />{meta.targetName}
            </div>
          )}

          {event.type === "level_up" && meta.level && (
            <div style={{ marginTop: 8, padding: "10px 14px", background: "#f8fafc", borderRadius: 12, fontSize: "0.85rem" }}>
              <span style={{ fontWeight: 700, color: cfg.color }}>Level {meta.level}</span>
              {meta.xp && <span style={{ color: "#94a3b8", marginLeft: 8 }}>— {meta.xp.toLocaleString()} XP</span>}
            </div>
          )}

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8,
            width: 28, height: 28, borderRadius: 8, background: cfg.bg, justifyContent: "center",
          }}>
            <i className={`fa ${cfg.icon}`} style={{ color: cfg.color, fontSize: "0.65rem" }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedCard;
