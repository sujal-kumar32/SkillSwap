import React from "react";
import TopBar from "../layout/user/TopBar";
import LearnerLeaderboard from "./learnerPages/LearnerLeaderboard";

const LeaderboardPage = () => {
  return (
    <>
      <TopBar />
      <div className="bg-image" style={{ minHeight: "calc(100vh - 64px)", paddingTop: 32 }}>
        <div className="container">
          <LearnerLeaderboard />
        </div>
      </div>
    </>
  );
};

export default LeaderboardPage;
