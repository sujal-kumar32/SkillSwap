import React, { useCallback, useEffect, useMemo, useState } from "react";
import { showToast } from "../../../utils/toastUtils";
import Apiservices from "../../../../Apiservices";
import { EmptyState, LoadingState, PageHeader, StatCard } from "../../learner/LearnerUI";

const categoryGradients = {
  Technology: { bg: "#eef2ff", icon: "text-primary", bar: "linear-gradient(90deg, #0d6efd, #6610f2)" },
  Business: { bg: "#fefce8", icon: "text-warning", bar: "linear-gradient(90deg, #eab308, #ca8a04)" },
  Design: { bg: "#fdf2f8", icon: "text-danger", bar: "linear-gradient(90deg, #ec4899, #db2777)" },
  Marketing: { bg: "#f0fdf4", icon: "text-success", bar: "linear-gradient(90deg, #16a34a, #15803d)" },
  Music: { bg: "#f5f3ff", icon: "text-purple", bar: "linear-gradient(90deg, #7c3aed, #6d28d9)" },
};

const defaultCategory = { bg: "#f8fafc", icon: "text-muted", bar: "linear-gradient(90deg, #64748b, #475569)" };

const skillLevelColors = {
  beginner: { label: "Beginner", color: "#0d6efd" },
  intermediate: { label: "Intermediate", color: "#eab308" },
  advanced: { label: "Advanced", color: "#16a34a" },
  all: { label: "All Levels", color: "#64748b" },
};

