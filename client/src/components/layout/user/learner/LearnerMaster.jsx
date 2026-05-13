import React from "react";
import { Outlet } from "react-router-dom";
import LearnerSidebar from "./LearnerSidebar";
import "./learner.css";

const LearnerMaster = () => {
  return (
    <div className="learner-shell">
      <LearnerSidebar />
      <main className="learner-main bg-image">
        <Outlet />
      </main>
    </div>
  );
};

export default LearnerMaster;
