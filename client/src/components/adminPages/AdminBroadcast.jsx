import React, { useState, useEffect, useCallback } from "react";
import { showToast } from "../../utils/toastUtils";
import Apiservices from "../../../Apiservices";

const ic = { marginRight: "5px" };

const AUDIENCE_OPTIONS = [
  { value: "all", label: "All Users", icon: "fa-globe", desc: "Every active account" },
  { value: "role", label: "By Role", icon: "fa-users", desc: "Learners or mentors" },
  { value: "single", label: "Specific User", icon: "fa-user", desc: "Send to one person" },
];

const buildPayload = (message, link, targetType, targetRole, targetUserId) => {
  const payload = { message: message.trim(), targetType, link: link.trim() || undefined };
  if (targetType === "role") payload.targetRole = targetRole;
  if (targetType === "single") payload.targetUserId = targetUserId;
  return payload;
};

const UserSearchDropdown = ({ results, onSelect }) => {
  if (!results.length) return null;
  return (
    <div style={{
      position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10,
      background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, marginTop: 4,
      boxShadow: "0 10px 30px rgba(0,0,0,0.08)", overflow: "hidden",
    }}>
      {results.map((u) => (
        <button key={u._id} type="button" onClick={() => onSelect(u)}
          style={{
            display: "flex", alignItems: "center", gap: "5px", width: "100%", padding: "10px 14px",
            border: "none", background: "#fff", cursor: "pointer", fontSize: "0.82rem",
            textAlign: "left", borderBottom: "1px solid #f1f5f9",
          }}
          onMouseEnter={(e) => e.target.style.background = "#f8fafc"}
          onMouseLeave={(e) => e.target.style.background = "#fff"}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "linear-gradient(135deg, #0d6efd, #6610f2)",
            display: "grid", placeItems: "center", color: "#fff",
            fontSize: "0.65rem", fontWeight: 700, flexShrink: 0,
          }}>
            {u.name?.charAt(0).toUpperCase() || "?"}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.8rem" }}>{u.name}</div>
            <div style={{ fontSize: "0.68rem", color: "#94a3b8" }}>{u.email}</div>
          </div>
        </button>
      ))}
    </div>
  );
};

