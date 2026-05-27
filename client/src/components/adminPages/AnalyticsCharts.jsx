import React from "react";
import {
  Chart as ChartJS, BarElement, ArcElement, CategoryScale,
  LinearScale, PointElement, LineElement, Tooltip, Legend, Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(BarElement, LineElement, ArcElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

const formatMonth = (m) => {
  const d = new Date(m + "-01");
  return d.toLocaleString("default", { month: "short", year: "2-digit" });
};

const periods = [
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "6mo", label: "6 months" },
  { key: "all", label: "All time" },
];

export const PeriodTabs = ({ value, onChange }) => (
  <div className="d-flex mb-3" style={{ gap: 6, background: "#f1f5f9", borderRadius: 10, padding: 3, display: "inline-flex" }}>
    {periods.map((p) => (
      <button
        key={p.key}
        onClick={() => onChange(p.key)}
        style={{
          padding: "6px 16px", borderRadius: 8, border: "none", cursor: "pointer",
          fontSize: "0.8rem", fontWeight: 600,
          background: value === p.key ? "#fff" : "transparent",
          color: value === p.key ? "#0d6efd" : "#64748b",
          boxShadow: value === p.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
          transition: "all 0.15s",
        }}
      >
        {p.label}
      </button>
    ))}
  </div>
);

export const ChangeBadge = ({ pct, up }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 6,
    fontSize: "0.75rem", fontWeight: 700, padding: "2px 8px", borderRadius: 999,
    background: up ? "rgba(25,135,84,0.1)" : "rgba(220,38,38,0.1)",
    color: up ? "#198754" : "#dc2626",
  }}>
    <i className={`fa ${up ? "fa-arrow-up" : "fa-arrow-down"}`} style={{ fontSize: "0.6rem" }} />
    {pct}%
  </span>
);

export const UsersChart = ({ data }) => {
  const chartData = {
    labels: data.map((d) => formatMonth(d.month)),
    datasets: [{
      label: "New Users",
      data: data.map((d) => d.users),
      borderColor: "#0d6efd",
      backgroundColor: "rgba(13,110,253,0.1)",
      fill: true, tension: 0.4, pointRadius: 4,
    }],
  };
  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
  };
  return (
    <div className="admin-card p-4 h-100">
      <h6 className="fw-bold mb-3" style={{ fontSize: "0.9rem" }}>New Users (6 months)</h6>
      <div style={{ height: 220 }}><Line data={chartData} options={options} /></div>
    </div>
  );
};

export const RevenueChart = ({ data }) => {
  const chartData = {
    labels: data.map((d) => formatMonth(d.month)),
    datasets: [{
      label: "Revenue",
      data: data.map((d) => d.revenue),
      borderColor: "#198754",
      backgroundColor: "rgba(25,135,84,0.1)",
      fill: true, tension: 0.4, pointRadius: 4,
    }],
  };
  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `₹${ctx.parsed.y}` } } },
    scales: { y: { beginAtZero: true, ticks: { callback: (v) => `₹${v}` } } },
  };
  return (
    <div className="admin-card p-4 h-100">
      <h6 className="fw-bold mb-3" style={{ fontSize: "0.9rem" }}>Revenue (6 months)</h6>
      <div style={{ height: 220 }}><Line data={chartData} options={options} /></div>
    </div>
  );
};

const barColors = ["#0d6efd", "#198754", "#6c2bd9", "#d97706", "#dc2626", "#0891b2"];

