import React, { useEffect, useMemo, useState } from "react";
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

  if (loading) return <LoadingState label="Loading progress..." />;

  return (
    <>
      <PageHeader title="Learning Progress" subtitle="Track completion, skill growth, mentor remarks, and certificates." />
      {error && <div className="alert alert-danger rounded-4">{error}</div>}
      <div className="row g-4 mb-4">
        <StatCard icon="fa-chart-line" label="Average Progress" value={`${avg}%`} />
        <StatCard icon="fa-fire" label="Tracked Skills" value={items.length} tone="danger" />
        <StatCard icon="fa-circle-check" label="Completed Sessions" value={completedSessions} tone="success" />
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
            <h5 className="fw-bold">Skill Growth</h5>
            <div className="bg-light rounded-4 p-5 text-center mt-3">
              <i className="fa fa-chart-pie fa-2x text-primary mb-3" />
              <p className="text-muted mb-0">Skill analytics are calculated from your completed bookings.</p>
            </div>
          </div>
          <div className="learner-card p-4">
            <h5 className="fw-bold">Certificates</h5>
            <p className="text-muted small">Certificates will appear after eligible completed learning paths.</p>
            <button className="btn btn-outline-primary rounded-pill w-100">View Certificates</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LearningProgress;
