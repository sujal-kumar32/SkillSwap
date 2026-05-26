import React, { useEffect, useState } from "react";
import { showToast } from "../../utils/toastUtils";

export function useXpCelebration() {
  const [badgeData, setBadgeData] = useState(null);

  const handleXpResponse = (response) => {
    const xp = response?.xp;
    if (!xp) return;

    if (xp.xpGained) {
      showToast.success(<XpToast xpGained={xp.xpGained} reason={xp.reason} />, { autoClose: 3000 });
    }

    if (xp.newBadges?.length) {
      setBadgeData(xp.newBadges);
    }
  };

  return { badgeData, setBadgeData, handleXpResponse };
}

const XpToast = ({ xpGained, reason }) => (
  <div className="d-flex align-items-center" style={{ gap: "10px" }}>
    <div style={{
      width: 32, height: 32, borderRadius: 8,
      background: "linear-gradient(135deg, #0d6efd, #6610f2)",
      display: "grid", placeItems: "center", color: "white", fontSize: "0.85rem", flexShrink: 0,
    }}>
      <i className="fa fa-bolt" />
    </div>
    <div>
      <div className="fw-bold" style={{ fontSize: "0.85rem" }}>+{xpGained} XP</div>
      <small style={{ fontSize: "0.72rem", opacity: 0.85 }}>{reason}</small>
    </div>
  </div>
);

export const BadgeUnlockModal = ({ badges, onClose }) => {
  const [visible, setVisible] = useState(!!badges?.length);

  useEffect(() => {
    setVisible(!!badges?.length);
  }, [badges]);

  if (!visible || !badges?.length) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }} onClick={() => { setVisible(false); onClose?.(); }}>
      <div style={{
        background: "#fff", borderRadius: 24, maxWidth: 420, width: "100%",
        padding: 32, textAlign: "center", boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
        animation: "xpPopIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px", fontSize: "2rem", color: "white", boxShadow: "0 8px 24px rgba(251,191,36,0.3)",
        }}>
          <i className="fa fa-trophy" />
        </div>
        <h4 className="fw-bold mb-1" style={{ color: "#1e293b" }}>
          {badges.length > 1 ? "Badges Unlocked!" : "Badge Unlocked!"}
        </h4>
        <p className="text-muted mb-4" style={{ fontSize: "0.85rem" }}>
          {badges.length > 1
            ? `You earned ${badges.length} new badges`
            : "You earned a new achievement"}
        </p>
        <div className="d-flex flex-column" style={{ gap: "12px" }}>
          {badges.map((b) => (
            <div key={b._id} className="d-flex align-items-center" style={{ gap: "14px", padding: "14px", background: "#f8fafc", borderRadius: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: `${b.color}18`, display: "grid", placeItems: "center",
                color: b.color, fontSize: "1.2rem", flexShrink: 0,
              }}>
                <i className={`fa ${b.icon}`} />
              </div>
              <div className="text-start">
                <div className="fw-bold" style={{ fontSize: "0.9rem" }}>{b.name}</div>
                <small style={{ fontSize: "0.75rem", color: "#64748b" }}>{b.description}</small>
              </div>
            </div>
          ))}
        </div>
        <button
          className="btn btn-primary rounded-pill px-5 fw-bold mt-4"
          onClick={() => { setVisible(false); onClose?.(); }}
          style={{ padding: "12px 32px" }}
        >
          Awesome!
        </button>
      </div>
      <style>{`
        @keyframes xpPopIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
