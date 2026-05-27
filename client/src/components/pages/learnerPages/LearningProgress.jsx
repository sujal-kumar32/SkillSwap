import React, { useCallback, useEffect, useMemo, useState } from "react";
import { showToast } from "../../../utils/toastUtils";
import Apiservices from "../../../../Apiservices";
import { EmptyState, LoadingState, PageHeader, ProgressBar, StatCard } from "../../learner/LearnerUI";

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
          {items.length ? items.map((item) => (
            <div className="learner-card p-4 mb-4" key={item.skill}>
              <div className="d-flex justify-content-between mb-2">
                <div>
                  <h5 className="fw-bold mb-1">{item.skill}</h5>
                  <small className="text-muted">{item.sessions} sessions with {item.mentor}</small>
                </div>
                <strong>{item.completion}%</strong>
              </div>
              <ProgressBar value={item.completion} />
              <p className="text-muted small mt-3 mb-0"><strong>Mentor remark:</strong> {item.remark}</p>
            </div>
          )) : (
            <EmptyState title="No progress yet" text="Complete booked sessions to start tracking progress." actionLabel="Explore Sessions" actionTo="/learner/explore" />
          )}
        </div>
        <div className="col-lg-4">
          <div className="learner-card p-4 mb-4">
            <h5 className="fw-bold d-flex align-items-center" style={{ gap: 8 }}><i className="fa fa-chart-pie text-primary" />Skill Growth</h5>
            <div className="mt-3">
              {items.length
                ? items.slice(0, 5).map((item) => (
                    <div key={item.skill} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-light">
                      <small className="fw-semibold">{item.skill}</small>
                      <small className={`fw-bold ${item.completion >= 80 ? "text-success" : item.completion >= 40 ? "text-warning" : "text-muted"}`}>
                        {item.completion}%
                      </small>
                    </div>
                  ))
                : <p className="text-muted small mb-0">Complete sessions to track skill growth.</p>}
              {items.length > 5 && <small className="text-muted">+{items.length - 5} more skills</small>}
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
