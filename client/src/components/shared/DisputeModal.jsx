import React, { useState } from "react";
import { showToast } from "../../utils/toastUtils";
import Apiservices from "../../../Apiservices";

const REASONS = [
  { value: "refund_request", label: "Request a Refund", icon: "fa-credit-card" },
  { value: "session_issue", label: "Session Issue", icon: "fa-exclamation-triangle" },
  { value: "mentor_behavior", label: "Mentor Concern", icon: "fa-user" },
  { value: "learner_behavior", label: "Learner Concern", icon: "fa-user" },
  { value: "other", label: "Other", icon: "fa-ellipsis-h" },
];

const DisputeModal = ({ requestId, onClose, onCreated }) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason || !description.trim()) return;
    setSending(true);
    try {
      const res = await Apiservices.createDispute({ requestId, reason, description: description.trim() });
      showToast.success("Dispute raised successfully. Admin will review it shortly.");
      onCreated?.(res.data.data);
      onClose();
    } catch (err) {
      showToast.error(err.response?.data?.message || "Failed to raise dispute");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1050, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "8vh" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
      <div style={{ position: "relative", width: 480, maxWidth: "90vw", background: "#fff", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #eef2f7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h5 className="fw-bold mb-0" style={{ fontSize: "1rem" }}>Raise a Dispute</h5>
            <small className="text-muted">Report an issue with this booking</small>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.2rem", color: "#94a3b8", cursor: "pointer", padding: 0 }}><i className="fa fa-times" /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px 24px" }}>
          <div className="mb-3">
            <label className="form-label fw-semibold small">Issue Type</label>
            <div className="d-flex flex-column" style={{ gap: 8 }}>
              {REASONS.map((r) => (
                <button key={r.value} type="button" onClick={() => setReason(r.value)}
                  style={{
                    display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", borderRadius: 10,
                    border: `2px solid ${reason === r.value ? "#0d6efd" : "#e2e8f0"}`,
                    background: reason === r.value ? "#eef2ff" : "#fff",
                    color: reason === r.value ? "#0d6efd" : "#475569",
                    fontSize: "0.85rem", fontWeight: 500, cursor: "pointer", textAlign: "left",
                    transition: "all 0.15s",
                  }}>
                  <i className={`fa ${r.icon}`} style={{ width: 18, textAlign: "center", fontSize: "0.9rem" }} />
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold small">Describe the Issue</label>
            <textarea className="form-control" rows={4} placeholder="Explain what went wrong..." value={description}
              onChange={(e) => setDescription(e.target.value)} maxLength={1000}
              style={{ fontSize: "0.85rem", borderRadius: 10, borderColor: "#e2e8f0", resize: "vertical" }} />
            <small className="text-muted" style={{ fontSize: "0.7rem" }}>{description.length}/1000</small>
          </div>

          <div className="d-flex gap-4 justify-content-end pt-2">
            <button type="button" onClick={onClose} className="btn btn-light fw-semibold" style={{ borderRadius: 10, fontSize: "0.85rem" }}>Cancel</button>
            <button type="submit" disabled={sending || !reason || !description.trim()}
              className="btn fw-semibold" style={{ borderRadius: 10, fontSize: "0.85rem", background: "#ef4444", color: "#fff", border: "none", opacity: sending || !reason || !description.trim() ? 0.6 : 1 }}>
              {sending ? <><span className="spinner-border spinner-border-sm me-2" />Submitting...</> : <><i className="fa fa-gavel me-2" />Submit Dispute</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DisputeModal;