const BroadcastRow = ({ b, deleting, onEdit, onDelete }) => {
  const audienceLabel = b.targetType === "single"
    ? (b.targetUserId?.name || "User")
    : b.targetType === "role"
      ? (b.targetRole === "mentor" ? "Mentors" : "Learners")
      : "Everyone";
  const badgeBg = b.targetType === "single" ? "#ede9fe"
    : b.targetType === "role" ? "#dbeafe"
    : "#f0fdf4";
  const badgeColor = b.targetType === "single" ? "#7c3aed"
    : b.targetType === "role" ? "#2563eb"
    : "#16a34a";

  return (
    <tr style={{ borderBottom: "12px solid #f1f5f9" }}>
      <td>
        <div className="d-flex align-items-center" style={{ gap: "5px" }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: "linear-gradient(135deg, #0d6efd, #6610f2)",
            display: "grid", placeItems: "center", color: "#fff", fontSize: "0.8rem",
          }}>
            <i className="fa fa-bullhorn" />
          </div>
          <span style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.85rem", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {b.message}
          </span>
        </div>
      </td>
      <td>
        <span style={{ background: badgeBg, color: badgeColor, padding: "4px 14px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600, whiteSpace: "nowrap" }}>
          {audienceLabel}
        </span>
      </td>
      <td style={{ fontWeight: 600, fontSize: "0.85rem" }}>{b.recipientCount || 0}</td>
      <td>
        {b.link ? (
          <span style={{ color: "#0d6efd", fontSize: "0.8rem", wordBreak: "break-all" }}>
            <i className="fa fa-link" style={{ ...ic, fontSize: "0.7rem" }} />
            {b.link.length > 30 ? b.link.substring(0, 30) + "..." : b.link}
          </span>
        ) : (
          <span className="text-muted" style={{ fontSize: "0.8rem" }}>—</span>
        )}
      </td>
      <td style={{ color: "#64748b", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
        {new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        <br /><small>{new Date(b.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</small>
      </td>
      <td className="text-end">
        <div className="d-flex justify-content-end" style={{ gap: "5px" }}>
          <button onClick={() => onEdit(b)}
            className="btn btn-sm btn-outline-primary rounded-pill fw-semibold px-3 py-2"
            style={{ fontSize: "0.75rem" }}>
            <i className="fa fa-pen" style={ic} />Edit
          </button>
          <button onClick={() => onDelete(b._id)} disabled={deleting === b._id}
            className="btn btn-sm btn-outline-dark rounded-pill fw-semibold px-3 py-2"
            style={{ fontSize: "0.75rem" }}>
            {deleting === b._id ? <span className="spinner-border spinner-border-sm" /> : <><i className="fa fa-trash" style={ic} />Delete</>}
          </button>
        </div>
      </td>
    </tr>
  );
};

const BroadcastTableBody = ({ loading, broadcasts, deleting, onEdit, onDelete }) => {
  if (loading) return (
    <tr><td colSpan={6} className="text-center py-4 text-muted"><span className="spinner-border spinner-border-sm" style={ic} />Loading...</td></tr>
  );
  if (!broadcasts.length) return (
    <tr><td colSpan={6} className="text-center py-4 text-muted">No broadcasts sent yet</td></tr>
  );
  return broadcasts.map((b) => (
    <BroadcastRow key={b._id} b={b} deleting={deleting} onEdit={onEdit} onDelete={onDelete} />
  ));
};

const AdminBroadcast = () => {
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [targetType, setTargetType] = useState("all");
  const [targetRole, setTargetRole] = useState("");
  const [targetUserId, setTargetUserId] = useState("");
  const [targetUserName, setTargetUserName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const fetchBroadcasts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await Apiservices.getBroadcasts({ page: 1, limit: 50 });
      setBroadcasts(res.data.data || []);
    } catch {
      // fetch failed silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBroadcasts(); }, [fetchBroadcasts]);

  useEffect(() => {
    if (!searchQuery.trim() || targetType !== "single") { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await Apiservices.searchUsers(searchQuery);
        setSearchResults(res.data?.data || []);
      } catch { setSearchResults([]); }
      finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, targetType]);

  const selectUser = (user) => {
    setTargetUserId(user._id);
    setTargetUserName(`${user.name} (${user.email})`);
    setSearchQuery("");
    setSearchResults([]);
  };

  const resetForm = () => {
    setMessage(""); setLink(""); setTargetRole(""); setTargetUserId(""); setTargetUserName(""); setTargetType("all"); setEditingId(null);
  };

  const handleEdit = (b) => {
    setEditingId(b._id);
    setMessage(b.message);
    setLink(b.link || "");
    setTargetType(b.targetType);
    setTargetRole(b.targetType === "role" ? (b.targetRole || "") : "");
    if (b.targetType === "single" && b.targetUserId) {
      setTargetUserId(b.targetUserId._id || b.targetUserId);
      setTargetUserName(b.targetUserId.name ? `${b.targetUserId.name} (${b.targetUserId.email})` : "User");
    } else {
      setTargetUserId("");
      setTargetUserName("");
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || (targetType === "single" && !targetUserId) || (targetType === "role" && !targetRole)) return;
    setSending(true);
    try {
      const payload = buildPayload(message, link, targetType, targetRole, targetUserId);

      if (editingId) {
        const res = await Apiservices.updateBroadcast(editingId, payload);
        showToast.success(res.data.message || "Broadcast updated");
      } else {
        const res = await Apiservices.broadcastNotification(payload);
        showToast.success(res.data.message || "Broadcast sent");
      }
      resetForm();
      fetchBroadcasts();
    } catch { showToast.error(editingId ? "Failed to update" : "Failed to send"); }
    finally { setSending(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this broadcast?")) return;
    setDeleting(id);
    try {
      await Apiservices.deleteBroadcast(id);
      setBroadcasts((prev) => prev.filter((b) => b._id !== id));
      showToast.success("Broadcast deleted");
    } catch { showToast.error("Failed to delete"); }
    finally { setDeleting(null); }
  };

  const totalRecipients = broadcasts.reduce((sum, b) => sum + (b.recipientCount || 0), 0);
  const canSend = message.trim() && !sending && (targetType !== "single" || targetUserId) && (targetType !== "role" || targetRole);

  return (
    <>
      <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-4">
        <div>
          <h1 className="fw-bold mb-1">Broadcast Center</h1>
          <p className="text-muted mb-0">Send system notifications to users.</p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="learner-card p-4 h-100">
            <h3 className="fw-bold mb-0">{broadcasts.length}</h3>
            <p className="text-muted mb-0 small">Total Broadcasts</p>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="learner-card p-4 h-100">
            <h3 className="fw-bold mb-0 text-primary">{totalRecipients}</h3>
            <p className="text-muted mb-0 small">Total Recipients</p>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="learner-card p-4 h-100">
            <h3 className="fw-bold mb-0 text-info">{broadcasts.filter((b) => b.targetType === "all").length}</h3>
            <p className="text-muted mb-0 small">System Wide</p>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="learner-card p-4 h-100">
            <h3 className="fw-bold mb-0 text-success">
              {broadcasts.length > 0
                ? new Date(broadcasts[0].createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "—"}
            </h3>
            <p className="text-muted mb-0 small">Latest</p>
          </div>
        </div>
      </div>

      <div className="learner-card p-4 mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3 pb-3" style={{ borderBottom: "1px solid #f1f5f9", gap: "5px" }}>
          <div className="d-flex align-items-center" style={{ gap: "5px" }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #0d6efd, #6610f2)",
              display: "grid", placeItems: "center", color: "#fff", fontSize: "0.85rem", flexShrink: 0,
            }}>
              <i className={editingId ? "fa fa-pen" : "fa fa-pen-fancy"} />
            </div>
            <div>
              <h6 className="fw-bold mb-0">{editingId ? "Edit Broadcast" : "Compose Broadcast"}</h6>
              <small style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                {editingId ? "Update the announcement and re-send" : "Craft and send a system announcement"}
              </small>
            </div>
          </div>
          {editingId && (
            <button type="button" onClick={resetForm}
              style={{
                padding: "6px 14px", borderRadius: 8, border: "1px solid #e2e8f0",
                background: "#fff", color: "#64748b", fontWeight: 600, fontSize: "0.75rem",
                cursor: "pointer",
              }}>
              <i className="fa fa-times" style={ic} />Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSend}>
          <div className="mb-3">
            <label className="fw-semibold mb-2" style={{ fontSize: "0.8rem", color: "#374151" }}>
              <i className="fa fa-bullseye" style={{ ...ic, fontSize: "0.75rem" }} />AUDIENCE
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "5px" }}>
              {AUDIENCE_OPTIONS.map((opt) => (
                <button key={opt.value} type="button"
                  onClick={() => { setTargetType(opt.value); setTargetRole(""); setTargetUserId(""); setTargetUserName(""); }}
                  style={{
                    padding: "14px 12px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                    border: `1.5px solid ${targetType === opt.value ? "#0d6efd" : "#eef2f7"}`,
                    background: targetType === opt.value ? "#f8faff" : "#fff",
                    transition: "all 0.15s",
                  }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: targetType === opt.value ? "linear-gradient(135deg, #0d6efd, #6610f2)" : "#f1f5f9",
                    display: "grid", placeItems: "center",
                    color: targetType === opt.value ? "#fff" : "#64748b",
                    fontSize: "0.7rem", marginBottom: 8,
                  }}>
                    <i className={`fa ${opt.icon}`} />
                  </div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1e293b", marginBottom: 2 }}>{opt.label}</div>
                  <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {targetType === "role" && (
            <div className="learner-card p-3 mb-3" style={{ background: "#f8faff" }}>
              <label className="fw-semibold mb-2" style={{ fontSize: "0.78rem", color: "#374151" }}>
                <i className="fa fa-user-tag" style={{ ...ic, fontSize: "0.7rem" }} />SELECT ROLE
              </label>
              <div style={{ display: "flex", gap: "5px" }}>
                {["learner", "mentor"].map((r) => (
                  <button key={r} type="button" onClick={() => setTargetRole(r)}
                    style={{
                      flex: 1, padding: "12px", borderRadius: 10, cursor: "pointer",
                      border: `1.5px solid ${targetRole === r ? "#0d6efd" : "#e2e8f0"}`,
                      background: targetRole === r ? "#fff" : "transparent",
                      fontWeight: 600, fontSize: "0.82rem", color: targetRole === r ? "#0d6efd" : "#64748b",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
                    }}>
                    <i className={`fa ${r === "learner" ? "fa-graduation-cap" : "fa-chalkboard-teacher"}`} />
                    {r === "learner" ? "Learners" : "Mentors"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {targetType === "single" && (
            <div className="learner-card p-3 mb-3" style={{ background: "#f8faff" }}>
              <label className="fw-semibold mb-2" style={{ fontSize: "0.78rem", color: "#374151" }}>
                <i className="fa fa-search" style={{ ...ic, fontSize: "0.7rem" }} />SEARCH USER
              </label>
              {targetUserName ? (
                <div style={{
                  display: "flex", alignItems: "center", gap: "5px", padding: "10px 14px",
                  background: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0",
                }}>
                  <i className="fa fa-check-circle" style={{ color: "#16a34a", fontSize: "0.85rem" }} />
                  <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "#1e293b", flex: 1 }}>{targetUserName}</span>
                  <button type="button" onClick={() => { setTargetUserId(""); setTargetUserName(""); }}
                    style={{
                      background: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "4px 12px",
                      fontSize: "0.72rem", color: "#64748b", cursor: "pointer", fontWeight: 600,
                    }}>Change</button>
                </div>
              ) : (
                <div style={{ position: "relative" }}>
                  <input type="search" className="form-control" placeholder="Type name or email..."
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
                      padding: "10px 14px", fontSize: "0.82rem",
                    }} />
                  {searching && <span className="spinner-border spinner-border-sm" style={{ position: "absolute", right: 12, top: 11 }} />}
                  <UserSearchDropdown results={searchResults} onSelect={selectUser} />
                </div>
              )}
            </div>
          )}

          <div className="row g-3 mb-3">
            <div className="col-6">
              <label className="fw-semibold mb-1" style={{ fontSize: "0.8rem", color: "#374151" }}>
                <i className="fa fa-link" style={{ ...ic, fontSize: "0.7rem" }} />LINK
                <span className="text-muted fw-normal" style={{ fontSize: "0.72rem" }}> (optional)</span>
              </label>
              <input type="text" className="form-control" placeholder="/profile or https://..."
                value={link} onChange={(e) => setLink(e.target.value)}
                style={{
                  background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
                  padding: "10px 14px", fontSize: "0.82rem",
                }} />
            </div>
            <div className="col-6">
              <label className="fw-semibold mb-1" style={{ fontSize: "0.8rem", color: "#374151" }}>
                <i className="fa fa-file-alt" style={{ ...ic, fontSize: "0.7rem" }} />MESSAGE
              </label>
              <textarea className="form-control" rows={3} placeholder="Write your announcement..."
                value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500}
                style={{
                  background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
                  padding: "10px 14px", fontSize: "0.82rem", resize: "vertical",
                }} />
              <div className="d-flex justify-content-end mt-1">
                <small className={message.length > 450 ? "text-danger fw-semibold" : "text-muted"} style={{ fontSize: "0.68rem" }}>
                  {message.length}/500
                </small>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "5px" }}>
            <button type="submit" disabled={!canSend}
              style={{
                padding: "10px 24px", borderRadius: 10, border: "none", cursor: !canSend ? "not-allowed" : "pointer",
                background: !canSend ? "#e2e8f0" : "linear-gradient(135deg, #0d6efd, #6610f2)",
                color: !canSend ? "#94a3b8" : "#fff", fontWeight: 600, fontSize: "0.82rem",
                display: "flex", alignItems: "center", gap: "5px",
              }}>
              {sending ? <><span className="spinner-border spinner-border-sm" /> {editingId ? "Updating..." : "Sending..."}</>
                : <><i className={`fa ${editingId ? "fa-save" : "fa-paper-plane"}`} /> {editingId ? "Update Broadcast" : "Send Broadcast"}</>}
            </button>
            {message.trim() && (
              <button type="button" onClick={resetForm}
                style={{
                  padding: "10px 24px", borderRadius: 10, border: "1px solid #e2e8f0",
                  background: "#fff", color: "#64748b", fontWeight: 600, fontSize: "0.82rem",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: "5px",
                }}>
                <i className={`fa ${editingId ? "fa-times" : "fa-times"}`} /> {editingId ? "Cancel" : "Clear"}
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="learner-card p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="fw-bold mb-0">
            <i className="fa fa-history" style={{ ...ic, color: "#64748b" }} />Broadcast History
          </h5>
          <button onClick={fetchBroadcasts} className="btn btn-sm btn-outline-secondary rounded-pill fw-semibold px-3 py-2" style={{ fontSize: "0.8rem" }}>
            <i className="fa fa-refresh" style={ic} />Refresh
          </button>
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Message</th>
                <th>Audience</th>
                <th>Recipients</th>
                <th>Link</th>
                <th>Date</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <BroadcastTableBody loading={loading} broadcasts={broadcasts} deleting={deleting} onEdit={handleEdit} onDelete={handleDelete} />
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminBroadcast;