const LearningProgress = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProgress = async () => {
      try {
        setError("");
        const response = await Apiservices.fetchProgress();
        setItems(response.data.data || []);
      } catch (error) {
        console.log(error);
        setItems([]);
        setError(error.response?.data?.message || "Failed to load progress");
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, []);

  const avg = useMemo(
    () => Math.round(items.reduce((sum, item) => sum + item.completion, 0) / (items.length || 1)),
    [items],
  );
  const completedSessions = useMemo(
    () => items.reduce((sum, item) => sum + (item.completedSessions || 0), 0),
    [items],
  );
  const totalSessions = useMemo(
    () => items.reduce((sum, item) => sum + (item.sessions || 0), 0),
    [items],
  );

  const completedSkills = useMemo(
    () => items.filter((i) => i.completion === 100),
    [items],
  );

  const groupedByCategory = useMemo(() => {
    const map = {};
    for (const item of items) {
      const cat = item.category || "General";
      if (!map[cat]) map[cat] = [];
      map[cat].push(item);
    }
    return map;
  }, [items]);

  const [downloading, setDownloading] = useState(null);

  const handleDownload = useCallback(async (skillName) => {
    setDownloading(skillName);
    try {
      const response = await Apiservices.downloadCertificate(skillName);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `certificate-${skillName.replace(/\s+/g, "-").toLowerCase()}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast.success("Certificate downloaded");
    } catch (error) {
      showToast.error(error.response?.data?.message || "Failed to download certificate");
    } finally {
      setDownloading(null);
    }
  }, []);

  if (loading) return <LoadingState label="Loading progress..." />;

  const catKeys = Object.keys(groupedByCategory);

  return (
    <>
      <PageHeader title="Learning Progress" subtitle="Track completion, skill growth, mentor remarks, and certificates." />
      {error && <div className="alert alert-danger rounded-4">{error}</div>}
      <div className="row g-4 mb-4">
        <StatCard icon="fa-chart-line" label="Average Progress" value={`${avg}%`} />
        <StatCard icon="fa-fire" label="Tracked Skills" value={items.length} tone="danger" />
        <StatCard icon="fa-check-circle" label="Completed Sessions" value={completedSessions} tone="success" />
        <StatCard icon="fa-certificate" label="Total Sessions" value={totalSessions} tone="warning" />
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          {items.length ? catKeys.map((category) => {
            const g = categoryGradients[category] || defaultCategory;
            return (
              <div key={category} className="mb-4">
                <div className="d-flex align-items-center mb-3" style={{ gap: 10 }}>
                  <i className={`fa ${items.find((i) => i.category === category)?.categoryIcon || "fa-folder"} ${g.icon}`} />
                  <h5 className="fw-bold mb-0">{category}</h5>
                </div>
                {groupedByCategory[category].map((item) => (
                  <div className="learner-card p-4 mb-3" key={item.skill}>
                    <div className="d-flex align-items-start justify-content-between mb-2" style={{ gap: 16 }}>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center" style={{ gap: 10 }}>
                          <div style={{
                            width: 40, height: 40, borderRadius: 10,
                            background: g.bg, display: "flex",
                            alignItems: "center", justifyContent: "center", flexShrink: 0,
                          }}>
                            <i className={`fa ${item.categoryIcon || "fa-code"} ${g.icon}`} />
                          </div>
                          <div>
                            <h5 className="fw-bold mb-0">{item.skill}</h5>
                            <div className="d-flex align-items-center" style={{ gap: 6 }}>
                              {item.skillLevel && item.skillLevel !== "all" && (
                                <span style={{
                                  fontSize: "0.65rem", fontWeight: 600, color: "white",
                                  background: skillLevelColors[item.skillLevel]?.color || "#64748b",
                                  padding: "2px 8px", borderRadius: 999,
                                }}>
                                  {skillLevelColors[item.skillLevel]?.label || item.skillLevel}
                                </span>
                              )}
                              <small className="text-muted">{item.sessions} session{item.sessions !== 1 ? "s" : ""} with {item.mentor}</small>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-end" style={{ flexShrink: 0 }}>
                        <div className="fw-bold" style={{ fontSize: "1.1rem", color: item.completion === 100 ? "#16a34a" : item.completion >= 50 ? "#0d6efd" : "#64748b" }}>
                          {item.completion}%
                        </div>
                        <small className="text-muted">{item.completedSessions}/{item.sessions} done</small>
                      </div>
                    </div>
                    <div style={{ height: 8, borderRadius: 99, background: "#eef2f6", overflow: "hidden", position: "relative" }}>
                      <div style={{
                        width: `${item.completion}%`, height: "100%",
                        background: g.bar,
                        borderRadius: 99, transition: "width 0.6s ease",
                      }} />
                    </div>
                    <p className="text-muted small mt-3 mb-0" style={{ fontStyle: "italic" }}>
                      <i className="fa fa-quote-left text-muted me-1" style={{ opacity: 0.4, fontSize: "0.7rem" }} />
                      {item.remark}
                    </p>
                  </div>
                ))}
              </div>
            );
          }) : (
            <EmptyState title="No progress yet" text="Complete booked sessions to start tracking progress." actionLabel="Explore Sessions" actionTo="/learner/explore" />
          )}
        </div>
        <div className="col-lg-4">
          <div className="learner-card p-4 mb-4">
            <h5 className="fw-bold d-flex align-items-center" style={{ gap: 8 }}><i className="fa fa-chart-pie text-primary" />Skill Growth</h5>
            <div className="mt-3">
              {items.length
                ? items.map((item) => {
                    const g = categoryGradients[item.category] || defaultCategory;
                    return (
                      <div key={item.skill} className="d-flex align-items-center mb-2 pb-2 border-bottom border-light" style={{ gap: 10 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 8,
                          background: g.bg, display: "flex",
                          alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          <i className={`fa ${item.categoryIcon || "fa-code"}`} style={{ fontSize: "0.7rem", color: g.icon.includes("text-") ? `var(--bs-${g.icon.replace("text-", "")})` : "#64748b" }} />
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between">
                            <small className="fw-semibold">{item.skill}</small>
                            <small className={`fw-bold ${item.completion >= 80 ? "text-success" : item.completion >= 40 ? "text-warning" : "text-muted"}`}>
                              {item.completion}%
                            </small>
                          </div>
                          <div style={{ height: 4, borderRadius: 99, background: "#eef2f6", overflow: "hidden", marginTop: 3 }}>
                            <div style={{
                              width: `${item.completion}%`, height: "100%",
                              background: g.bar, borderRadius: 99,
                            }} />
                          </div>
                        </div>
                      </div>
                    );
                  })
                : <p className="text-muted small mb-0">Complete sessions to track skill growth.</p>}
            </div>
          </div>
          <div className="learner-card p-4">
            <h5 className="fw-bold d-flex align-items-center" style={{ gap: 8 }}><i className="fa fa-certificate text-warning" />Certificates</h5>
            {completedSkills.length > 0 ? (
              <div>
                <p className="text-success small fw-semibold mb-2">
                  <i className="fa fa-check-circle" /> {completedSkills.length} skill{completedSkills.length > 1 ? "s" : ""} completed!
                </p>
                {completedSkills.slice(0, 3).map((item) => (
                  <div key={item.skill} className="d-flex align-items-center justify-content-between gap-2 mb-2 p-2 rounded-3" style={{ background: "#f0fdf4" }}>
                    <div className="d-flex align-items-center gap-2">
                      <i className="fa fa-trophy text-success" />
                      <small className="fw-semibold">{item.skill}</small>
                    </div>
                    <button
                      className="btn btn-sm btn-success rounded-pill px-3"
                      disabled={downloading === item.skill}
                      onClick={() => handleDownload(item.skill)}
                    >
                      {downloading === item.skill ? <span className="spinner-border spinner-border-sm" /> : "Download"}
                    </button>
                  </div>
                ))}
                {completedSkills.length > 3 && <small className="text-muted">+{completedSkills.length - 3} more</small>}
              </div>
            ) : (
              <p className="text-muted small mb-3">Complete all sessions in a skill to earn a certificate.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LearningProgress;
