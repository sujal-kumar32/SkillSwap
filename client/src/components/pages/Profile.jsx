import React, { useEffect, useState } from "react";
import TopBar from "../layout/user/TopBar";
import { showToast } from "../../utils/toastUtils";
import LoadingButton from "../../utils/LoadingButton";
import Apiservices from "../../../Apiservices";

const initialForm = {
  name: "", email: "", bio: "", image: "", coverImage: "",
  interests: "", goals: "", skills: [],
  phone: "", timezone: "UTC",
  linkedin: "", github: "", portfolio: "", youtube: "", twitter: "",
  oldPassword: "", newPassword: "",
};

const Profile = () => {
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");
  const isMentor = roles.includes("mentor");
  const [profile, setProfile] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("about");
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState(initialForm);
  const [profileFile, setProfileFile] = useState(null);
  const [aiBioLoading, setAiBioLoading] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [stats, setStats] = useState({ sessions: 0, reviews: 0, skills: 0 });

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
          oldPassword: "", newPassword: "",
        });
        if (sRes.data?.data) setStats(sRes.data.data);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openEdit = () => {
    setEditForm({ ...profile });
    setProfileFile(null);
    setEditModal(true);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const data = new FormData();
      Object.entries(editForm).forEach(([k, v]) => {
        if (k === "skills" || k === "oldPassword" || k === "newPassword") return;
        if (v) data.append(k, v);
      });
      data.append("skills", JSON.stringify(editForm.skills));
      if (profileFile) data.append("profileImage", profileFile);
      if (editForm.oldPassword || editForm.newPassword) {
        data.append("oldPassword", editForm.oldPassword);
        data.append("newPassword", editForm.newPassword);
      }
      await Apiservices.updateProfile(data);
      setProfile({ ...editForm });
      showToast.success("Profile updated");
      setEditModal(false);
    } catch (err) {
      showToast.error(err.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    const n = newSkill.trim();
    if (!n || editForm.skills.find((s) => s.name.toLowerCase() === n.toLowerCase())) return;
    setEditForm({ ...editForm, skills: [...editForm.skills, { name: n, level: "beginner" }] });
    setNewSkill("");
  };

  const removeSkill = (idx) => {
    setEditForm({ ...editForm, skills: editForm.skills.filter((_, i) => i !== idx) });
  };

  const skillLevel = (l) => l === "advanced" ? 100 : l === "intermediate" ? 65 : 35;

  const generateBio = async () => {
    const interests = editForm.interests.trim();
    const goals = editForm.goals.trim();
    if (!interests && !goals) { showToast.warning("Add interests or goals first"); return; }
    setAiBioLoading(true);
    try {
      const res = await Apiservices.chatAI({
        message: `Write a short professional bio (2-3 sentences) for a ${isMentor ? "mentor" : "learner"} interested in: ${interests || "various skills"}. ${goals ? `Goal: ${goals}.` : ""} Keep it first-person.`,
      });
      setEditForm({ ...editForm, bio: res.data.data.reply });
      showToast.success("Bio generated");
    } catch (err) {
      showToast.error(err.response?.data?.message || "Failed");
    } finally {
      setAiBioLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <TopBar />
        <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
          <div className="spinner-border text-primary" style={{ width: 48, height: 48 }} />
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
              <button className="btn btn-outline-primary rounded-pill px-4 fw-semibold flex-shrink-0" onClick={openEdit}>
                <i className="fa fa-pen me-2" />Edit Profile
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="row g-3 mb-4">
            {[
              { label: "Sessions", value: stats.sessions, icon: "fa-video", color: "primary" },
              { label: "Reviews", value: stats.reviews, icon: "fa-star", color: "warning" },
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
              { id: "journey", label: "Learning Journey", icon: "fa-road" },
              { id: "social", label: "Connect", icon: "fa-share-nodes" },
            ].map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`btn btn-sm rounded-top-3 fw-semibold px-4 py-2 ${activeTab === t.id ? "btn-primary" : "btn-outline-secondary border-0"}`}
                style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
                <i className={`fa ${t.icon} me-2`} />{t.label}
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
                  <h5 className="fw-bold mb-3"><i className="fa fa-robot text-info me-2" />SwapMind AI</h5>
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
              <h5 className="fw-bold mb-4"><i className="fa fa-road me-2 text-primary" />Learning Journey</h5>
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="bg-light rounded-4 p-4 text-center">
                    <h2 className="fw-bold text-primary mb-1">{stats.sessions}</h2>
                    <small className="text-muted">Sessions {isMentor ? "Created" : "Attended"}</small>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="bg-light rounded-4 p-4 text-center">
                    <h2 className="fw-bold text-success mb-1">{stats.reviews}</h2>
                    <small className="text-muted">Reviews {isMentor ? "Received" : "Written"}</small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "social" && (
            <div className="learner-card p-4">
              <h5 className="fw-bold mb-4"><i className="fa fa-share-nodes me-2 text-primary" />Connect</h5>
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

      {/* Edit Modal */}
      {editModal && (
        <>
          <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 1040 }} onClick={() => setEditModal(false)} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 1050, width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto" }}>
            <form onSubmit={saveProfile} className="learner-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">Edit Profile</h5>
                <button type="button" className="btn-close" onClick={() => setEditModal(false)} />
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Name</label>
                  <input className="form-control rounded-pill" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Email</label>
                  <input className="form-control rounded-pill" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                </div>
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center">
                    <label className="form-label fw-semibold small mb-0">Bio</label>
                    <button type="button" className="btn btn-sm btn-outline-success rounded-pill" onClick={generateBio} disabled={aiBioLoading}>
                      {aiBioLoading ? <span className="spinner-border spinner-border-sm" /> : <><i className="fa fa-magic me-1" />Generate</>}
                    </button>
                  </div>
                  <textarea className="form-control rounded-4 mt-1" rows="3" value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Interests</label>
                  <input className="form-control rounded-pill" placeholder="React, Node.js..." value={editForm.interests} onChange={(e) => setEditForm({ ...editForm, interests: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Goals</label>
                  <input className="form-control rounded-pill" placeholder="Learning goals..." value={editForm.goals} onChange={(e) => setEditForm({ ...editForm, goals: e.target.value })} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold small">Skills</label>
                  <div className="d-flex gap-2 mb-2">
                    <input className="form-control rounded-pill" placeholder="Add a skill..." value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} />
                    <button type="button" className="btn btn-outline-primary rounded-pill px-3" onClick={addSkill}>Add</button>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {editForm.skills.map((s, i) => (
                      <span key={i} className="badge bg-light border rounded-pill px-3 py-2 d-flex align-items-center gap-2">
                        {s.name}
                        <select className="border-0 bg-transparent small" style={{ fontSize: "0.7rem" }} value={s.level}
                          onChange={(e) => {
                            const updated = [...editForm.skills];
                            updated[i].level = e.target.value;
                            setEditForm({ ...editForm, skills: updated });
                          }}>
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                        <i className="fa fa-times text-danger" style={{ cursor: "pointer", fontSize: "0.75rem" }} onClick={() => removeSkill(i)} />
                      </span>
                    ))}
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Phone</label>
                  <input className="form-control rounded-pill" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Timezone</label>
                  <select className="form-select rounded-pill" value={editForm.timezone} onChange={(e) => setEditForm({ ...editForm, timezone: e.target.value })}>
                    {["UTC", "America/New_York", "America/Chicago", "Europe/London", "Europe/Paris", "Asia/Kolkata", "Asia/Tokyo", "Australia/Sydney"].map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12"><hr />
                  <h6 className="fw-bold mb-3">Social Links</h6>
                  <div className="row g-3">
                    {[
                      ["github", "fab fa-github", "GitHub URL"],
                      ["linkedin", "fab fa-linkedin", "LinkedIn URL"],
                      ["portfolio", "fa fa-briefcase", "Portfolio URL"],
                      ["youtube", "fab fa-youtube", "YouTube URL"],
                      ["twitter", "fab fa-twitter", "Twitter URL"],
                    ].map(([k, icon, ph]) => (
                      <div className="col-md-6" key={k}>
                        <label className="form-label fw-semibold small"><i className={`${icon} me-1`} />{k.charAt(0).toUpperCase() + k.slice(1)}</label>
                        <input className="form-control rounded-pill" placeholder={ph} value={editForm[k]} onChange={(e) => setEditForm({ ...editForm, [k]: e.target.value })} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-12"><hr />
                  <h6 className="fw-bold mb-3">Change Password</h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <input className="form-control rounded-pill" type="password" placeholder="Current password" value={editForm.oldPassword}
                        onChange={(e) => setEditForm({ ...editForm, oldPassword: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <input className="form-control rounded-pill" type="password" placeholder="New password" value={editForm.newPassword}
                        onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setEditModal(false)}>Cancel</button>
                <LoadingButton loading={saving} type="submit" className="btn btn-primary rounded-pill px-4 fw-semibold">
                  <i className="fa fa-save me-2" />Save Changes
                </LoadingButton>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
};

export default Profile;
