import React, { useEffect, useState } from "react";
import TopBar from "../layout/user/TopBar";
import { showToast } from "../../utils/toastUtils";
import LoadingButton from "../../utils/LoadingButton";
import Apiservices from "../../../Apiservices";
import { LoadingState } from "../learner/LearnerUI";

const initialForm = {
  name: "", email: "", bio: "", image: "", coverImage: "",
  interests: "", goals: "", skills: [],
  phone: "", timezone: "UTC",
  linkedin: "", github: "", portfolio: "", youtube: "", twitter: "",
  oldPassword: "", newPassword: "",
};

const Settings = () => {
  const [profile, setProfile] = useState(initialForm);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileFile, setProfileFile] = useState(null);
  const [aiBioLoading, setAiBioLoading] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");
  const isMentor = roles.includes("mentor");

  useEffect(() => {
    const load = async () => {
      try {
        const pRes = await Apiservices.getProfile();
        const u = pRes.data.data || {};
        const data = {
          name: u.name || "", email: u.email || "", bio: u.bio || "",
          image: u.profileImage || "", coverImage: u.coverImage || "",
          interests: (u.interests || []).join(", "), goals: u.learningGoals || "",
          skills: u.skills || [],
          phone: u.phone || "", timezone: u.timezone || "UTC",
          linkedin: u.socialLinks?.linkedin || "", github: u.socialLinks?.github || "",
          portfolio: u.socialLinks?.portfolio || "", youtube: u.socialLinks?.youtube || "",
          twitter: u.socialLinks?.twitter || "",
          oldPassword: "", newPassword: "",
        };
        setProfile(data);
        setForm(data);
      } catch (e) {
        showToast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "skills" || k === "oldPassword" || k === "newPassword" || k === "image" || k === "coverImage") return;
        if (v) data.append(k, v);
      });
      data.append("skills", JSON.stringify(form.skills));
      if (profileFile) data.append("profileImage", profileFile);
      if (form.oldPassword || form.newPassword) {
        data.append("oldPassword", form.oldPassword);
        data.append("newPassword", form.newPassword);
      }
      await Apiservices.updateProfile(data);
      setProfile({ ...form });
      showToast.success("Profile updated");
    } catch (err) {
      showToast.error(err.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    const n = newSkill.trim();
    if (!n || form.skills.find((s) => s.name.toLowerCase() === n.toLowerCase())) return;
    setForm({ ...form, skills: [...form.skills, { name: n, level: "beginner" }] });
    setNewSkill("");
  };

  const removeSkill = (idx) => {
    setForm({ ...form, skills: form.skills.filter((_, i) => i !== idx) });
  };

  const generateBio = async () => {
    const interests = form.interests.trim();
    const goals = form.goals.trim();
    if (!interests && !goals) { showToast.warning("Add interests or goals first"); return; }
    setAiBioLoading(true);
    try {
      const res = await Apiservices.chatAI({
        message: `Write a short professional bio (2-3 sentences) for a ${isMentor ? "mentor" : "learner"} interested in: ${interests || "various skills"}. ${goals ? `Goal: ${goals}.` : ""} Keep it first-person.`,
      });
      setForm({ ...form, bio: res.data.data.reply });
      showToast.success("Bio generated");
    } catch (err) {
      showToast.error(err.response?.data?.message || "Failed");
    } finally {
      setAiBioLoading(false);
    }
  };

  const sectionTitle = (icon, text) => (
    <div className="d-flex align-items-center mb-4" style={{ gap: 10 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 14,
        background: "linear-gradient(135deg, rgba(13,110,253,0.1), rgba(102,16,242,0.1))",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <i className={`fa ${icon}`} style={{ color: "#0d6efd" }} />
      </div>
      <h5 className="fw-bold mb-0">{text}</h5>
    </div>
  );

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
      <div className="bg-image" style={{ minHeight: "calc(100vh - 64px)", padding: "32px 0" }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="learner-card p-4 mb-4">
            <div className="d-flex align-items-center mb-1" style={{ gap: 10 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: "linear-gradient(135deg, #0d6efd, #6610f2)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <i className="fa fa-cog" style={{ color: "white", fontSize: "1.2rem" }} />
              </div>
              <div>
                <h4 className="fw-bold mb-1">Settings</h4>
                <p className="text-muted mb-0 small">Manage your profile, social links, and password.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className="learner-card p-4 mb-4">
              <div className="row g-3">
                {sectionTitle("fa-user", "Profile Information")}
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Name</label>
                  <input className="form-control rounded-pill" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Email</label>
                  <input className="form-control rounded-pill" type="email" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label fw-semibold small mb-0">Bio</label>
                    <button type="button" className="btn rounded-pill fw-semibold border-0 d-flex align-items-center gap-2"
                      onClick={generateBio} disabled={aiBioLoading}
                      style={{
                        background: "linear-gradient(135deg, #0d6efd, #6610f2)", color: "white",
                        padding: "8px 20px", fontSize: "0.85rem", opacity: aiBioLoading ? 0.7 : 1,
                      }}>
                      {aiBioLoading ? <span className="spinner-border spinner-border-sm" /> : <><i className="fa fa-wand-magic-sparkles" /> AI Generate</>}
                    </button>
                  </div>
                  <textarea className="form-control rounded-4" rows="3" value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Interests</label>
                  <input className="form-control rounded-pill" placeholder="React, Node.js..." value={form.interests}
                    onChange={(e) => setForm({ ...form, interests: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Goals</label>
                  <input className="form-control rounded-pill" placeholder="Learning goals..." value={form.goals}
                    onChange={(e) => setForm({ ...form, goals: e.target.value })} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold small">Skills</label>
                  <div className="d-flex gap-3 mb-3">
                    <input className="form-control rounded-pill" placeholder="Add a skill..." value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} />
                    <button type="button" className="btn btn-outline-primary rounded-pill px-4 fw-semibold" onClick={addSkill}>Add</button>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {form.skills.map((s, i) => (
                      <span key={i} className="badge bg-light border rounded-pill px-3 py-2 d-flex align-items-center gap-2">
                        {s.name}
                        <select className="border-0 bg-transparent small" style={{ fontSize: "0.7rem" }} value={s.level}
                          onChange={(e) => {
                            const updated = [...form.skills];
                            updated[i].level = e.target.value;
                            setForm({ ...form, skills: updated });
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
                  <input className="form-control rounded-pill" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Timezone</label>
                  <select className="form-select rounded-pill" value={form.timezone}
                    onChange={(e) => setForm({ ...form, timezone: e.target.value })}>
                    {["UTC", "America/New_York", "America/Chicago", "Europe/London", "Europe/Paris", "Asia/Kolkata", "Asia/Tokyo", "Australia/Sydney"].map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="learner-card p-4 mb-4">
              {sectionTitle("fa-share-nodes", "Social Links")}
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
                    <input className="form-control rounded-pill" placeholder={ph} value={form[k]}
                      onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
                  </div>
                ))}
              </div>
            </div>

            <div className="learner-card p-4 mb-4">
              {sectionTitle("fa-lock", "Change Password")}
              <div className="row g-3">
                <div className="col-md-6">
                  <div style={{ position: "relative" }}>
                    <input className="form-control rounded-pill" type={showOldPassword ? "text" : "password"}
                      placeholder="Current password" value={form.oldPassword}
                      onChange={(e) => setForm({ ...form, oldPassword: e.target.value })} style={{ paddingRight: "40px" }} />
                    <span onClick={() => setShowOldPassword(!showOldPassword)}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#6c757d", zIndex: 5 }}>
                      <i className={`fa${showOldPassword ? "s fa-eye-slash" : "r fa-eye"}`} />
                    </span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div style={{ position: "relative" }}>
                    <input className="form-control rounded-pill" type={showNewPassword ? "text" : "password"}
                      placeholder="New password" value={form.newPassword}
                      onChange={(e) => setForm({ ...form, newPassword: e.target.value })} style={{ paddingRight: "40px" }} />
                    <span onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#6c757d", zIndex: 5 }}>
                      <i className={`fa${showNewPassword ? "s fa-eye-slash" : "r fa-eye"}`} />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-center gap-3 mb-4">
              <LoadingButton loading={saving} type="submit" className="btn btn-primary rounded-pill px-5 py-2 fw-semibold">
                <i className="fa fa-save" style={{ marginRight: 10 }} />Save Changes
              </LoadingButton>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Settings;
