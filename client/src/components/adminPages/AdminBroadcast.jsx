import React, { useState } from "react";
import { showToast } from "../../utils/toastUtils";
import Apiservices from "../../../Apiservices";

const AdminBroadcast = () => {
  const [message, setMessage] = useState("");
  const [role, setRole] = useState("");
  const [link, setLink] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await Apiservices.broadcastNotification({ message: message.trim(), role: role || undefined, link: link.trim() || undefined });
      showToast.success(res.data.message || "Notification sent");
      setMessage("");
      setLink("");
    } catch {
      showToast.error("Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  const audienceLabel = role === "learner" ? "Learners" : role === "mentor" ? "Mentors" : "All Users";

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <div className="mb-3">
        <h4 className="fw-bold mb-1" style={{ fontSize: "1.25rem" }}>Broadcast Notification</h4>
        <p className="text-muted small mb-0">Send a system-wide announcement to all users or filter by role.</p>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #eef2f7", padding: 28 }}>
        <form onSubmit={handleSend}>
          <div className="mb-4">
            <label className="form-label fw-semibold small" style={{ color: "#1e293b", fontSize: "0.8rem", marginBottom: 6 }}>
              <i className="fa fa-users me-1" style={{ color: "#64748b" }} /> Target Audience
            </label>
            <div className="d-flex gap-2 flex-wrap">
              {["", "learner", "mentor"].map((r) => (
                <button key={r} type="button" onClick={() => setRole(r)}
                  style={{
                    padding: "8px 18px", borderRadius: 10, border: `2px solid ${role === r ? "#0d6efd" : "#e2e8f0"}`,
                    background: role === r ? "#eef2ff" : "#fff", color: role === r ? "#0d6efd" : "#64748b",
                    fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", transition: "all 0.15s",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                  <i className={`fa ${r === "" ? "fa-globe" : r === "learner" ? "fa-graduation-cap" : "fa-chalkboard-teacher"}`} />
                  {r === "" ? "All Users" : r === "learner" ? "Learners Only" : "Mentors Only"}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold small" style={{ color: "#1e293b", fontSize: "0.8rem", marginBottom: 6 }}>
              <i className="fa fa-comment me-1" style={{ color: "#64748b" }} /> Message
            </label>
            <textarea
              className="form-control"
              rows={5}
              placeholder="Write your announcement message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              style={{
                fontSize: "0.85rem", resize: "vertical", borderRadius: 10,
                borderColor: "#e2e8f0", padding: "12px 14px",
              }}
            />
            <div className="d-flex justify-content-between mt-1">
              <small className="text-muted" style={{ fontSize: "0.7rem" }}>Maximum 500 characters</small>
              <small style={{ fontSize: "0.7rem", fontWeight: 600, color: message.length > 450 ? "#ef4444" : "#94a3b8" }}>{message.length}/500</small>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold small" style={{ color: "#1e293b", fontSize: "0.8rem", marginBottom: 6 }}>
              <i className="fa fa-link me-1" style={{ color: "#64748b" }} /> Link (optional)
            </label>
            <input
              className="form-control"
              placeholder="/profile or https://..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              style={{ fontSize: "0.85rem", borderRadius: 10, borderColor: "#e2e8f0", padding: "10px 14px" }}
            />
            <small className="text-muted" style={{ fontSize: "0.7rem" }}>Users will be able to tap the notification to open this link</small>
          </div>

          <div style={{ background: "#f8fafc", borderRadius: 10, padding: 16, marginBottom: 24 }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="fa fa-eye" style={{ color: "#64748b", fontSize: "0.75rem" }} />
              <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.3px" }}>Preview</span>
            </div>
            <div style={{
              background: "#fff", borderRadius: 10, border: "1px solid #eef2f7", padding: "14px 16px",
              display: "flex", alignItems: "flex-start", gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "linear-gradient(135deg, #0d6efd, #6610f2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: "0.8rem", flexShrink: 0,
              }}>
                <i className="fa fa-bullhorn" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "#1e293b" }}>System Announcement</div>
                <div style={{ fontSize: "0.82rem", color: message.trim() ? "#1e293b" : "#94a3b8", marginTop: 2 }}>
                  {message.trim() || "Your message will appear here..."}
                </div>
                {link.trim() && (
                  <div style={{ fontSize: "0.7rem", color: "#0d6efd", marginTop: 4 }}>
                    <i className="fa fa-external-link-alt me-1" style={{ fontSize: "0.6rem" }} />{link.trim()}
                  </div>
                )}
              </div>
              <span style={{ fontSize: "0.62rem", color: "#94a3b8", whiteSpace: "nowrap" }}>Just now</span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <button className="btn fw-semibold" type="submit" disabled={sending || !message.trim()}
              style={{
                background: sending || !message.trim() ? "#e2e8f0" : "linear-gradient(135deg, #0d6efd, #6610f2)",
                color: sending || !message.trim() ? "#94a3b8" : "#fff", border: "none",
                padding: "10px 28px", borderRadius: 10, fontSize: "0.85rem",
                display: "flex", alignItems: "center", gap: 8, cursor: sending || !message.trim() ? "not-allowed" : "pointer",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => { if (!sending && message.trim()) e.target.style.opacity = "0.9"; }}
              onMouseLeave={(e) => { e.target.style.opacity = "1"; }}>
              {sending ? <><span className="spinner-border spinner-border-sm" style={{ width: 16, height: 16 }} /> Sending to {audienceLabel}...</>
                : <><i className="fa fa-paper-plane" /> Send to {audienceLabel}</>}
            </button>
            {role && (
              <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                <i className="fa fa-info-circle me-1" />Only active {role} accounts will receive this
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminBroadcast;
