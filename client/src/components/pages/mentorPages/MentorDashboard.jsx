import React from "react";
import { PageHeader, StatCard } from "../../learner/LearnerUI";

const MentorDashboard = () => {
  return (
    <>
      <PageHeader
        title="Mentor Dashboard"
        subtitle="Manage your sessions, bookings, and interact with learners."
      />
      <div className="row g-4 mb-4">
        <StatCard icon="fa-video" label="Active Sessions" value="0" tone="primary" />
        <StatCard icon="fa-users" label="Total Learners" value="0" tone="success" />
        <StatCard icon="fa-star" label="Avg Rating" value="0.0" tone="warning" />
      </div>
      <div className="learner-card p-5 text-center">
        <h5 className="fw-bold">Welcome to your dashboard</h5>
        <p className="text-muted mb-0">Select an option from the sidebar to get started.</p>
      </div>
    </>
  );
};

export default MentorDashboard;
