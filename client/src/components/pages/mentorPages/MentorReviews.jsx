import React from "react";
import { PageHeader } from "../../learner/LearnerUI";

const MentorReviews = () => {
  return (
    <>
      <PageHeader
        title="Mentor Reviews"
        subtitle="See what learners are saying about your sessions."
      />
      <div className="learner-card p-5 text-center">
        <div className="learner-empty-icon mx-auto mb-3">
          <i className="fa fa-star" />
        </div>
        <h5 className="fw-bold">No Reviews Yet</h5>
        <p className="text-muted mb-0">
          You don't have any reviews from learners yet.
        </p>
      </div>
    </>
  );
};

export default MentorReviews;
