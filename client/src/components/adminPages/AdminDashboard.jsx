import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Apiservices from "../../../Apiservices";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, sessions: 0, skills: 0, requests: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [usersRes, sessionsRes, skillsRes, requestsRes] = await Promise.all([
          Apiservices.getUsers().catch(() => ({ data: { data: [] } })),
          Apiservices.getSessions().catch(() => ({ data: { data: [] } })),
          Apiservices.getSkills().catch(() => ({ data: { data: [] } })),
          Apiservices.getRequests().catch(() => ({ data: { data: [] } })),
        ]);
        setStats({
          users: (usersRes.data.data || []).length,
          sessions: (sessionsRes.data.data || []).length,
          skills: (skillsRes.data.data || []).length,
          requests: (requestsRes.data.data || []).filter(r => r.status === "pending").length,
        });
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Total Users", value: stats.users, icon: "fa-users", color: "#0d6efd", to: "/admin/manage-users" },
    { label: "Total Sessions", value: stats.sessions, icon: "fa-video", color: "#198754", to: "/admin/manage-paid-sessions" },
    { label: "Skills Listed", value: stats.skills, icon: "fa-book", color: "#6c2bd9", to: "/admin/skill-approval" },
    { label: "Pending Requests", value: stats.requests, icon: "fa-envelope", color: "#d97706", to: "/admin/view-requests" },
  ];

  return (
    <>
      <div className="admin-page-header mb-4">
        <span className="text-primary fw-semibold small text-uppercase" style={{ letterSpacing: "0.5px" }}>SkillSwap Admin</span>
        <h1 className="fw-bold mb-1">Admin Dashboard</h1>
        <p className="text-muted mb-0">Overview of your platform activity.</p>
      </div>

      <div className="row g-4 mb-4">
        {cards.map((card) => (
          <div className="col-sm-6 col-xl-3" key={card.label}>
            <Link to={card.to} className="text-decoration-none">
              <div className="admin-card p-4 h-100" style={{ cursor: "pointer" }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-muted mb-1 small fw-semibold text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.3px" }}>{card.label}</p>
                    <h3 className="fw-bold mb-0" style={{ fontSize: "1.8rem" }}>
                      {loading ? <span className="spinner-border spinner-border-sm text-primary" /> : card.value}
                    </h3>
                  </div>
                  <div className="admin-stat-icon" style={{ background: `${card.color}15`, color: card.color }}>
                    <i className={`fa ${card.icon}`} />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="admin-card p-4">
            <h5 className="fw-bold mb-1">Quick Actions</h5>
            <p className="text-muted small mb-4">Common admin tasks</p>
            <div className="row g-3">
              {[
                { label: "Manage Users", icon: "fa-users-gear", to: "/admin/manage-users", color: "#0d6efd" },
                { label: "Skill Approval", icon: "fa-clipboard-check", to: "/admin/skill-approval", color: "#198754" },
                { label: "Add Skill", icon: "fa-plus-circle", to: "/admin/add-skill", color: "#6c2bd9" },
                { label: "Paid Sessions", icon: "fa-credit-card", to: "/admin/manage-paid-sessions", color: "#d97706" },
              ].map((item) => (
                <div className="col-sm-6" key={item.label}>
                  <Link to={item.to} className="text-decoration-none">
                    <div className="d-flex align-items-center gap-3 p-3 rounded-4" style={{ background: "#f8faff", border: "1px solid #eef2f7", transition: "all 0.3s ease" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#f0f4ff"; e.currentTarget.style.borderColor = item.color; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "#f8faff"; e.currentTarget.style.borderColor = "#eef2f7"; }}
                    >
                      <div className="admin-stat-icon" style={{ width: 44, height: 44, background: `${item.color}12`, color: item.color }}>
                        <i className={`fa ${item.icon}`} />
                      </div>
                      <span className="fw-semibold" style={{ color: "#1e293b", fontSize: "0.9rem" }}>{item.label}</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="admin-card p-4" style={{ background: "linear-gradient(135deg, #1e293b, #2d1b69)", color: "white" }}>
            <div className="admin-stat-icon mb-3" style={{ width: 48, height: 48, background: "rgba(255,255,255,0.15)", color: "white" }}>
              <i className="fa fa-shield-halved" />
            </div>
            <h5 className="fw-bold mb-2" style={{ color: "white" }}>Admin Access</h5>
            <p className="mb-0" style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.9rem" }}>
              You have full platform access. Use the sidebar to navigate between sections.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
