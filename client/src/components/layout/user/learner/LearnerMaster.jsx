import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import LearnerSidebar from "./LearnerSidebar";
import "./learner.css";

const LearnerMaster = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="learner-shell">
      <LearnerSidebar sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={`sidebar-backdrop${sidebarOpen ? " show" : ""}`} onClick={() => setSidebarOpen(false)} />
      <main className="learner-main bg-image">
        <div className="d-flex align-items-center gap-2 mb-3 d-lg-none">
          <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(true)}>
            <i className="fa fa-bars" />
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default LearnerMaster;
