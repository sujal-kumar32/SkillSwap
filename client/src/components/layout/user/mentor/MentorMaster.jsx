import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import MentorSidebar from "./MentorSidebar";
import "../learner/learner.css";

const MentorMaster = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="learner-shell">
      <MentorSidebar sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
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

export default MentorMaster;
