import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Apiservices from "../../../Apiservices";
import FeedCard from "../shared/FeedCard";
import TopBar from "../layout/user/TopBar";
import { LoadingState } from "../learner/LearnerUI";
import FollowButton from "../shared/FollowButton";

const Feed = () => {
  const [tab, setTab] = useState("following");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);

  const load = useCallback(async (pageNum = 1, append = false) => {
    setLoading(true);
    try {
      const res = await Apiservices.getFeed({ tab, page: pageNum, limit: 20 });
      const data = res.data.data || [];
      setEvents(append ? (prev) => [...prev, ...data] : data);
      setPagination(res.data.pagination || null);
    } catch {
      if (!append) setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    setPage(1);
    load(1);
  }, [load]);

  useEffect(() => {
    setSuggestionsLoading(true);
    Apiservices.getFollowSuggestions({ limit: 4 }).then((res) => {
      setSuggestions(res.data.data || []);
    }).catch(() => {}).finally(() => setSuggestionsLoading(false));
  }, []);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    load(next, true);
  };

  const tabs = [
    { id: "following", label: "Following", icon: "fa-users" },
    { id: "foryou", label: "For You", icon: "fa-compass" },
  ];

  return (
    <>
      <TopBar />
      <div className="bg-image" style={{ minHeight: "calc(100vh - 64px)" }}>
        <div className="container py-4">
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                  <h4 className="fw-bold mb-1">Activity Feed</h4>
                  <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
                    {tab === "following" ? "Updates from people you follow" : "Discover what's happening on SkillSwap"}
                  </p>
                </div>
              </div>

              <div className="d-flex mb-4" style={{ gap: "14px", borderBottom: "1px solid #eef2f7" }}>
                {tabs.map((t) => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`btn btn-sm rounded-top-3 fw-semibold px-4 py-2 ${tab === t.id ? "btn-primary" : "btn-outline-secondary border-0"}`}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
                    <i className={`fa ${t.icon}`} style={{ marginRight: 8 }} />{t.label}
                  </button>
                ))}
              </div>

              {loading && events.length === 0 ? (
                <LoadingState />
              ) : events.length === 0 ? (
                <div className="text-center py-5">
                  <div style={{ width: 64, height: 64, borderRadius: 16, margin: "0 auto 16px", background: "#f1f5f9", display: "grid", placeItems: "center" }}>
                    <i className="fa fa-stream" style={{ color: "#94a3b8", fontSize: "1.5rem" }} />
                  </div>
                  <h5 className="fw-bold mb-2">No activity yet</h5>
                  <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                    {tab === "following"
                      ? "Follow other users to see their activity here."
                      : "Be the first to create sessions, write reviews, and earn badges!"}
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {events.map((ev) => (
                    <FeedCard key={ev._id} event={ev} />
                  ))}
                </div>
              )}

              {pagination && page < pagination.pages && (
                <div className="text-center mt-4">
                  <button className="btn btn-outline-primary rounded-pill px-5 fw-semibold" onClick={loadMore} disabled={loading}>
                    {loading ? <span className="spinner-border spinner-border-sm" /> : "Load More"}
                  </button>
                </div>
              )}
            </div>

            <div className="col-lg-4">
              <div className="learner-card p-3" style={{ position: "sticky", top: 80 }}>
                <h6 className="fw-bold mb-3"><i className="fa fa-user-plus text-primary" style={{ marginRight: 12 }} />Suggested for you</h6>
                {suggestionsLoading ? (
                  <div className="text-center py-3">
                    <div className="spinner-border spinner-border-sm text-primary" role="status" />
                  </div>
                ) : suggestions.length === 0 ? (
                  <p className="text-muted text-center small py-2 mb-0">No suggestions yet</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {suggestions.map((u) => (
                      <div key={u._id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Link to={`/profile/${u._id}`} style={{ flexShrink: 0 }}>
                          <img
                            src={u.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=0d6efd&color=fff&size=36`}
                            alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                        </Link>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Link to={`/profile/${u._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                            <div className="fw-semibold" style={{ fontSize: "0.82rem", lineHeight: 1.2 }}>{u.name}</div>
                          </Link>
                          <small className="text-muted" style={{ fontSize: "0.65rem" }}>
                            {u.followerCount || 0} followers{u.overlap > 0 ? ` · ${u.overlap} shared` : ""}
                          </small>
                        </div>
                        <FollowButton userId={u._id} size="sm" />
                      </div>
                    ))}
                  </div>
                )}
                </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Feed;
