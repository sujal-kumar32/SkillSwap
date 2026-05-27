import React, { useEffect, useState } from "react";
import Apiservices from "../../../../Apiservices";
import { EmptyState, LoadingState, PageHeader } from "../../learner/LearnerUI";

const rankColors = [
  { bg: "#fef3c7", border: "#fbbf24", text: "#92400e", icon: "fa-crown" },
  { bg: "#f1f5f9", border: "#cbd5e1", text: "#475569", icon: "fa-medal" },
  { bg: "#fef2f2", border: "#fca5a5", text: "#991b1b", icon: "fa-medal" },
];

const LearnerLeaderboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("mentors");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [period, setPeriod] = useState("all");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        setError("");
        const fetcher = tab === "mentors" ? Apiservices.getMentorLeaderboard({ period, page, limit: 20 }) : Apiservices.getLearnerLeaderboard({ page, limit: 20 });
        const res = await fetcher;
        if (!cancelled) {
          setData(res.data.data || []);
          setTotal(res.data.total || 0);
        }
      } catch {
        if (!cancelled) setError("Failed to load leaderboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [tab, page, period]);

  const pages = Math.max(1, Math.ceil(total / 20));

  return (
    <>
      <PageHeader
        title="Leaderboard"
        subtitle="Top mentors and learners ranked by XP, sessions, and achievements."
      />

      {error && <div className="alert alert-danger rounded-4">{error}</div>}

      <div className="learner-card p-4 mb-4">
        <div className="d-flex flex-wrap" style={{ gap: "10px" }}>
          <button
            className={`btn rounded-pill px-4 fw-semibold ${tab === "mentors" ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => { setTab("mentors"); setPage(1); }}
          >
<span className="d-inline-flex align-items-center" style={{ gap: 8 }}><i className="fa fa-chalkboard-teacher" />Mentors</span>
          </button>
          <button
            className={`btn rounded-pill px-4 fw-semibold ${tab === "learners" ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => { setTab("learners"); setPage(1); }}
          >
<span className="d-inline-flex align-items-center" style={{ gap: 8 }}><i className="fa fa-graduation-cap" />Learners</span>
          </button>
          {tab === "mentors" && (
            <>
              <span className="border-start mx-1" />
              {[
                { value: "all", label: "All Time" },
                { value: "monthly", label: "This Month" },
                { value: "weekly", label: "This Week" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  className={`btn rounded-pill px-3 fw-semibold ${period === opt.value ? "btn-outline-primary" : "btn-outline-secondary"}`}
                  style={{ fontSize: "0.8rem" }}
                  onClick={() => { setPeriod(opt.value); setPage(1); }}
                >
                  {opt.label}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {loading ? <LoadingState label="Loading leaderboard..." /> : data.length ? (
        <div className="d-flex flex-column" style={{ gap: "10px" }}>
          {data.map((item, index) => {
            const rank = (page - 1) * 20 + index + 1;
            const rc = rankColors[index] || { bg: "transparent", border: "transparent", text: "#64748b", icon: "" };
            const isTop3 = rank <= 3;
            return (
              <div key={item._id} className="learner-card p-3" style={{
                border: isTop3 ? `1px solid ${rc.border}` : "1px solid #eef2f7",
                background: isTop3 ? rc.bg : "#fff",
              }}>
                <div className="d-flex align-items-center" style={{ gap: "12px" }}>
                  <div className="text-center fw-bold" style={{
                    minWidth: 36, fontSize: isTop3 ? "1.1rem" : "0.9rem",
                    color: isTop3 ? rc.text : "#94a3b8",
                  }}>
                    {isTop3 ? <i className={`fa ${rc.icon}`} /> : `#${rank}`}
                  </div>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, overflow: "hidden", flexShrink: 0,
                    background: "#f1f5f9", display: "grid", placeItems: "center",
                  }}>
                    {item.profileImage ? (
                      <img src={item.profileImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <i className="fa fa-user text-muted" />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h6 className="fw-bold mb-0" style={{ fontSize: "0.9rem" }}>{item.name}</h6>
                    <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                      Level {item.level} &middot; {item.badges} badge{item.badges !== 1 ? "s" : ""}
                    </small>
                  </div>
                  <div className="d-flex align-items-center" style={{ gap: "20px" }}>
                    <div className="text-center">
                      <div className="fw-bold text-primary" style={{ fontSize: "0.9rem" }}>{item.xp.toLocaleString()}</div>
                      <small className="text-muted" style={{ fontSize: "0.65rem" }}>XP</small>
                    </div>
                    <div className="text-center">
                      <div className="fw-bold text-success" style={{ fontSize: "0.9rem" }}>{item.sessionsCompleted}</div>
                      <small className="text-muted" style={{ fontSize: "0.65rem" }}>Sessions</small>
                    </div>
                    {tab === "mentors" && (
                      <div className="text-center">
                        <div className="fw-bold text-warning" style={{ fontSize: "0.9rem" }}>
                          {item.avgRating > 0 ? item.avgRating.toFixed(1) : "—"}
                        </div>
                        <small className="text-muted" style={{ fontSize: "0.65rem" }}>Rating</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No data yet" text="Activity will appear here as sessions are completed." />
      )}

      {pages > 1 && (
        <div className="d-flex justify-content-center align-items-center" style={{ gap: "10px", marginTop: "20px" }}>
          <button className="btn btn-sm btn-outline-secondary rounded-pill px-4 fw-semibold d-inline-flex align-items-center" style={{ gap: 6 }} disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            <i className="fa fa-chevron-left" />Prev
          </button>
          <span className="fw-semibold text-muted" style={{ fontSize: "0.85rem" }}>Page {page} of {pages}</span>
          <button className="btn btn-sm btn-outline-secondary rounded-pill px-4 fw-semibold d-inline-flex align-items-center" style={{ gap: 6 }} disabled={page === pages} onClick={() => setPage((p) => p + 1)}>
            Next<i className="fa fa-chevron-right" />
          </button>
        </div>
      )}
    </>
  );
};

export default LearnerLeaderboard;
