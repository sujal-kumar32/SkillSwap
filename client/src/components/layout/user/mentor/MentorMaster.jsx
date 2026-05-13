import React from "react";
import { Outlet } from "react-router-dom";
import MentorSidebar from "./MentorSidebar";
import "../learner/learner.css";

const MentorMaster = () => {
  return (
    <div className="learner-shell">
      <MentorSidebar />
      <main className="learner-main bg-image">
        <Outlet />
      </main>
    </div>
  );
};

export default MentorMaster;
