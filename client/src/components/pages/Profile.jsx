import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TopBar from "../layout/user/TopBar";
import { showToast } from "../../utils/toastUtils";
import Apiservices from "../../../Apiservices";
import { LoadingState } from "../learner/LearnerUI";
import UserLink from "../shared/UserLink";
import { useAuth } from "../../App";

const badge = (status) => {
  const bg = {
    accepted: "linear-gradient(135deg, #16a34a, #15803d)",
    active: "linear-gradient(135deg, #16a34a, #15803d)",
    pending: "linear-gradient(135deg, #eab308, #ca8a04)",
    completed: "linear-gradient(135deg, #0d6efd, #0a58ca)",
    cancelled: "linear-gradient(135deg, #64748b, #475569)",
    rejected: "linear-gradient(135deg, #dc2626, #b91c1c)",
  };
  const c = status === "pending" ? "#1e293b" : "white";
  return <span style={{ background: bg[status] || "linear-gradient(135deg, #64748b, #475569)", color: c, padding: "4px 14px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.3px" }}>{status}</span>;
};

const Profile = () => {
  const { user } = useAuth();
  const isMentor = user?.roles?.includes("mentor");
  const [profile, setProfile] = useState({ name: "", email: "", bio: "", interests: "", goals: "", skills: [], image: "", phone: "", timezone: "", linkedin: "", github: "", portfolio: "", youtube: "", twitter: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("about");
  const [stats, setStats] = useState({ sessions: 0, reviews: 0, skills: 0 });
  const [avgRating, setAvgRating] = useState(null);
  const [mentorSessions, setMentorSessions] = useState([]);
  const [learnerSessions, setLearnerSessions] = useState([]);
  const [journeyLoading, setJourneyLoading] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [xpHistory, setXpHistory] = useState([]);
  const [xpHistoryOpen, setXpHistoryOpen] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, sRes, badgeRes, allRes, xpRes] = await Promise.all([
          Apiservices.getProfile(),
          Apiservices.getProfileStats().catch(() => ({ data: { data: {} } })),
          Apiservices.getMyBadges().catch(() => ({ data: { data: [] } })),
          Apiservices.getAllBadges().catch(() => ({ data: { data: [] } })),
          Apiservices.getXpHistory({ limit: 50 }).catch(() => ({ data: { data: [] } })),
        ]);
        setEarnedBadges(badgeRes.data?.data || []);
        setAllBadges(allRes.data?.data || []);
        setXpHistory(xpRes.data?.data || []);
        const u = pRes.data.data || {};
        setProfile({
          name: u.name || "", email: u.email || "", bio: u.bio || "",
          image: u.profileImage || "", coverImage: u.coverImage || "",
          interests: (u.interests || []).join(", "), goals: u.learningGoals || "",
          skills: u.skills || [],
          phone: u.phone || "", timezone: u.timezone || "UTC",
          linkedin: u.socialLinks?.linkedin || "", github: u.socialLinks?.github || "",
          portfolio: u.socialLinks?.portfolio || "", youtube: u.socialLinks?.youtube || "",
          twitter: u.socialLinks?.twitter || "",
          followerCount: u.followerCount || 0, followingCount: u.followingCount || 0,
        });
        if (sRes.data?.data) {
          setStats(sRes.data.data);
          if (isMentor && sRes.data.data.reviews > 0) {
            const reviewRes = await Apiservices.fetchReviews({ limit: 100 }).catch(() => ({ data: { data: [] } }));
            const mentorReviews = reviewRes.data.data || [];
            if (mentorReviews.length) {
              const avg = (mentorReviews.reduce((s, r) => s + r.rating, 0) / mentorReviews.length).toFixed(1);
              setAvgRating(avg);
            }
          }
        }
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (activeTab !== "journey") return;
    const fetchJourneyData = async () => {
      setJourneyLoading(true);
      try {
        const promises = [];
        promises.push(
          Apiservices.getMySessions({ page: 1, limit: 20 })
            .then((res) => setMentorSessions(res.data.data?.sessions || res.data.data || []))
            .catch(() => setMentorSessions([]))
        );
        promises.push(
          Apiservices.fetchBookings()
            .then((res) => setLearnerSessions(res.data.data?.requests || res.data.data || []))
            .catch(() => setLearnerSessions([]))
        );
        await Promise.all(promises);
      } catch {
        setMentorSessions([]);
        setLearnerSessions([]);
      } finally {
        setJourneyLoading(false);
      }
    };
    fetchJourneyData();
  }, [activeTab]);

  const skillLevel = (l) => l === "advanced" ? 100 : l === "intermediate" ? 65 : 35;

  if (loading) {
    return (
      <>
        <TopBar />
        <div className="bg-image" style={{ minHeight: "calc(100vh - 64px)" }}>
          <LoadingState />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <TopBar />
        <div className="bg-image" style={{ minHeight: "calc(100vh - 64px)" }}>
          <div className="container py-5">
            <div className="alert alert-danger text-center py-5">
              <i className="fa fa-exclamation-triangle fa-2x mb-3" />
              <h4 className="fw-bold">Failed to load profile</h4>
              <p className="mb-0">{error}</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar />
      <div className="bg-image" style={{ minHeight: "calc(100vh - 64px)" }}>
        {/* Cover */}
        <div style={{ height: 200, background: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)" }} />

        {/* Profile Header */}
        <div className="container" style={{ marginTop: -80 }}>
          <div className="learner-card p-4 mb-4" style={{ position: "relative" }}>
            <Link to="/settings" className="btn btn-outline-primary rounded-pill px-4 fw-semibold" style={{
              position: "absolute", top: 16, right: 16, zIndex: 2,
            }}>
              <i className="fa fa-pen" style={{ marginRight: 10 }} />Edit Profile
            </Link>
            <div className="d-flex flex-wrap align-items-end" style={{ gap: 26 }}>
              <img src={profile.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=0d6efd&color=fff&size=128`}
                alt="" className="rounded-circle border border-4 border-white shadow-sm avatar-responsive-lg profile-avatar-neg" style={{ objectFit: "cover" }} />
              <div className="flex-grow-1">
                <div className="d-flex flex-wrap align-items-center" style={{ gap: "10px" }}>
                  <h2 className="fw-bold mb-0">{profile.name}</h2>
                  <span style={{ background: "linear-gradient(135deg, #0891b2, #0e7490)", color: "white", padding: "4px 14px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.3px" }}>
                    <i className="fa fa-graduation-cap" style={{ marginRight: 5 }} />Learner
                  </span>
                  {isMentor && <span style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white", padding: "4px 14px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.3px" }}>
                    <i className="fa fa-chalkboard" style={{ marginRight: 5 }} />Mentor
                  </span>}
                </div>
                <p className="text-muted mb-1" style={{ marginTop: 4 }}>{profile.email}</p>
                  <div className="d-flex align-items-center flex-wrap" style={{ gap: "12px", marginTop: "8px" }}>
                    <div className="d-flex align-items-center" style={{ gap: "6px" }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 6,
                        background: "linear-gradient(135deg, #0d6efd20, #6610f220)",
                        display: "grid", placeItems: "center", color: "#0d6efd", fontSize: "0.75rem",
                      }}>
                        <i className="fa fa-bolt" />
                      </div>
                      <span className="fw-bold" style={{ fontSize: "0.9rem" }}>Lv.{user?.level || 1}</span>
                    </div>
                    <button className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-semibold" style={{ fontSize: "0.8rem" }}
                      onClick={() => { setShowFollowers(true); Apiservices.getFollowers(user?._id, { limit: 50 }).then(r => setFollowers(r.data.data || [])).catch(() => {}); }}>
                      <strong>{profile.followerCount}</strong> Followers
                    </button>
                    <button className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-semibold" style={{ fontSize: "0.8rem" }}
                      onClick={() => { setShowFollowing(true); Apiservices.getFollowing(user?._id, { limit: 50 }).then(r => setFollowing(r.data.data || [])).catch(() => {}); }}>
                      <strong>{profile.followingCount}</strong> Following
                    </button>
                  </div>
                  <div style={{ maxWidth: 300, marginTop: 8 }}>
                    <div style={{ height: 4, background: "#eef2f7", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 999,
                        width: `${Math.min(100, ((user?.xp || 0) - 25 * (user?.level || 1) * ((user?.level || 1) - 1)) / (50 * (user?.level || 1)) * 100)}%`,
                        background: "linear-gradient(90deg, #0d6efd, #6610f2)",
                        transition: "width 0.5s ease",
                      }} />
                    </div>
                    <small className="text-muted" style={{ fontSize: "0.6rem" }}>
                      {(user?.xp || 0) - 25 * (user?.level || 1) * ((user?.level || 1) - 1)} / {50 * (user?.level || 1)} XP
                    </small>
                  </div>
                {profile.bio && <p className="mb-0 small" style={{ marginTop: "6px" }}>{profile.bio}</p>}
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="row g-3 mb-4">
            {[
              { label: "Sessions", value: stats.sessions, icon: "fa-video", color: "primary" },
              { label: "Reviews", value: stats.reviews, icon: "fa-star", color: "warning" },
              ...(isMentor && avgRating ? [{ label: "Avg Rating", value: avgRating, icon: "fa-star-half-stroke", color: "warning" }] : []),
              { label: "Skills", value: stats.skills, icon: "fa-code", color: "success" },
              { label: profile.skills.length ? "Profile Skills" : "Interests", value: profile.skills.length || profile.interests.split(",").filter(Boolean).length, icon: "fa-lightbulb", color: "info" },
            ].map((s) => (
              <div className="col-sm-6 col-lg-3" key={s.label}>
                <div className="learner-card p-3 d-flex align-items-center h-100">
                  <div style={{ width: 50, textAlign: "center", flexShrink: 0 }}>
                    <i className={`fa ${s.icon} text-${s.color}`} style={{ fontSize: "1.5rem" }} />
                  </div>
                  <div style={{ borderLeft: "1px solid #e2e8f0", paddingLeft: 16 }}>
                    <h4 className="fw-bold mb-0">{s.value}</h4>
                    <small className="text-muted">{s.label}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="d-flex gap-2 mb-4 flex-wrap" style={{ borderBottom: "1px solid #eef2f7" }}>
            {[
              { id: "about", label: "About", icon: "fa-user" },
              { id: "skills", label: "Skills", icon: "fa-code" },
              { id: "journey", label: "Journey", icon: "fa-road" },
              { id: "social", label: "Connect", icon: "fa-share-alt" },
            ].map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`btn btn-sm rounded-top-3 fw-semibold px-4 py-2 ${activeTab === t.id ? "btn-primary" : "btn-outline-secondary border-0"}`}
                style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
                <i className={`fa ${t.icon}`} style={{ marginRight: 10 }} />{t.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "about" && (
            <div className="row g-4">
              <div className="col-lg-8">
                <div className="learner-card p-4 mb-4">
                  <div className="d-flex align-items-center mb-4">
                    <div style={{ width: 50, textAlign: "center", flexShrink: 0 }}>
                      <i className="fa fa-info-circle text-primary" style={{ fontSize: "1.1rem" }} />
                    </div>
                    <h5 className="fw-bold mb-0">About</h5>
                  </div>
                  <div className="d-flex">
                    <div style={{ width: 50, textAlign: "center", flexShrink: 0 }}>
                      <i className="fa fa-quote-left text-muted" style={{ fontSize: "1.1rem" }} />
                    </div>
                    <div style={{ borderLeft: "1px solid #e2e8f0", paddingLeft: 16 }} className="flex-grow-1">
                      {profile.bio ? <p className="mb-0">{profile.bio}</p> : <p className="text-muted fst-italic mb-0">No bio added yet.</p>}
                    </div>
                  </div>
                  {profile.goals && (
                    <div className="d-flex mt-4">
                      <div style={{ width: 50, textAlign: "center", flexShrink: 0 }}>
                        <i className="fa fa-bullseye text-success" style={{ fontSize: "1.1rem" }} />
                      </div>
                      <div style={{ borderLeft: "1px solid #e2e8f0", paddingLeft: 16 }} className="flex-grow-1">
                        <h6 className="fw-bold mb-1">Goals</h6>
                        <p className="mb-0">{profile.goals}</p>
                      </div>
                    </div>
                  )}
                  {profile.interests && (
                    <div className="d-flex mt-4">
                      <div style={{ width: 50, textAlign: "center", flexShrink: 0 }}>
                        <i className="fa fa-heart text-danger" style={{ fontSize: "1.1rem" }} />
                      </div>
                      <div style={{ borderLeft: "1px solid #e2e8f0", paddingLeft: 16 }} className="flex-grow-1">
                        <h6 className="fw-bold mb-2">Interests</h6>
                        <div className="d-flex flex-wrap gap-2">
                          {profile.interests.split(",").map((i) => i.trim()).filter(Boolean).map((i) => (
                            <span key={i} style={{ background: "linear-gradient(135deg, #64748b, #475569)", color: "white", padding: "4px 14px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.3px" }}>{i}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-lg-4">
                <div className="learner-card p-4 mb-4">
                  <div className="d-flex align-items-center mb-3">
                    <div style={{ width: 50, textAlign: "center", flexShrink: 0 }}>
                      <i className="fa fa-trophy text-warning" style={{ fontSize: "1.1rem" }} />
                    </div>
                    <h5 className="fw-bold mb-0">Badges</h5>
                  </div>

                  <div>
                    <p className="fw-semibold small text-muted mb-2">{earnedBadges.length} / {allBadges.length} badges earned</p>
                    <div className="d-flex flex-wrap" style={{ gap: "10px", marginBottom: "12px" }}>
                      {earnedBadges.slice(0, 6).map((b) => (
                        <div key={b._id} className="text-center" title={b.description} style={{ cursor: "default" }}>
                          <div style={{
                            width: 42, height: 42, borderRadius: 12,
                            background: `${b.color}18`, display: "grid", placeItems: "center",
                            color: b.color, fontSize: "1rem", marginBottom: 2,
                          }}>
                            <i className={`fa ${b.icon}`} />
                          </div>
                          <small style={{ fontSize: "0.6rem", color: "#64748b", display: "block", lineHeight: 1.1 }}>{b.name}</small>
                        </div>
                      ))}
                      {earnedBadges.length > 6 && (
                        <div className="d-flex align-items-center">
                          <small className="text-muted fw-semibold">+{earnedBadges.length - 6} more</small>
                        </div>
                      )}
                    </div>
                    {earnedBadges.length === 0 && (
                      <div className="text-center py-3">
                        <div style={{ width: 48, height: 48, borderRadius: 14, margin: "0 auto 8px", background: "#f1f5f9", display: "grid", placeItems: "center", color: "#94a3b8", fontSize: "1.1rem" }}>
                          <i className="fa fa-trophy" />
                        </div>
                        <p className="fw-semibold mb-0" style={{ fontSize: "0.8rem" }}>No badges earned yet</p>
                        <small className="text-muted" style={{ fontSize: "0.7rem" }}>Complete sessions and reviews to earn badges</small>
                      </div>
                    )}
                    <button
                      className="btn btn-sm btn-outline-primary rounded-pill w-100 fw-semibold"
                      onClick={() => setShowAllBadges(true)}
                    >
                      <i className="fa fa-list me-2" />View All Badges
                    </button>
                  </div>
                </div>
                <div className="learner-card p-4 mb-4">
                  <div className="d-flex align-items-center justify-content-between" style={{ cursor: "pointer" }} onClick={() => setXpHistoryOpen(!xpHistoryOpen)}>
                    <div className="d-flex align-items-center">
                      <div style={{ width: 50, textAlign: "center", flexShrink: 0 }}>
                        <i className="fa fa-history" style={{ fontSize: "1rem", color: "#0ea5e9" }} />
                      </div>
                      <h5 className="fw-bold mb-0">XP History</h5>
                    </div>
                    <i className={`fa fa-chevron-${xpHistoryOpen ? "up" : "down"} text-muted`} />
                  </div>
                  {xpHistoryOpen && (
                    <div style={{ marginTop: 12 }}>
                      {xpHistory.length > 0 ? (
                        <div className="d-flex flex-column" style={{ gap: "8px" }}>
                          {xpHistory.slice(0, 10).map((t) => (
                            <div key={t._id} className="d-flex align-items-center" style={{ gap: "10px", padding: "8px 12px", background: "#f8fafc", borderRadius: 10 }}>
                              <div style={{
                                width: 28, height: 28, borderRadius: 8,
                                background: "linear-gradient(135deg, #0d6efd15, #6610f215)",
                                display: "grid", placeItems: "center", color: "#0d6efd", fontSize: "0.7rem", flexShrink: 0,
                              }}>
                                <i className="fa fa-bolt" />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="fw-semibold" style={{ fontSize: "0.75rem", lineHeight: 1.2 }}>+{t.amount} XP</div>
                                <small style={{ fontSize: "0.65rem", color: "#94a3b8" }}>{t.reason}</small>
                              </div>
                              <small style={{ fontSize: "0.6rem", color: "#94a3b8", flexShrink: 0 }}>
                                {new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </small>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted small mb-0 text-center py-3">No XP history yet. Complete sessions to earn XP.</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="learner-card p-4">
                  <h5 className="fw-bold mb-3"><i className="fa fa-robot text-info" style={{ marginRight: 10 }} />SwapMind AI</h5>
                  <p className="text-muted small mb-0">AI-powered learning insights coming soon. Get personalized recommendations based on your profile and activity.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "skills" && (
            <div className="row g-4">
              {profile.skills.length > 0 ? profile.skills.map((s, i) => (
                <div className="col-md-6 col-lg-4" key={i}>
                  <div className="learner-card p-4 h-100">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="fw-bold mb-0 text-capitalize">{s.name}</h6>
                      <span style={{ background: s.level === "advanced" ? "linear-gradient(135deg, #16a34a, #15803d)" : s.level === "intermediate" ? "linear-gradient(135deg, #eab308, #ca8a04)" : "linear-gradient(135deg, #0d6efd, #0a58ca)", color: s.level === "intermediate" ? "#1e293b" : "white", padding: "4px 14px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.3px" }}>
                        {s.level}
                      </span>
                    </div>
                    <div className="progress" style={{ height: 8, borderRadius: 99 }}>
                      <div className={`progress-bar ${s.level === "advanced" ? "bg-success" : s.level === "intermediate" ? "bg-warning" : "bg-info"}`}
                        style={{ width: `${skillLevel(s.level)}%`, borderRadius: 99 }} />
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-12">
                  <div className="learner-card p-5 text-center">
                    <i className="fa fa-code fa-2x text-muted mb-3 d-block" />
                    <h5 className="fw-bold">No skills added</h5>
                    <p className="text-muted mb-0">Add skills to showcase your expertise.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "journey" && (
            <div className="learner-card p-4">
              <div className="d-flex align-items-center mb-4 pb-2" style={{ gap: 10, borderBottom: "1px solid #eef2f7" }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: "linear-gradient(135deg, #0d6efd, #6610f2)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 6px 16px rgba(102,16,242,0.25)",
                }}>
                  <i className="fa fa-road" style={{ color: "white", fontSize: "1.3rem" }} />
                </div>
                <div>
                  <h5 className="fw-bold mb-1">Journey</h5>
                  <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>Track your progress and activity</p>
                </div>
              </div>

              {journeyLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" style={{ width: 32, height: 32 }} />
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                  {/* Mentor Journey */}
                  <div>
                    <div className="d-flex align-items-center mb-3" style={{ gap: 10 }}>
                      <i className="fa fa-chalkboard" style={{ color: "#4f46e5", fontSize: "1.1rem" }} />
                      <div style={{ width: 3, height: 22, borderRadius: 2, background: "linear-gradient(180deg, #0d6efd, #6610f2)" }} />
                      <h6 className="fw-bold mb-0">Mentor Journey</h6>
                    </div>
                    {mentorSessions.length === 0 ? (
                      <div className="text-center py-4" style={{ background: "#fafbfc", borderRadius: 20 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 16, margin: "0 auto 12px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <i className="fa fa-video" style={{ color: "#94a3b8", fontSize: "1.3rem" }} />
                        </div>
                        <p className="fw-semibold mb-1" style={{ fontSize: "0.9rem" }}>No sessions created yet</p>
                        <small className="text-muted">Create your first session to start mentoring</small>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {mentorSessions.map((s) => {
                          const date = s.date ? new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
                          const skill = s.skillId?.name || "";
                          return (
                            <div key={s._id} style={{ background: "#fafbfc", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", gap: 20 }}>
                              <div style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0, background: "linear-gradient(135deg, #eef2ff, #e0e7ff)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <i className="fa fa-chalkboard" style={{ color: "#4f46e5", fontSize: "1.1rem" }} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="fw-bold mb-2" style={{ fontSize: "0.95rem" }}>{s.title}</div>
                                <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                                  {date && <span style={{ fontSize: "0.8rem", color: "#64748b" }}><i className="fa fa-calendar" style={{ color: "#94a3b8", marginRight: 10 }} />{date}</span>}
                                  {skill && <span style={{ fontSize: "0.8rem", color: "#64748b" }}><i className="fa fa-tag" style={{ color: "#94a3b8", marginRight: 10 }} />{skill}</span>}
                                  <span style={{ fontSize: "0.8rem", color: "#64748b" }}><i className="fa fa-users" style={{ color: "#94a3b8", marginRight: 10 }} />{s.bookings || 0} bookings</span>
                                </div>
                              </div>
                              {badge(s.status)}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Learner Journey */}
                  <div>
                    <div className="d-flex align-items-center mb-3" style={{ gap: 10 }}>
                      <i className="fa fa-graduation-cap" style={{ color: "#059669", fontSize: "1.1rem" }} />
                      <div style={{ width: 3, height: 22, borderRadius: 2, background: "linear-gradient(180deg, #059669, #10b981)" }} />
                      <h6 className="fw-bold mb-0">Learner Journey</h6>
                    </div>
                    {learnerSessions.length === 0 ? (
                      <div className="text-center py-4" style={{ background: "#fafbfc", borderRadius: 20 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 16, margin: "0 auto 12px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <i className="fa fa-calendar" style={{ color: "#94a3b8", fontSize: "1.3rem" }} />
                        </div>
                        <p className="fw-semibold mb-1" style={{ fontSize: "0.9rem" }}>No bookings yet</p>
                        <small className="text-muted">Book a session to start learning</small>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {learnerSessions.map((s) => {
                          const session = s.sessionId || s;
                          const title = session?.title || "Untitled";
                          const date = session?.date ? new Date(session.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
                          const skill = session?.skillId?.name || "";
                          const mentor = session?.mentorId?.name || session?.mentorId?.email || "";
const mentorId = session?.mentorId?._id;
                          const status = s.requestStatus || s.status || "";
                          return (
                            <div key={s._id} style={{ background: "#fafbfc", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", gap: 20 }}>
                              <div style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0, background: "linear-gradient(135deg, #ecfdf5, #d1fae5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <i className="fa fa-graduation-cap" style={{ color: "#059669", fontSize: "1.1rem" }} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="fw-bold mb-2" style={{ fontSize: "0.95rem" }}>{title}</div>
                                <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                                  {date && <span style={{ fontSize: "0.8rem", color: "#64748b" }}><i className="fa fa-calendar" style={{ color: "#94a3b8", marginRight: 10 }} />{date}</span>}
                                  {skill && <span style={{ fontSize: "0.8rem", color: "#64748b" }}><i className="fa fa-tag" style={{ color: "#94a3b8", marginRight: 10 }} />{skill}</span>}
                                  {mentor && <span style={{ fontSize: "0.8rem", color: "#64748b" }}><i className="fa fa-user" style={{ color: "#94a3b8", marginRight: 10 }} /><UserLink userId={mentorId} name={mentor} /></span>}
                                </div>
                              </div>
                              {badge(status)}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "social" && (
            <div className="learner-card p-4">
              <h5 className="fw-bold mb-4"><i className="fa fa-share-alt text-primary" style={{ marginRight: 10 }} />Connect</h5>
              <div className="d-flex flex-wrap gap-3">
                {[
                  { key: "github", icon: "fab fa-github", label: "GitHub", color: "#333" },
                  { key: "linkedin", icon: "fab fa-linkedin", label: "LinkedIn", color: "#0a66c2" },
                  { key: "portfolio", icon: "fa fa-briefcase", label: "Portfolio", color: "#0d6efd" },
                  { key: "youtube", icon: "fab fa-youtube", label: "YouTube", color: "#ff0000" },
                  { key: "twitter", icon: "fab fa-twitter", label: "Twitter", color: "#1da1f2" },
                ].map((s) => (
                  profile[s.key] ? (
                    <a key={s.key} href={profile[s.key]} target="_blank" rel="noopener noreferrer"
                      className="btn btn-outline-secondary rounded-pill px-4 d-flex align-items-center gap-2 fw-semibold"
                      style={{ borderColor: s.color, color: s.color }}
                      onMouseEnter={(e) => { e.target.style.background = s.color; e.target.style.color = "#fff"; }}
                      onMouseLeave={(e) => { e.target.style.background = "transparent"; e.target.style.color = s.color; }}>
                      <i className={s.icon} />{s.label}
                    </a>
                  ) : null
                ))}
                {!profile.github && !profile.linkedin && !profile.portfolio && !profile.youtube && !profile.twitter && (
                  <p className="text-muted fst-italic mb-0">No social links added.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* All Badges Modal */}
      {showAllBadges && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20,
        }} onClick={() => setShowAllBadges(false)}>
          <div style={{
            background: "#fff", borderRadius: 20, maxWidth: 600, width: "100%",
            maxHeight: "85vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              background: "linear-gradient(135deg, #0d6efd, #6610f2)",
              padding: "20px 24px", borderRadius: "20px 20px 0 0",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <h5 className="fw-bold mb-0 text-white">All Badges</h5>
                <small className="text-white opacity-75">{earnedBadges.length} of {allBadges.length} earned</small>
              </div>
              <button
                className="btn btn-sm rounded-circle"
                style={{ width: 32, height: 32, background: "rgba(255,255,255,0.2)", color: "white", display: "grid", placeItems: "center", border: "none" }}
                onClick={() => setShowAllBadges(false)}
              >
                <i className="fa fa-times" />
              </button>
            </div>
            <div style={{ padding: 20 }}>
              {["learner", "mentor", "general"].map((cat) => {
                const items = allBadges.filter((b) => b.category === cat);
                if (!items.length) return null;
                const catLabel = cat === "learner" ? "Learner Badges" : cat === "mentor" ? "Mentor Badges" : "General Badges";
                const catIcon = cat === "learner" ? "fa-graduation-cap" : cat === "mentor" ? "fa-chalkboard-teacher" : "fa-globe";
                return (
                  <div key={cat} style={{ marginBottom: 20 }}>
                    <div className="d-flex align-items-center" style={{ gap: 8, marginBottom: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: "#f1f5f9", display: "grid", placeItems: "center", color: "#64748b" }}>
                        <i className={`fa ${catIcon}`} style={{ fontSize: "0.75rem" }} />
                      </div>
                      <h6 className="fw-bold mb-0" style={{ fontSize: "0.85rem" }}>{catLabel}</h6>
                    </div>
                    <div className="row g-2">
                      {items.map((badge) => {
                        const earned = earnedBadges.find((b) => b._id === badge._id);
                        return (
                          <div key={badge._id} className="col-6">
                            <div style={{
                              padding: "10px 12px", borderRadius: 12,
                              background: earned ? "#fff" : "#f8fafc",
                              border: earned ? `1px solid ${badge.color}30` : "1px solid #eef2f7",
                              opacity: earned ? 1 : 0.5,
                            }}>
                              <div className="d-flex align-items-center" style={{ gap: 10 }}>
                                <div style={{
                                  width: 36, height: 36, borderRadius: 10,
                                  background: earned ? `${badge.color}15` : "#f1f5f9",
                                  display: "grid", placeItems: "center",
                                  color: earned ? badge.color : "#94a3b8", fontSize: "0.85rem",
                                  flexShrink: 0,
                                }}>
                                  <i className={`fa ${badge.icon}`} />
                                </div>
                                <div style={{ minWidth: 0 }}>
                                  <div className="fw-semibold" style={{ fontSize: "0.75rem", lineHeight: 1.2 }}>{badge.name}</div>
                                  <small style={{ fontSize: "0.62rem", color: "#94a3b8", lineHeight: 1.1, display: "block" }}>
                                    {earned ? `Earned ${new Date(earned.earnedAt).toLocaleDateString()}` : badge.description}
                                  </small>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showFollowers && (
        <UserListModal title="Your Followers" users={followers} onClose={() => setShowFollowers(false)} />
      )}
      {showFollowing && (
        <UserListModal title="Following" users={following} onClose={() => setShowFollowing(false)} />
      )}
    </>
  );
};

const UserListModal = ({ title, users, onClose }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 9999,
    background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
  }} onClick={onClose}>
    <div style={{
      background: "#fff", borderRadius: 20, maxWidth: 500, width: "100%",
      maxHeight: "70vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    }} onClick={(e) => e.stopPropagation()}>
      <div style={{
        background: "linear-gradient(135deg, #0d6efd, #6610f2)",
        padding: "16px 20px", borderRadius: "20px 20px 0 0",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <h5 className="fw-bold mb-0 text-white">{title} ({users.length})</h5>
        <button className="btn btn-sm rounded-circle" style={{ width: 30, height: 30, background: "rgba(255,255,255,0.2)", color: "white", display: "grid", placeItems: "center", border: "none" }} onClick={onClose}>
          <i className="fa fa-times" />
        </button>
      </div>
      <div style={{ padding: 16 }}>
        {users.length === 0 ? (
          <p className="text-muted text-center py-3 mb-0">No users yet.</p>
        ) : (
          users.map((u) => (
            <Link key={u._id} to={`/profile/${u._id}`} onClick={onClose} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, transition: "background 0.15s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <img src={u.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=0d6efd&color=fff&size=40`}
                  alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
                <div>
                  <div className="fw-semibold" style={{ fontSize: "0.9rem" }}>{u.name}</div>
                  <small className="text-muted">{u.bio?.slice(0, 60) || `Lv.${u.level || 1}`}</small>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  </div>
);

export default Profile;
