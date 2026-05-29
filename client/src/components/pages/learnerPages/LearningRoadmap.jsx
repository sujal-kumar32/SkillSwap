import React, { useState } from "react";
import Apiservices from "../../../../Apiservices";
import { showToast } from "../../../utils/toastUtils";
import { PageHeader } from "../../learner/LearnerUI";

const skillSuggestions = [
  "React.js", "Node.js", "Python", "Machine Learning", "UI/UX Design",
  "Data Science", "AWS Cloud", "DevOps", "TypeScript", "Flutter",
  "Digital Marketing", "Public Speaking", "Blockchain", "Cybersecurity",
  "AI Engineering", "Mobile Development", "GraphQL", "Docker & Kubernetes"
];

const LearningRoadmap = () => {
  const [targetSkill, setTargetSkill] = useState("");
  const [currentLevel, setCurrentLevel] = useState("beginner");
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const generateRoadmap = async () => {
    if (!targetSkill.trim()) {
      showToast.warning("Enter a target skill");
      return;
    }
    setLoading(true);
    setRoadmap(null);
    try {
      const res = await Apiservices.generateRoadmap({
        targetSkill: targetSkill.trim(),
        currentLevel,
      });
      setRoadmap(res.data.data.roadmap);
      showToast.success("Learning roadmap generated!");
    } catch (err) {
      showToast.error(err.response?.data?.message || "Failed to generate roadmap");
    } finally {
      setLoading(false);
    }
  };

  const pickSuggestion = (skill) => {
    setTargetSkill(skill);
    setShowSuggestions(false);
  };

  return (
    <>
      <PageHeader title="AI Learning Roadmap" subtitle="Generate a personalized learning path from beginner to advanced." />

      <div className="learner-card p-4 p-lg-5 mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-5">
            <label className="form-label fw-semibold">Target Skill</label>
            <input
              type="text"
              className="form-control form-control-lg rounded-pill"
              placeholder="e.g. Machine Learning, React..."
              value={targetSkill}
              onChange={(e) => setTargetSkill(e.target.value)}
              autoComplete="off"
            />
            <div className="d-flex flex-wrap" style={{ marginTop: 12, marginBottom: 8, gap: 10 }}>
              {skillSuggestions.filter((s) => s.toLowerCase().includes(targetSkill.toLowerCase())).slice(0, 6).map((s) => (
                <span key={s} className="badge border rounded-pill px-3 py-2 fw-normal"
                  style={{ cursor: "pointer", background: targetSkill === s ? "#198754" : "#f1f5f9", color: targetSkill === s ? "#fff" : "#475569", transition: "all 0.15s" }}
                  onClick={() => pickSuggestion(s)}>
<span className="d-inline-flex align-items-center" style={{ gap: 5 }}><i className="fa fa-code" style={{ fontSize: "0.7rem" }}></i>{s}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="col-md-3">
            <div className="d-flex align-items-center" style={{ gap: 14 }}>
              <label className="form-label fw-semibold mb-0" style={{ whiteSpace: "nowrap" }}>Your Level</label>
              <select className="form-select form-select-lg rounded-pill" value={currentLevel} onChange={(e) => setCurrentLevel(e.target.value)}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
          <div className="col-md-4 d-flex flex-column justify-content-end">
            <button
              className="btn rounded-pill w-100 fw-bold border-0 d-flex align-items-center justify-content-center"
              onClick={generateRoadmap}
              disabled={loading || !targetSkill.trim()}
              style={{
                background: "linear-gradient(135deg, #0d6efd, #6610f2)",
                color: "white",
                padding: "16px 30px",
                fontSize: "1rem",
                opacity: loading ? 0.7 : 1,
                transition: "all 0.3s",
                boxShadow: loading ? "none" : "0 4px 14px rgba(102,16,242,0.3)",
                gap: 10,
              }}
            >
              {loading ? (
                <><span className="spinner-border spinner-border-sm" role="status" /> Generating...</>
              ) : (
                <><i className="fa fa-magic" /> Generate Roadmap</>
              )}
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="learner-card p-5 text-center">
          <div className="spinner-border text-success mb-3" role="status" style={{ width: "3rem", height: "3rem" }} />
          <h5 className="fw-bold">Creating your learning path...</h5>
          <p className="text-muted mb-0">SkillSwap AI is building a personalized roadmap for {targetSkill}</p>
        </div>
      )}

      {roadmap && !loading && (
        <div className="learner-card p-4 p-lg-5">
          <div className="d-flex align-items-center mb-4 pb-3 border-bottom" style={{ gap: 10 }}>
            <div className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 52, height: 52 }}>
              <i className="fa fa-road text-success"></i>
            </div>
            <div className="min-w-0">
              <h4 className="fw-bold mb-1 text-truncate">{targetSkill}</h4>
              <p className="text-muted mb-0 small">Starting from <span className="fw-semibold text-capitalize">{currentLevel}</span> level</p>
            </div>
          </div>

          <div className="bg-light rounded-4 p-4">
            <pre className="mb-0" style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", lineHeight: 1.8, fontSize: "0.95rem" }}>
              {roadmap}
            </pre>
          </div>

          <div className="mt-4 d-flex gap-3">
            <button className="btn btn-success rounded-pill px-4 fw-semibold d-inline-flex align-items-center" style={{ gap: 8 }} onClick={generateRoadmap} disabled={loading}>
              <i className="fa fa-refresh" />Regenerate
            </button>
            <button className="btn btn-outline-primary rounded-pill px-4 fw-semibold d-inline-flex align-items-center" style={{ gap: 8 }} onClick={() => setRoadmap(null)}>
              <i className="fa fa-times" />Clear
            </button>
          </div>
        </div>
      )}

      {!roadmap && !loading && (
        <div className="row g-4">
          <div className="col-md-4">
            <div className="learner-card p-4 text-center h-100">
              <i className="fa fa-bullseye text-primary mb-3 d-block" style={{ fontSize: "1.8rem" }} />
              <h5 className="fw-bold">Set Your Goal</h5>
              <p className="text-muted small mb-0">Tell us what skill you want to master and your current level.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="learner-card p-4 text-center h-100">
              <i className="fa fa-route text-success mb-3 d-block" style={{ fontSize: "1.8rem" }} />
              <h5 className="fw-bold">Get Your Roadmap</h5>
              <p className="text-muted small mb-0">AI generates a structured path with phases, milestones, and resources.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="learner-card p-4 text-center h-100">
              <i className="fa fa-rocket text-warning mb-3 d-block" style={{ fontSize: "1.8rem" }} />
              <h5 className="fw-bold">Start Learning</h5>
              <p className="text-muted small mb-0">Follow the roadmap, book sessions, and track your progress.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LearningRoadmap;