export const PopularSkillsChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="admin-card p-4 h-100">
        <h6 className="fw-bold mb-3" style={{ fontSize: "0.9rem" }}>Popular Skills (by bookings)</h6>
        <p className="text-muted small mb-0">No data yet.</p>
      </div>
    );
  }
  const top = data.slice(0, 8);
  const chartData = {
    labels: top.map((d) => d.title.length > 22 ? d.title.slice(0, 20) + "\u2026" : d.title),
    datasets: [{
      label: "Bookings",
      data: top.map((d) => d.bookings),
      backgroundColor: top.map((_, i) => barColors[i % barColors.length] + "dd"),
      borderRadius: 6,
      barThickness: 22,
    }],
  };
  const options = {
    indexAxis: "y", responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.parsed.x} booking${ctx.parsed.x !== 1 ? "s" : ""}`,
          afterLabel: (ctx) => top[ctx.dataIndex].title,
        },
      },
    },
    scales: {
      x: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } } },
      y: {
        ticks: { autoSkip: false, font: { size: 11, weight: "600" } },
      },
    },
  };
  return (
    <div className="admin-card p-4 h-100">
      <h6 className="fw-bold mb-3" style={{ fontSize: "0.9rem" }}>Popular Skills (by bookings)</h6>
      <div style={{ height: 280 }}><Bar data={chartData} options={options} /></div>
    </div>
  );
};

export const CompletionPie = ({ completionRate, completed, total }) => {
  const chartData = {
    labels: ["Completed", "Other"],
    datasets: [{
      data: [completed, Math.max(0, total - completed)],
      backgroundColor: ["#198754", "#e2e8f0"],
      borderWidth: 0,
    }],
  };
  const options = {
    responsive: true, maintainAspectRatio: false, cutout: "60%",
    plugins: { legend: { position: "bottom", labels: { boxWidth: 12, padding: 12 } } },
  };
  return (
    <div className="admin-card p-4 h-100">
      <h6 className="fw-bold mb-3" style={{ fontSize: "0.9rem" }}>Completion Rate</h6>
      <div className="text-center mb-2">
        <span style={{ fontSize: "2rem", fontWeight: 800, color: "#0d6efd" }}>{completionRate}%</span>
      </div>
      <div style={{ height: 180 }}><Doughnut data={chartData} options={options} /></div>
    </div>
  );
};

export const FunnelChart = ({ funnel }) => {
  const steps = [
    { label: "Requested", value: funnel.requested, color: "#0d6efd" },
    { label: "Accepted", value: funnel.accepted, color: "#6c2bd9" },
    { label: "Completed", value: funnel.completed, color: "#198754" },
    { label: "Cancelled", value: funnel.cancelled, color: "#dc2626" },
  ];
  const maxVal = Math.max(...steps.map((s) => s.value), 1);
  return (
    <div className="admin-card p-4 h-100">
      <h6 className="fw-bold mb-3" style={{ fontSize: "0.9rem" }}>Booking Funnel</h6>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {steps.map((s) => (
          <div key={s.label}>
            <div className="d-flex justify-content-between mb-1">
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569" }}>{s.label}</span>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: s.color }}>{s.value}</span>
            </div>
            <div style={{ height: 8, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(s.value / maxVal) * 100}%`, background: s.color, borderRadius: 999, transition: "width 0.5s" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TopMentorsTable = ({ mentors }) => {
  const maxCompleted = Math.max(...mentors.map((m) => m.completed), 1);
  return (
    <div className="admin-card p-4 h-100">
      <h6 className="fw-bold mb-3" style={{ fontSize: "0.9rem" }}>Top Mentors (by completed sessions)</h6>
      {mentors.length === 0 ? (
        <p className="text-muted small mb-0">No data yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {mentors.map((m, i) => {
            const pct = Math.round((m.completed / maxCompleted) * 100);
            return (
              <div key={i}>
                <div className="d-flex align-items-center" style={{ gap: 10 }}>
                  <span style={{ width: 20, textAlign: "center", fontWeight: 700, color: "#94a3b8", fontSize: "0.85rem", flexShrink: 0 }}>#{i + 1}</span>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
                    background: "linear-gradient(135deg, #0d6efd, #6610f2)",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.75rem", fontWeight: 700,
                  }}>
                    {m.profileImage ? (
                      <img src={m.profileImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      (m.name || "?").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</div>
                    <div style={{ fontSize: "0.72rem", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.email}</div>
                    <div style={{ height: 5, background: "#f1f5f9", borderRadius: 999, overflow: "hidden", marginTop: 4 }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #0d6efd, #6610f2)", borderRadius: 999, transition: "width 0.5s" }} />
                    </div>
                  </div>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0d6efd", flexShrink: 0 }}>{m.completed}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const SpinnerCard = () => (
  <div className="admin-card p-4 text-center">
    <span className="spinner-border spinner-border-sm text-primary" />
  </div>
);
