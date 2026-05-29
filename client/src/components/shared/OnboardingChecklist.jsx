import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Apiservices from "../../../Apiservices";

const OnboardingChecklist = ({ role }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await Apiservices.getOnboarding(role);
        setData(res.data.data);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [role]);

  if (loading) return null;
  if (!data || data.allDone) return null;

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #eef2f7",
      borderRadius: 16,
      overflow: "hidden",
      marginBottom: 24,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <div style={{
        padding: "18px 22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "pointer",
        transition: "background 0.15s",
      }}
        onClick={() => setCollapsed(!collapsed)}
        onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
        <div className="d-flex align-items-center" style={{ gap: 14 }}>
          <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
            <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#eef2f7" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="url(#progressGrad)" strokeWidth="3"
                strokeDasharray={`${(data.progress / 100) * 97.4} 97.4`} strokeLinecap="round"
                style={{ transition: "stroke-dasharray 0.6s ease" }} />
              <defs>
                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0d6efd" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
            <span style={{
              position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.7rem", fontWeight: 700, color: "#0d6efd",
            }}>{data.progress}%</span>
          </div>
          <div>
            <div className="fw-bold" style={{ fontSize: "0.9rem", color: "#1e293b", lineHeight: 1.3 }}>
              {data.doneCount === 0 ? "Set up your profile" : "Continue your setup"}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 1 }}>
              {data.doneCount} of {data.total} steps done
            </div>
          </div>
        </div>
        <div className="d-flex align-items-center" style={{ gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "#f1f5f9", color: "#64748b", fontSize: "0.65rem",
            transition: "all 0.2s",
          }}>
            <i className={`fa fa-chevron-${collapsed ? "down" : "up"}`} />
          </div>
        </div>
      </div>

      {!collapsed && (
        <div style={{ padding: "2px 22px 18px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {data.steps.map((step) => (
              <Link key={step.id} to={step.link} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", borderRadius: 10,
                  border: `1px solid ${step.done ? "#dcfce7" : "#e2e8f0"}`,
                  background: step.done ? "#f0fdf4" : "#fafbfc",
                  transition: "all 0.15s",
                  cursor: "pointer",
                }}
                  onMouseEnter={(e) => {
                    if (!step.done) {
                      e.currentTarget.style.borderColor = "#0d6efd";
                      e.currentTarget.style.background = "#f8faff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!step.done) {
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.background = "#fafbfc";
                    }
                  }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: step.done ? "#16a34a" : "#e2e8f0",
                    color: step.done ? "#fff" : "#94a3b8",
                    fontSize: "0.65rem",
                    transition: "all 0.2s",
                  }}>
                    {step.done ? <i className="fa fa-check" /> : <i className={`fa ${step.icon}`} />}
                  </div>
                  <span style={{
                    flex: 1, fontSize: "0.82rem", fontWeight: 500,
                    color: step.done ? "#16a34a" : "#334155",
                    textDecoration: step.done ? "line-through" : "none",
                  }}>{step.label}</span>
                  {!step.done && (
                    <span style={{
                      fontSize: "0.65rem", fontWeight: 600, color: "#0d6efd",
                      display: "flex", alignItems: "center", gap: 4,
                    }}>
                      Get started <i className="fa fa-arrow-right" style={{ fontSize: "0.6rem" }} />
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

        </div>
      )}
    </div>
  );
};

export default OnboardingChecklist;
