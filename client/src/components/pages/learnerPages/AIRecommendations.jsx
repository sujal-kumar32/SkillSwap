import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Apiservices from "../../../../Apiservices";
import { EmptyState, LoadingState, PageHeader, SessionCard } from "../../learner/LearnerUI";

const AIRecommendations = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setError("");
        const response = await Apiservices.fetchRecommendations();
        setSessions(response.data.data || []);
      } catch (error) {
        console.log(error);
        setSessions([]);
        setError(error.response?.data?.message || "Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, []);

  return (
    <>
      <PageHeader title="AI Recommendations" subtitle="Smart session suggestions based on your learning goals, skills, and trends." />
      {error && <div className="alert alert-danger rounded-4">{error}</div>}

      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="learner-card p-4 h-100">
            <span className="badge bg-info text-dark rounded-pill mb-3">Smart Suggestions</span>
            <h4 className="fw-bold">Your next best learning moves</h4>
            <p className="text-muted mb-0">
              Recommendations can be connected to your backend AI endpoint and personalized from learner activity.
            </p>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="learner-card p-4 h-100">
            <h5 className="fw-bold">Trending Skills</h5>
            <div className="d-flex flex-wrap gap-2 mt-3">
              {["React", "Node.js", "UI/UX", "Public Speaking", "Data Analysis"].map((skill) => (
                <span className="badge bg-light text-primary border" key={skill}>{skill}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="learner-card p-4 mb-4">
        <h5 className="fw-bold">AI Chatbot Placeholder</h5>
        <div className="bg-light rounded-4 p-4 mt-3">
          <p className="text-muted mb-3">Ask: “What should I learn next for frontend development?”</p>
          <div className="input-group">
            <input className="form-control rounded-start-pill" placeholder="Ask AI for learning advice..." />
            <button className="btn btn-primary rounded-end-pill">Ask</button>
          </div>
        </div>
      </div>

      {loading ? <LoadingState /> : sessions.length ? (
        <div className="row g-4">
          {sessions.map((session) => (
            <div className="col-md-6 col-xl-4" key={session._id}>
              <SessionCard session={session} onBook={() => navigate(`/learner/book/${session._id}`)} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No recommendations yet" text="Recommendations will appear when sessions are available." actionLabel="Explore Sessions" actionTo="/learner/explore" />
      )}
    </>
  );
};

export default AIRecommendations;
