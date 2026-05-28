import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS, BarElement, ArcElement, CategoryScale,
  LinearScale, PointElement, LineElement, Tooltip, Legend, Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import Apiservices from "../../../../Apiservices";
import { LoadingState } from "../../learner/LearnerUI";

ChartJS.register(BarElement, LineElement, ArcElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

const formatMonth = (m) => {
  const d = new Date(m + "-01");
  return d.toLocaleString("default", { month: "short", year: "2-digit" });
};

const barColors = ["#0d6efd", "#198754", "#6c2bd9", "#d97706", "#dc2626", "#0891b2"];

const StatCard = ({ icon, label, value, tone = "primary", prefix }) => (
  <div className="col-sm-6 col-xl-3">
    <div className="learner-card p-4 h-100" style={{ cursor: "default" }}>
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <p className="text-muted mb-1 small fw-semibold text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.3px" }}>{label}</p>
          <h3 className="fw-bold mb-0" style={{ fontSize: "1.8rem" }}>
            {prefix}{typeof value === "number" ? value.toLocaleString() : value}
          </h3>
        </div>
        <div className={`learner-icon bg-${tone} bg-opacity-10 text-${tone}`}>
          <i className={`fa ${icon}`} />
        </div>
      </div>
      <div style={{ marginTop: "16px", height: 3, background: "#eef2f7", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ height: "100%", width: "40%", background: tone === "primary" ? "linear-gradient(90deg, #0d6efd, #60a5fa)" : tone === "success" ? "linear-gradient(90deg, #198754, #4ade80)" : tone === "info" ? "linear-gradient(90deg, #0891b2, #67e8f9)" : tone === "warning" ? "linear-gradient(90deg, #d97706, #fbbf24)" : "linear-gradient(90deg, #dc2626, #f87171)", borderRadius: 999 }} />
      </div>
    </div>
  </div>
);

const FillLineChart = ({ data, label, color, prefix, height = 220 }) => {
  if (!data || data.length === 0) {
    return <p className="text-muted small text-center py-4 mb-0">No data yet.</p>;
  }
  const chartData = {
    labels: data.map((d) => formatMonth(d.month)),
    datasets: [{
      label,
      data: data.map((d) => d.earnings != null ? d.earnings : d.count),
      borderColor: color,
      backgroundColor: color + "1a",
      fill: true, tension: 0.4, pointRadius: 4,
    }],
  };
  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `${prefix || ""}${ctx.parsed.y}` } } },
    scales: { y: { beginAtZero: true, ticks: { callback: (v) => `${prefix || ""}${v}` } } },
  };
  return <div style={{ height }}><Line data={chartData} options={options} /></div>;
};

const StatusDoughnut = ({ data, colors }) => {
  const labels = Object.keys(data);
  const values = Object.values(data);
  const total = values.reduce((a, b) => a + b, 0);
  if (total === 0) return <p className="text-muted small text-center py-4 mb-0">No data yet.</p>;
  const chartData = {
    labels,
    datasets: [{ data: values, backgroundColor: colors.slice(0, labels.length), borderWidth: 0 }],
  };
  const options = {
    responsive: true, maintainAspectRatio: false, cutout: "55%",
    plugins: { legend: { position: "right", labels: { boxWidth: 12, padding: 10, font: { size: 11 } } } },
  };
  return <div style={{ height: 200 }}><Doughnut data={chartData} options={options} /></div>;
};

const HorizontalBar = ({ data, label, color }) => {
  if (!data || data.length === 0) {
    return <p className="text-muted small text-center py-4 mb-0">No data yet.</p>;
  }
  const top = data.slice(0, 10);
  const chartData = {
    labels: top.map((d) => d.month),
    datasets: [{
      label,
      data: top.map((d) => d.count || d.earnings),
      backgroundColor: color + "dd",
      borderRadius: 6,
      barThickness: 22,
    }],
  };
  const options = {
    indexAxis: "y", responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } },
  };
  return <div style={{ height: 240 }}><Bar data={chartData} options={options} /></div>;
};

