import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import TopBar from "../layout/user/TopBar";
import Apiservices from "../../../Apiservices";
import { LoadingState } from "../learner/LearnerUI";
import FollowButton from "../shared/FollowButton";
import { useAuth } from "../../App";
import { useSocket } from "../../context/SocketContext";
import { showToast } from "../../utils/toastUtils";
import { confirmAlert } from "../../utils/alertUtils";

const PublicProfile = () => {
  const { userId } = useParams();
  const { user: me } = useAuth();
  const { onlineUsers } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (me && userId === me._id) navigate("/profile", { replace: true });
  }, [me, userId, navigate]);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("about");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [similarUsers, setSimilarUsers] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const pRes = await Apiservices.getPublicProfile(userId);
        if (cancelled) return;
        setProfile(pRes.data.data);
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.message || "Failed to load profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [userId]);

  useEffect(() => {
    Apiservices.getFollowSuggestions({ limit: 4 }).then((res) => {
      setSimilarUsers((res.data.data || []).filter((u) => u._id !== userId));
    }).catch(() => {});
  }, [userId]);

  const loadFollowers = async () => {
    setShowFollowers(true);
    setShowFollowing(false);
    try {
      const res = await Apiservices.getFollowers(userId, { limit: 50 });
      setFollowers(res.data.data || []);
    } catch {}
  };

  const loadFollowing = async () => {
    setShowFollowing(true);
    setShowFollowers(false);
    try {
      const res = await Apiservices.getFollowing(userId, { limit: 50 });
      setFollowing(res.data.data || []);
    } catch {}
  };

  const isOwn = me?._id === userId;

  const handleToggle = (nowFollowing) => {
    setProfile((prev) => ({
      ...prev,
      followerCount: Math.max(0, (prev?.followerCount || 0) + (nowFollowing ? 1 : -1)),
    }));
  };

  if (loading) {
    return (
      <>
        <TopBar />
        <div className="bg-image" style={{ minHeight: "calc(100vh - 64px)" }}>
          <div className="container py-5"><LoadingState /></div>
        </div>
      </>
    );
  }

  if (error || !profile) {
    return (
      <>
        <TopBar />
        <div className="bg-image" style={{ minHeight: "calc(100vh - 64px)" }}>
          <div className="container py-5">
            <div className="alert alert-danger text-center py-5">
              <i className="fa fa-exclamation-triangle fa-2x mb-3" />
              <h4 className="fw-bold">User not found</h4>
              <p className="mb-0">{error || "This profile does not exist."}</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  const isMentor = profile.roles?.includes("mentor");
  const roleBadge = isMentor ? (
    <span style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white", padding: "4px 14px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.3px" }}>
      <i className="fa fa-chalkboard" style={{ marginRight: 5 }} />Mentor
    </span>
  ) : (
    <span style={{ background: "linear-gradient(135deg, #0891b2, #0e7490)", color: "white", padding: "4px 14px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.3px" }}>
      <i className="fa fa-graduation-cap" style={{ marginRight: 5 }} />Learner
    </span>
  );

  return (
    <>
      <TopBar />
      <div className="bg-image" style={{ minHeight: "calc(100vh - 64px)" }}>
        <div style={{ height: 200, background: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)" }} />

        <div className="container" style={{ marginTop: -80 }}>
          <div className="learner-card p-4 mb-4" style={{ position: "relative" }}>
            <div style={{ position: "absolute", top: 16, right: 16, zIndex: 2, display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
              {!isOwn && <FollowButton userId={userId} onToggle={handleToggle} />}
              {!isOwn && (
                <button onClick={() => {
                  Apiservices.getOrCreateDM(userId).then((res) => {
                    navigate(`/messages/${res.data.data._id}`);
                  }).catch((err) => {
                    showToast.error(err.response?.data?.message || "Could not start conversation");
                  });
                }}
                  className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-semibold"
                  style={{ fontSize: "0.8rem" }}>
                  <i className="fa fa-comment me-1" />Message
                </button>
              )}
              {!isOwn && (
                <button onClick={async () => {
                  const ok = await confirmAlert("Block this user? They won't be able to message you.");
                  if (!ok) return;
                  try {
                    await Apiservices.blockUser(userId);
                    showToast.success("User blocked");
                  } catch { showToast.error("Failed to block user"); }
                }}
                  className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-semibold"
                  style={{ fontSize: "0.8rem" }}>
                  <i className="fa fa-ban me-1" />Block
                </button>
              )}
            </div>
            <div className="d-flex flex-wrap align-items-end gap-4">
              <img
                src={profile.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=0d6efd&color=fff&size=128`}
                alt="" className="rounded-circle border border-4 border-white shadow-sm"
                style={{ width: 120, height: 120, objectFit: "cover", marginTop: -60 }}
              />
              <div className="flex-grow-1">
                <div className="d-flex flex-wrap align-items-center" style={{ gap: "10px" }}>
                  <h2 className="fw-bold mb-0">{profile.name}
                    {onlineUsers.has(profile._id) && <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "#22c55e", marginLeft: 8, verticalAlign: "middle" }} title="Online" />}
                  </h2>
                  {roleBadge}
                </div>
                <p className="text-muted mb-1" style={{ fontSize: "0.85rem" }}>@{profile.name?.toLowerCase().replace(/\s+/g, "")}</p>
                <div className="d-flex align-items-center" style={{ gap: "16px", marginTop: "6px" }}>
                  <div className="d-flex align-items-center" style={{ gap: "8px" }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: "linear-gradient(135deg, #0d6efd20, #6610f220)",
                      display: "grid", placeItems: "center", color: "#0d6efd", fontSize: "0.85rem",
                    }}>
                      <i className="fa fa-bolt" />
                    </div>
                    <div>
                      <div className="fw-bold" style={{ fontSize: "0.9rem" }}>Lv.{profile.level || 1}</div>
                      <small className="text-muted" style={{ fontSize: "0.65rem" }}>{(profile.xp || 0).toLocaleString()} XP</small>
                    </div>
                  </div>
                  <button className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-semibold" style={{ fontSize: "0.8rem" }} onClick={loadFollowers}>
                    <strong>{profile.followerCount || 0}</strong> Followers
                  </button>
                  <button className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-semibold" style={{ fontSize: "0.8rem" }} onClick={loadFollowing}>
                    <strong>{profile.followingCount || 0}</strong> Following
                  </button>
                </div>
                {profile.bio && <p className="mb-0 small" style={{ marginTop: "6px" }}>{profile.bio}</p>}
              </div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            {[
              { label: "Sessions", value: profile.sessionCount || 0, icon: "fa-video", color: "primary" },
              { label: "Reviews", value: profile.reviewCount || 0, icon: "fa-star", color: "warning" },
              ...(isMentor && profile.rating ? [{ label: "Avg Rating", value: profile.rating, icon: "fa-star-half-stroke", color: "warning" }] : []),
              { label: "Skills", value: profile.skills?.length || profile.interests?.length || 0, icon: "fa-code", color: "success" },
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

          <div className="d-flex gap-2 mb-4 flex-wrap" style={{ borderBottom: "1px solid #eef2f7" }}>
            {[
              { id: "about", label: "About", icon: "fa-user" },
              { id: "skills", label: "Skills", icon: "fa-code" },
              { id: "interests", label: "Interests", icon: "fa-heart" },
            ].map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`btn btn-sm rounded-top-3 fw-semibold px-4 py-2 ${activeTab === t.id ? "btn-primary" : "btn-outline-secondary border-0"}`}
                style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
                <i className={`fa ${t.icon}`} style={{ marginRight: 10 }} />{t.label}
              </button>
            ))}
          </div>

          {activeTab === "about" && (
            <div className="learner-card p-4 mb-4">
              <div className="d-flex align-items-center mb-4">
                <div style={{ width: 50, textAlign: "center", flexShrink: 0 }}>
                  <i className="fa fa-info-circle text-primary" style={{ fontSize: "1.1rem" }} />
                </div>
                <h5 className="fw-bold mb-0">About</h5>
              </div>
              {profile.bio ? (
                <p>{profile.bio}</p>
              ) : (
                <p className="text-muted fst-italic mb-0">No bio added yet.</p>
              )}
              {profile.createdAt && (
                <p className="text-muted small mt-3 mb-0">
                  <i className="fa fa-calendar me-2" />Joined {new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                </p>
              )}

              {profile.socialLinks && (
                <div className="d-flex flex-wrap gap-2 mt-3">
                  {profile.socialLinks.github && (
                    <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                      style={{ fontSize: "0.75rem", color: "#1e293b" }}>
                      <i className="fa fa-code-branch me-1" />GitHub
                    </a>
                  )}
                  {profile.socialLinks.linkedin && (
                    <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                      style={{ fontSize: "0.75rem", color: "#1e293b" }}>
                      <i className="fa fa-briefcase me-1" />LinkedIn
                    </a>
                  )}
                  {profile.socialLinks.twitter && (
                    <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                      style={{ fontSize: "0.75rem", color: "#1e293b" }}>
                      <i className="fa fa-hashtag me-1" />Twitter
                    </a>
                  )}
                  {profile.socialLinks.portfolio && (
                    <a href={profile.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                      style={{ fontSize: "0.75rem", color: "#1e293b" }}>
                      <i className="fa fa-globe me-1" />Website
                    </a>
                  )}
                  {profile.socialLinks.youtube && (
                    <a href={profile.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                      style={{ fontSize: "0.75rem", color: "#1e293b" }}>
                      <i className="fa fa-video me-1" />YouTube
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "skills" && (
            <div className="learner-card p-4 mb-4">
              <h5 className="fw-bold mb-4"><i className="fa fa-code text-success me-2" />Skills</h5>
              {profile.skills?.length > 0 ? (
                <div className="d-flex flex-wrap gap-2">
                  {profile.skills.map((s, i) => (
                    <span key={i} style={{
                      background: s.level === "advanced" ? "linear-gradient(135deg, #16a34a, #15803d)" : s.level === "intermediate" ? "linear-gradient(135deg, #eab308, #ca8a04)" : "linear-gradient(135deg, #0d6efd, #0a58ca)",
                      color: s.level === "intermediate" ? "#1e293b" : "white", padding: "4px 14px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.3px",
                    }}>
                      {s.name} ({s.level})
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted fst-italic mb-0">No skills listed.</p>
              )}
            </div>
          )}

          {activeTab === "interests" && (
            <div className="learner-card p-4">
              <h5 className="fw-bold mb-4"><i className="fa fa-heart text-danger me-2" />Interests</h5>
              {profile.interests?.length > 0 ? (
                <div className="d-flex flex-wrap gap-2">
                  {profile.interests.map((i) => (
                    <span key={i} style={{ background: "linear-gradient(135deg, #64748b, #475569)", color: "white", padding: "4px 14px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.3px" }}>{i}</span>
                  ))}
                </div>
              ) : (
                <p className="text-muted fst-italic mb-0">No interests listed.</p>
              )}
            </div>
          )}

          {!isOwn && similarUsers.length > 0 && (
            <div className="learner-card p-4 mb-4">
              <h5 className="fw-bold mb-3"><i className="fa fa-users text-primary me-2" />Similar People</h5>
              <div className="d-flex flex-column" style={{ gap: 10 }}>
                {similarUsers.map((u) => (
                  <div key={u._id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Link to={`/profile/${u._id}`} style={{ flexShrink: 0 }}>
                      <img
                        src={u.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=0d6efd&color=fff&size=36`}
                        alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                    </Link>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link to={`/profile/${u._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                        <div className="fw-semibold" style={{ fontSize: "0.85rem" }}>{u.name}</div>
                      </Link>
                      <small className="text-muted" style={{ fontSize: "0.65rem" }}>{u.followerCount || 0} followers</small>
                    </div>
                    <FollowButton userId={u._id} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showFollowers && (
        <UserListModal title="Followers" users={followers} onClose={() => setShowFollowers(false)} />
      )}
      {showFollowing && (
        <UserListModal title="Following" users={following} onClose={() => setShowFollowing(false)} />
      )}
    </>
  );
};

const UserListModal = ({ title, users, onClose }) => {
  const nav = useNavigate();
  const openChat = (uid) => {
    Apiservices.getOrCreateDM(uid).then((res) => {
      onClose();
      nav(`/messages/${res.data.data._id}`);
    }).catch(() => {});
  };
  return (
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
              <div key={u._id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 12, transition: "background 0.15s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <Link to={`/profile/${u._id}`} onClick={onClose} style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                  <img src={u.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=0d6efd&color=fff&size=40`}
                    alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div className="fw-semibold" style={{ fontSize: "0.9rem" }}>{u.name}</div>
                    <small className="text-muted">{u.bio?.slice(0, 60) || `Lv.${u.level || 1}`}</small>
                  </div>
                </Link>
                <button onClick={(e) => { e.stopPropagation(); openChat(u._id); }}
                  className="btn btn-sm btn-outline-primary rounded-pill fw-semibold" style={{ fontSize: "0.7rem", flexShrink: 0 }}>
                  <i className="fa fa-comment me-1" />Message
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
