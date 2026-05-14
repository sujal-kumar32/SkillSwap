import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Apiservices from "../../../../Apiservices";
import { showToast } from "../../../utils/toastUtils";
import { EmptyState, LoadingState, PageHeader, SessionCard } from "../../learner/LearnerUI";

const AIRecommendations = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [trendingSkills, setTrendingSkills] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [profile, setProfile] = useState({ interests: "", goals: "" });

  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const [insight, setInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setError("");
        const [recRes, profRes] = await Promise.all([
          Apiservices.fetchRecommendations(),
          Apiservices.getProfile().catch(() => ({ data: { data: {} } })),
        ]);
        setSessions(recRes.data.data || []);
        const u = profRes.data.data || {};
        setProfile({ interests: (u.interests || []).join(", "), goals: u.learningGoals || "" });
      } catch (error) {
        console.log(error);
        setSessions([]);
        setError(error.response?.data?.message || "Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    };
    loadRecommendations();
    loadTrendingSkills();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const loadTrendingSkills = async () => {
    setTrendingLoading(true);
    try {
      const res = await Apiservices.generateTags("trending skills for 2026 in technology, design, and business");
      const skills = res.data.data.tags.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 8);
      setTrendingSkills(skills.length ? skills : ["React", "Node.js", "UI/UX", "Public Speaking", "Data Analysis", "Python", "Cloud Computing", "DevOps"]);
    } catch {
      setTrendingSkills(["React", "Node.js", "UI/UX", "Public Speaking", "Data Analysis", "Python", "Cloud Computing", "DevOps"]);
    } finally {
      setTrendingLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatHistory((prev) => [...prev, { role: "user", text: userMsg }]);
    setChatLoading(true);
    try {
      const res = await Apiservices.chatAI({ message: userMsg });
      setChatHistory((prev) => [...prev, { role: "ai", text: res.data.data.reply }]);
    } catch (err) {
      setChatHistory((prev) => [...prev, { role: "ai", text: "Sorry, I couldn't process that. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  const getInsights = async () => {
    const interests = profile.interests.trim();
    if (!interests) {
      showToast.warning("Add interests in your profile first");
      return;
    }
    setInsightLoading(true);
    setInsight("");
    try {
      const res = await Apiservices.chatAI({
        message: `Based on someone interested in: ${interests}${profile.goals ? `, with goals: ${profile.goals}` : ""}, give 3 specific learning suggestions to improve their skills. Keep each suggestion short, one line each, numbered 1-3.`,
      });
      setInsight(res.data.data.reply);
    } catch (err) {
      showToast.error("Failed to get insights");
    } finally {
      setInsightLoading(false);
    }
  };

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
              Sessions recommended by SwapMind AI based on your interests and activity.
            </p>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="learner-card p-4 h-100">
            <h5 className="fw-bold">
              {trendingLoading ? (
                <><span className="spinner-border spinner-border-sm me-2" />Loading...</>
              ) : "Trending Skills"}
            </h5>
            <div className="d-flex flex-wrap gap-2 mt-3">
              {trendingSkills.map((skill) => (
                <span className="badge bg-light text-primary border" key={skill}>{skill}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="learner-card p-4 h-100">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="badge bg-primary rounded-pill px-3 py-2">
                <i className="fa fa-robot me-1" />SwapMind AI
              </span>
              <small className="text-muted">Ask me anything about learning</small>
            </div>
            <div className="bg-light rounded-4 p-3 mb-3" style={{ maxHeight: 260, overflowY: "auto", minHeight: 160 }}>
              {chatHistory.length === 0 && (
                <p className="text-muted text-center py-4 mb-0">
                  <i className="fa fa-comment-dots fa-2x d-block mb-2 opacity-50"></i>
                  Ask about learning paths, skills, or mentorship...
                </p>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`d-flex mb-2 ${msg.role === "user" ? "justify-content-end" : "justify-content-start"}`}>
                  <div className={`rounded-4 px-3 py-2 ${msg.role === "user" ? "bg-primary text-white" : "bg-white border"}`}
                    style={{ maxWidth: "85%", fontSize: "0.9rem", whiteSpace: "pre-wrap" }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="d-flex justify-content-start mb-2">
                  <div className="rounded-4 px-3 py-2 bg-white border">
                    <span className="spinner-border spinner-border-sm me-1" /> Thinking...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="input-group">
              <input
                className="form-control rounded-start-pill"
                placeholder="Ask for learning advice..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleChatKeyDown}
                disabled={chatLoading}
              />
              <button className="btn btn-primary rounded-end-pill px-4" onClick={sendChatMessage} disabled={chatLoading || !chatInput.trim()}>
                {chatLoading ? <span className="spinner-border spinner-border-sm" /> : <i className="fa fa-paper-plane" />}
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="learner-card p-4 h-100">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="badge bg-success rounded-pill px-3 py-2">
                <i className="fa fa-lightbulb me-1" />AI Learning Insights
              </span>
              <small className="text-muted">Personalized suggestions</small>
            </div>
            <p className="text-muted small mb-3">
              {profile.interests.trim() ? `Based on your interests: ${profile.interests}` : "Add interests in your profile to get personalized insights."}
            </p>
            {profile.interests.trim() && (
              <button className="btn btn-success rounded-pill w-100 fw-semibold mb-3" onClick={getInsights} disabled={insightLoading}>
                {insightLoading ? (
                  <><span className="spinner-border spinner-border-sm me-2" />Analyzing...</>
                ) : (
                  <><i className="fa fa-magic me-2" />Get Learning Insights</>
                )}
              </button>
            )}
            {!profile.interests.trim() && (
              <Link to="/profile" className="btn btn-outline-primary rounded-pill w-100 fw-semibold">
                <i className="fa fa-pen me-2" />Add Interests in Profile
              </Link>
            )}
            {insight && (
              <div className="bg-light rounded-4 p-3">
                <pre className="mb-0 small" style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", lineHeight: 1.7 }}>{insight}</pre>
              </div>
            )}
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
