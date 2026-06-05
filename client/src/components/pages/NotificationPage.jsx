import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TopBar from "../layout/user/TopBar";
import Apiservices from "../../../Apiservices";
import { LoadingState } from "../learner/LearnerUI";
import { useSocket } from "../../context/SocketContext";
import { timeAgo } from "../../utils/timeUtils";

const typeIcons = {
  follow: "fa-user-plus", booking_request: "fa-calendar-plus", booking_accepted: "fa-check-circle",
  booking_completed: "fa-flag-checkered", new_review: "fa-star", badge_earned: "fa-trophy",
};

const typeColors = {
  follow: "#16a34a", booking_request: "#0d6efd", booking_accepted: "#16a34a",
  booking_completed: "#7c3aed", new_review: "#f59e0b", badge_earned: "#eab308",
};

const NotificationPage = () => {
  const { refreshUnreadCount } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const load = async (pageNum = 1, append = false) => {
    setLoading(true);
    try {
      const res = await Apiservices.getNotifications({ page: pageNum, limit: 20 });
      const data = res.data.data || [];
      setNotifications(append ? (prev) => [...prev, ...data] : data);
      setPagination(res.data.pagination || null);
    } catch {
      if (!append) setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    await Apiservices.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    refreshUnreadCount();
  };

  const markRead = async (id) => {
    await Apiservices.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    refreshUnreadCount();
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    load(next, true);
  };

  return (
    <>
      <TopBar />
      <div className="bg-image" style={{ minHeight: "calc(100vh - 64px)" }}>
        <div className="container py-4" style={{ maxWidth: 720 }}>
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h4 className="fw-bold mb-0">Notifications</h4>
            <button className="btn btn-sm btn-outline-primary rounded-pill fw-semibold px-4" onClick={markAllRead}>
              <i className="fa fa-check-double me-2" />Mark All Read
            </button>
          </div>

          {loading && notifications.length === 0 ? (
            <LoadingState />
          ) : notifications.length === 0 ? (
            <div className="text-center py-5">
              <div style={{ width: 64, height: 64, borderRadius: 16, margin: "0 auto 16px", background: "#f1f5f9", display: "grid", placeItems: "center" }}>
                <i className="fa fa-bell" style={{ color: "#94a3b8", fontSize: "1.5rem" }} />
              </div>
              <h5 className="fw-bold mb-2">No notifications</h5>
              <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>You're all caught up!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {notifications.map((n) => (
                <div key={n._id} style={{
                  display: "flex", alignItems: "flex-start", gap: 14,
                  padding: "14px 18px", borderRadius: 14,
                  background: n.read ? "#fff" : "#f8faff",
                  border: n.read ? "1px solid #eef2f7" : "1px solid #dbeafe",
                  cursor: "pointer", transition: "all 0.15s",
                }}
                  onClick={() => !n.read && markRead(n._id)}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)"}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 12, flexShrink: 0, overflow: "hidden",
                    background: n.type === "system" ? "#0d6efd" : `${typeColors[n.type] || "#64748b"}15`,
                    display: "grid", placeItems: "center", color: typeColors[n.type] || "#64748b", fontSize: "0.85rem",
                  }}>
                    {n.type === "system" ? (
                      <div style={{
                        width: "100%", height: "100%",
                        background: "linear-gradient(135deg, #0d6efd, #6610f2)",
                        display: "grid", placeItems: "center",
                      }}>
                        <i className="fa fa-book-reader" style={{ color: "#fff", fontSize: "0.95rem" }} />
                      </div>
                    ) : n.actor?.profileImage ? (
                      <img src={n.actor.profileImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : n.actor?.name ? (
                      <span style={{ fontWeight: 700, fontSize: "0.75rem" }}>{n.actor.name.charAt(0).toUpperCase()}</span>
                    ) : (
                      <i className={`fa ${typeIcons[n.type] || "fa-bell"}`} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.85rem", lineHeight: 1.4, color: "#1e293b", fontWeight: n.read ? 400 : 600 }}>{n.message}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                      <small style={{ fontSize: "0.65rem", color: "#94a3b8" }}>{timeAgo(n.createdAt)}</small>
                      {n.link && (
                        <Link to={n.link} style={{ fontSize: "0.7rem", color: "#0d6efd", textDecoration: "none", fontWeight: 600 }}
                          onClick={(e) => e.stopPropagation()}>
                          View →
                        </Link>
                      )}
                    </div>
                  </div>
                  {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0d6efd", flexShrink: 0, marginTop: 4 }} />}
                </div>
              ))}
            </div>
          )}

          {pagination && page < pagination.pages && (
            <div className="text-center mt-4">
              <button className="btn btn-outline-primary rounded-pill px-5 fw-semibold" onClick={loadMore} disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm" /> : "Load More"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPage;
