import React from "react";
import { Link } from "react-router-dom";
import {
  UsersChart, RevenueChart, PopularSkillsChart,
  CompletionPie, FunnelChart, TopMentorsTable,
} from "./AnalyticsCharts";

const DashboardCharts = ({ analytics }) => {
  const { summary, funnel, usersChart, revenueChart, popularSkills, topMentors } = analytics;

  return (
    <>
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <UsersChart data={usersChart} />
        </div>
        <div className="col-md-6">
          <RevenueChart data={revenueChart} />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-5">
          <PopularSkillsChart data={popularSkills} />
        </div>
        <div className="col-md-3">
          <CompletionPie
            completionRate={summary.completionRate}
            completed={summary.completedRequests}
            total={summary.totalRequests}
          />
        </div>
        <div className="col-md-4">
          <FunnelChart funnel={funnel} />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <TopMentorsTable mentors={topMentors} />
        </div>
        <div className="col-md-6">
          <div className="row g-4">
            <div className="col-6">
              <Link to="/admin/manage-users" className="text-decoration-none">
                <div className="admin-card p-4 text-center h-100">
                  <div className="admin-stat-icon mx-auto" style={{ width: 44, height: 44, background: "#0d6efd12", color: "#0d6efd" }}>
                    <i className="fa fa-users" />
                  </div>
                  <h5 className="fw-bold mb-0 mt-2" style={{ fontSize: "1.4rem" }}>{summary.totalLearners}</h5>
                  <small className="text-muted">Learners</small>
                </div>
              </Link>
            </div>
            <div className="col-6">
              <Link to="/admin/manage-users" className="text-decoration-none">
                <div className="admin-card p-4 text-center h-100">
                  <div className="admin-stat-icon mx-auto" style={{ width: 44, height: 44, background: "#6c2bd912", color: "#6c2bd9" }}>
                    <i className="fa fa-chalkboard-teacher" />
                  </div>
                  <h5 className="fw-bold mb-0 mt-2" style={{ fontSize: "1.4rem" }}>{summary.totalMentors}</h5>
                  <small className="text-muted">Mentors</small>
                </div>
              </Link>
            </div>
            <div className="col-12" style={{ marginTop: "16px" }}>
              <div className="admin-card p-4" style={{ background: "linear-gradient(135deg, #1e293b, #2d1b69)", color: "white" }}>
                <div className="d-flex align-items-center" style={{ gap: 10 }}>
                  <div className="admin-stat-icon" style={{ width: 44, height: 44, background: "rgba(255,255,255,0.15)", color: "white" }}>
                    <i className="fa fa-shield-alt" />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1" style={{ color: "white", fontSize: "0.9rem" }}>Admin Access</h6>
                    <p className="mb-0" style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem" }}>
                      Full platform control
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardCharts;
