import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TopBar from "../layout/user/TopBar";
import { showToast } from "../../utils/toastUtils";
import Apiservices from "../../../Apiservices";
import { LoadingState } from "../learner/LearnerUI";
import { useAuth } from "../../App";

const badge = (status) => {
  const m = { accepted: "success", pending: "warning", completed: "info", cancelled: "secondary", rejected: "danger", active: "success" };
  return <span className={`badge bg-${m[status] || "secondary"} rounded-pill`}>{status}</span>;
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

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, sRes] = await Promise.all([
          Apiservices.getProfile(),
          Apiservices.getProfileStats().catch(() => ({ data: { data: {} } })),
        ]);
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

  return (
    <>
      <TopBar />
      <div className="bg-image" style={{ minHeight: "calc(100vh - 64px)" }}>
        {/* Cover */}
        <div style={{ height: 200, background: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)" }} />

        {/* Profile Header */}
        <div className="container" style={{ marginTop: -80 }}>
          <div className="learner-card p-4 mb-4">
            <div className="d-flex flex-wrap align-items-end gap-4">
              <img src={profile.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=0d6efd&color=fff&size=128`}
                alt="" className="rounded-circle border border-4 border-white shadow-sm" style={{ width: 120, height: 120, objectFit: "cover", marginTop: -60 }} />
              <div className="flex-grow-1">
                <div className="d-flex flex-wrap align-items-center gap-2">
                  <h2 className="fw-bold mb-0">{profile.name}</h2>
                  {isMentor && <span className="badge bg-success rounded-pill">Mentor</span>}
                  <span className="badge bg-primary rounded-pill">Learner</span>
                </div>
                <p className="text-muted mb-1">{profile.email}</p>
                {profile.bio && <p className="mb-0 small">{profile.bio}</p>}
              </div>
              <Link to="/settings" className="btn btn-outline-primary rounded-pill px-4 fw-semibold flex-shrink-0">
                <i className="fa fa-pen" style={{ marginRight: 10 }} />Edit Profile
              </Link>
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
                            <span key={i} className="badge bg-light text-dark border rounded-pill px-3 py-2">{i}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-lg-4">
                <div className="learner-card p-4 mb-4">
                  <div className="d-flex align-items-center mb-4">
                    <div style={{ width: 50, textAlign: "center", flexShrink: 0 }}>
                      <i className="fa fa-crown text-warning" style={{ fontSize: "1.1rem" }} />
                    </div>
                    <h5 className="fw-bold mb-0">Achievements</h5>
                  </div>
                  {[
                    profile.skills.length >= 3 && { icon: "fa-star", color: "info", text: "Multi-Skilled" },
                    isMentor && { icon: "fa-chalkboard", color: "success", text: "Mentor" },
                    stats.sessions >= 5 && { icon: "fa-rocket", color: "warning", text: "Active Learner" },
                    { icon: "fa-calendar-check", color: "secondary", text: `Joined ${new Date().toLocaleDateString()}` },
                  ].filter(Boolean).map((a, i) => (
                    <div key={i} className="d-flex align-items-center mb-2">
                      <div style={{ width: 50, textAlign: "center", flexShrink: 0 }}>
                        <i className={`fa ${a.icon} text-${a.color}`} style={{ fontSize: "1rem" }} />
                      </div>
                      <span className="fw-semibold small">{a.text}</span>
                    </div>
                  ))}
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
                      <span className={`badge rounded-pill ${s.level === "advanced" ? "bg-success" : s.level === "intermediate" ? "bg-warning text-dark" : "bg-info text-dark"}`}>
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
                                  {mentor && <span style={{ fontSize: "0.8rem", color: "#64748b" }}><i className="fa fa-user" style={{ color: "#94a3b8", marginRight: 10 }} />{mentor}</span>}
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
    </>
  );
};

export default Profile;