const RatingDistBar = ({ dist }) => {
  const labels = ["1★", "2★", "3★", "4★", "5★"];
  const values = [dist["1"], dist["2"], dist["3"], dist["4"], dist["5"]];
  const total = values.reduce((a, b) => a + b, 0);
  if (total === 0) return <p className="text-muted small text-center py-4 mb-0">No reviews yet.</p>;
  const chartData = {
    labels,
    datasets: [{
      label: "Reviews",
      data: values,
      backgroundColor: ["#dc2626", "#d97706", "#eab308", "#16a34a", "#0d6efd"],
      borderRadius: 6,
      barThickness: 32,
    }],
  };
  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.y} review${ctx.parsed.y !== 1 ? "s" : ""}` } } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
  };
  return <div style={{ height: 220 }}><Bar data={chartData} options={options} /></div>;
};

const FunnelChart = ({ funnel }) => {
  const steps = [
    { label: "Requested", value: funnel.requested, color: "#0d6efd" },
    { label: "Accepted", value: funnel.accepted, color: "#6c2bd9" },
    { label: "Completed", value: funnel.completed, color: "#198754" },
    { label: "Cancelled", value: funnel.cancelled, color: "#dc2626" },
  ];
  const maxVal = Math.max(...steps.map((s) => s.value), 1);
  return (
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
  );
};

const MentorAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await Apiservices.getMentorAnalytics();
        setData(res.data.data);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingState label="Loading analytics..." />;

  if (error) {
    return (
      <div className="alert alert-danger d-flex align-items-center gap-3" style={{ borderRadius: 16 }}>
        <i className="fa fa-exclamation-circle" style={{ fontSize: "1.3rem" }} />
        <div>
          <strong className="fw-semibold">Error</strong>
          <p className="mb-0 small">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { sessionStats, bookingStats, earnings, followerGrowth, ratings, learners } = data;
  const sessionColors = ["#0d6efd", "#0891b2", "#198754", "#dc2626"];

  return (
    <>
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start mb-4" style={{ gap: 10 }}>
        <div>
          <span className="text-primary fw-semibold small text-uppercase" style={{ letterSpacing: "0.5px" }}>SkillSwap Mentor</span>
          <h1 className="fw-bold mb-1">Analytics</h1>
          <p className="text-muted mb-0">Track your impact, earnings, and growth over time.</p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <StatCard icon="fa-video" label="Sessions" value={sessionStats.total} tone="primary" />
        <StatCard icon="fa-calendar-check" label="Bookings" value={bookingStats.total} tone="info" />
        <StatCard icon="fa-users" label="Learners" value={learners.total} tone="success" />
        <StatCard icon="fa-star" label="Avg Rating" value={ratings.average} tone="warning" />
      </div>

      <div className="row g-4 mb-4">
        <StatCard icon="fa-check-circle" label="Completed Sessions" value={sessionStats.byStatus.completed} tone="success" />
        <StatCard icon="fa-credit-card" label="Total Earned" value={Math.round(earnings.totalEarned).toLocaleString()} tone="primary" prefix="₹" />
        <StatCard icon="fa-user-plus" label="Followers" value={followerGrowth.current} tone="info" />
        <StatCard icon="fa-graduation-cap" label="New Learners (month)" value={learners.newThisMonth} tone="warning" />
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-4">
          <div className="learner-card p-4 h-100">
            <h6 className="fw-bold mb-3" style={{ fontSize: "0.9rem" }}>Session Status</h6>
            <StatusDoughnut data={sessionStats.byStatus} colors={sessionColors} />
          </div>
        </div>
        <div className="col-lg-4">
          <div className="learner-card p-4 h-100">
            <h6 className="fw-bold mb-3" style={{ fontSize: "0.9rem" }}>Session Type</h6>
            <StatusDoughnut data={sessionStats.byType} colors={["#0d6efd", "#d97706"]} />
          </div>
        </div>
        <div className="col-lg-4">
          <div className="learner-card p-4 h-100">
            <h6 className="fw-bold mb-3" style={{ fontSize: "0.9rem" }}>Booking Funnel</h6>
            <FunnelChart funnel={bookingStats.funnel} />
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="learner-card p-4 h-100">
            <h6 className="fw-bold mb-3" style={{ fontSize: "0.9rem" }}>Earnings (last 6 months)</h6>
            <FillLineChart data={earnings.monthly} label="Earnings" color="#198754" prefix="₹" />
          </div>
        </div>
        <div className="col-lg-6">
          <div className="learner-card p-4 h-100">
            <h6 className="fw-bold mb-3" style={{ fontSize: "0.9rem" }}>Follower Growth (last 6 months)</h6>
            <FillLineChart data={followerGrowth.monthly} label="Followers" color="#0d6efd" />
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="learner-card p-4 h-100">
            <h6 className="fw-bold mb-3" style={{ fontSize: "0.9rem" }}>Rating Distribution</h6>
            <RatingDistBar dist={ratings.distribution} />
          </div>
        </div>
        <div className="col-lg-4">
          <div className="learner-card p-4 h-100">
            <h6 className="fw-bold mb-3" style={{ fontSize: "0.9rem" }}>Booking Status</h6>
            <StatusDoughnut data={bookingStats.byStatus} colors={["#eab308", "#0d6efd", "#198754", "#dc2626", "#64748b"]} />
          </div>
        </div>
        <div className="col-lg-4">
          <div className="learner-card p-4 h-100">
            <h6 className="fw-bold mb-3" style={{ fontSize: "0.9rem" }}>Earnings Summary</h6>
            <div className="d-flex flex-column" style={{ gap: 8 }}>
              <div className="d-flex justify-content-between py-2" style={{ borderBottom: "1px solid #f1f5f9" }}>
                <span className="text-muted" style={{ fontSize: "0.85rem" }}>Total Revenue</span>
                <strong style={{ fontSize: "1.1rem", color: "#198754" }}>₹{Math.round(earnings.totalEarned).toLocaleString()}</strong>
              </div>
              <div className="d-flex justify-content-between py-2" style={{ borderBottom: "1px solid #f1f5f9" }}>
                <span className="text-muted" style={{ fontSize: "0.85rem" }}>Total Reviews</span>
                <strong style={{ fontSize: "1.1rem", color: "#0d6efd" }}>{ratings.total}</strong>
              </div>
              <div className="d-flex justify-content-between py-2" style={{ borderBottom: "1px solid #f1f5f9" }}>
                <span className="text-muted" style={{ fontSize: "0.85rem" }}>Avg. Rating</span>
                <strong style={{ fontSize: "1.1rem", color: "#d97706" }}>
                  {ratings.average} <i className="fa fa-star text-warning" style={{ fontSize: "0.85rem" }} />
                </strong>
              </div>
              <div className="d-flex justify-content-between py-2">
                <span className="text-muted" style={{ fontSize: "0.85rem" }}>Funnel Conversion</span>
                <strong style={{ fontSize: "1.1rem", color: "#6c2bd9" }}>
                  {bookingStats.funnel.requested > 0
                    ? Math.round((bookingStats.funnel.completed / bookingStats.funnel.requested) * 100)
                    : 0}%
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MentorAnalytics;
