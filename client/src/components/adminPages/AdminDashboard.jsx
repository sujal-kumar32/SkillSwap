import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Apiservices from "../../../Apiservices";
import {
  PeriodTabs, ChangeBadge, SpinnerCard,
} from "./AnalyticsCharts";
import DashboardCharts from "./DashboardCharts";

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState("6mo");
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async (p) => {
    try {
      setLoading(true);
      const res = await Apiservices.getAdminAnalytics(p);
      setAnalytics(res.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(period);
  }, [period, fetchAnalytics]);

  const s = analytics?.summary;
  const c = analytics?.changes;
  const ready = !loading && analytics;

  const cards = [
    {
      label: "New Users", value: s?.newUsers, icon: "fa-user-plus", color: "#0d6efd",
      change: c?.users, to: "/admin/manage-users",
      sub: `${s?.newLearners || 0} learners · ${s?.newMentors || 0} mentors`,
    },
    {
      label: "Revenue", value: `₹${(s?.periodRevenue || 0).toLocaleString()}`, icon: "fa-rupee-sign", color: "#198754",
      change: c?.revenue, to: "/admin/manage-paid-sessions",
      sub: `${s?.periodTransactions || 0} transactions`,
    },
    {
      label: "Completion Rate", value: `${s?.completionRate || 0}%`, icon: "fa-check-circle", color: "#6c2bd9",
      change: c?.completed, to: "/admin/bookings",
      sub: `${s?.completedRequests || 0} of ${s?.totalRequests || 0} bookings`,
    },
    {
      label: "Active Sessions", value: s?.activeSessions, icon: "fa-video", color: "#0891b2",
      to: "/admin/manage-paid-sessions",
      sub: `${s?.approvedSkills || 0} skills approved`,
    },
  ];

  return (
    <>
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4">
        <div>
          <span className="text-primary fw-semibold small text-uppercase" style={{ letterSpacing: "0.5px" }}>SkillSwap Admin</span>
          <h1 className="fw-bold mb-1">Dashboard</h1>
        </div>
        <div className="d-flex align-items-center gap-3">
          {s?.pendingApplications > 0 && (
            <Link to="/admin/mentor-requests" className="text-decoration-none">
              <span style={{
                background: "#fef2f2", color: "#dc2626", padding: "6px 14px", borderRadius: 999,
                fontSize: "0.8rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8,
                border: "1px solid #fecaca",
              }}>
                <i className="fa fa-handshake" />
                {s.pendingApplications} pending {s.pendingApplications === 1 ? "application" : "applications"}
              </span>
            </Link>
          )}
          <PeriodTabs value={period} onChange={setPeriod} />
        </div>
      </div>

      <div className="row g-4 mb-4">
        {cards.map((card) => (
          <div className="col-sm-6 col-xl-3" key={card.label}>
            <Link to={card.to} className="text-decoration-none">
              <div className="admin-card p-4 h-100" style={{ cursor: "pointer" }}>
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <div>
                    <p className="text-muted mb-1 small fw-semibold text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.3px" }}>{card.label}</p>
                    <h3 className="fw-bold mb-0" style={{ fontSize: "1.6rem" }}>
                      {loading ? <span className="spinner-border spinner-border-sm text-primary" /> : card.value}
                    </h3>
                  </div>
                  <div className="admin-stat-icon" style={{ background: `${card.color}15`, color: card.color }}>
                    <i className={`fa ${card.icon}`} />
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2 mt-2">
                  {card.change && <ChangeBadge pct={card.change.pct} up={card.change.up} />}
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{card.sub}</span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {ready ? <DashboardCharts analytics={analytics} /> : (
        <div className="row g-4 mb-4">
          <div className="col-md-6"><SpinnerCard /></div>
          <div className="col-md-6"><SpinnerCard /></div>
          <div className="col-md-5"><SpinnerCard /></div>
          <div className="col-md-3"><SpinnerCard /></div>
          <div className="col-md-4"><SpinnerCard /></div>
          <div className="col-md-6"><SpinnerCard /></div>
          <div className="col-md-3"><SpinnerCard /></div>
          <div className="col-md-3"><SpinnerCard /></div>
        </div>
      )}

      <div className="row g-4">
        <div className="col-12">
          <div className="admin-card p-4">
            <h5 className="fw-bold mb-1">Quick Actions</h5>
            <p className="text-muted small mb-4">Common admin tasks</p>
            <div className="row g-3">
              {[
                { label: "Manage Users", icon: "fa-users-cog", to: "/admin/manage-users", color: "#0d6efd" },
                { label: "Skill Approval", icon: "fa-clipboard-check", to: "/admin/skill-approval", color: "#198754" },
                { label: "Add Skill", icon: "fa-plus-circle", to: "/admin/add-skill", color: "#6c2bd9" },
                { label: "Paid Sessions", icon: "fa-credit-card", to: "/admin/manage-paid-sessions", color: "#d97706" },
                { label: "Mentor Applications", icon: "fa-handshake", to: "/admin/mentor-requests", color: "#0891b2" },
                { label: "All Bookings", icon: "fa-calendar", to: "/admin/bookings", color: "#dc2626" },
              ].map((item) => (
                <div className="col-sm-4 col-lg-2" key={item.label}>
                  <Link to={item.to} className="text-decoration-none">
                    <div className="d-flex flex-column align-items-center gap-2 p-3 rounded-4 text-center" style={{ background: "#f8faff", border: "1px solid #eef2f7", transition: "all 0.3s ease", height: "100%" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#f0f4ff"; e.currentTarget.style.borderColor = item.color; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "#f8faff"; e.currentTarget.style.borderColor = "#eef2f7"; }}
                    >
                      <div className="admin-stat-icon" style={{ width: 40, height: 40, background: `${item.color}12`, color: item.color }}>
                        <i className={`fa ${item.icon}`} />
                      </div>
                      <span className="fw-semibold" style={{ color: "#1e293b", fontSize: "0.8rem" }}>{item.label}</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
