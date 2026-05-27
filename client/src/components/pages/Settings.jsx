import React, { useEffect, useState } from "react";
import TopBar from "../layout/user/TopBar";
import { showToast } from "../../utils/toastUtils";
import LoadingButton from "../../utils/LoadingButton";
import Apiservices from "../../../Apiservices";
import { LoadingState } from "../learner/LearnerUI";
import { useAuth } from "../../App";

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
  const [isVerified, setIsVerified] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [calendarEmail, setCalendarEmail] = useState("");
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [calendarBusy, setCalendarBusy] = useState(false);
  const [verifySending, setVerifySending] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();
  const isMentor = user?.roles?.includes("mentor");

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
        setIsVerified(u.isVerified !== false);
      } catch (e) {
        showToast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
    loadCalendarStatus();

    const params = new URLSearchParams(window.location.search);
    if (params.get("calendar") === "connected") {
      showToast.success("Google Calendar connected successfully!");
      loadCalendarStatus();
      window.history.replaceState({}, "", window.location.pathname);
    } else if (params.get("calendar") === "error") {
      showToast.error("Failed to connect Google Calendar. Please try again.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const loadCalendarStatus = async () => {
    try {
      const res = await Apiservices.calendarStatus();
      setCalendarConnected(res.data.connected);
      setCalendarEmail(res.data.email || "");
    } catch {
      setCalendarConnected(false);
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleConnectCalendar = async () => {
    try {
      setCalendarBusy(true);
      const res = await Apiservices.calendarConnect();
      if (res.data.url) {
        window.open(res.data.url, "_blank", "width=600,height=700");
      }
    } catch (err) {
      showToast.error(err.response?.data?.message || "Failed to connect calendar");
    } finally {
      setCalendarBusy(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setVerifySending(true);
      await Apiservices.resendVerification();
      showToast.success("Verification email sent! Check your inbox.");
    } catch (err) {
      showToast.error(err.response?.data?.message || "Failed to send verification email");
    } finally {
      setVerifySending(false);
    }
  };

  const handleDisconnectCalendar = async () => {
    try {
      setCalendarBusy(true);
      await Apiservices.calendarDisconnect();
      setCalendarConnected(false);
      setCalendarEmail("");
      showToast.success("Calendar disconnected");
    } catch (err) {
      showToast.error(err.response?.data?.message || "Failed to disconnect");
    } finally {
      setCalendarBusy(false);
    }
  };

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

  const handleDeleteAccount = async () => {
    if (!deletePassword) { showToast.error("Enter your password to confirm."); return; }
    try {
      setDeleting(true);
      await Apiservices.deleteAccount({ password: deletePassword });
      showToast.success("Account deleted.");
      localStorage.clear();
      window.dispatchEvent(new Event("authChange"));
      window.location.href = "/login";
    } catch (err) {
      showToast.error(err.response?.data?.message || "Failed to delete account");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setDeletePassword("");
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
                <div className="col-12 mb-2">
                  <div className="d-flex align-items-center" style={{ gap: "10px" }}>
                    <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
                      <img
                        src={profileFile ? URL.createObjectURL(profileFile) : (form.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || "User")}&background=0d6efd&color=fff&size=128`)}
                        alt="" className="rounded-circle border border-2 border-white shadow-sm"
                        style={{ width: 80, height: 80, objectFit: "cover", background: "#eef2f7" }}
                      />
                      <label htmlFor="profileImageInput" style={{
                        position: "absolute", bottom: -2, right: -2, width: 30, height: 30, borderRadius: "50%",
                        background: "#0d6efd", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", border: "2px solid #fff", fontSize: "0.75rem",
                      }}>
                        <i className="fas fa-camera" />
                      </label>
                      <input id="profileImageInput" type="file" accept="image/*" style={{ display: "none" }}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) setProfileFile(f); }} />
                    </div>
                    <div>
                      <div className="fw-semibold" style={{ fontSize: "0.95rem" }}>{form.name || "Your Name"}</div>
                      <small className="text-muted">Click the camera icon to change your profile picture</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Name</label>
                  <input className="form-control rounded-pill" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Email</label>
                  <input className="form-control rounded-pill" type="email" value={form.email} readOnly
                    style={{ background: "#e9ecef", cursor: "not-allowed" }} />
                </div>
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label fw-semibold small mb-0">Bio</label>
                    <button type="button" className="btn rounded-pill fw-semibold border-0 d-inline-flex align-items-center"
                      onClick={generateBio} disabled={aiBioLoading}
                      style={{
                        gap: 8, background: "linear-gradient(135deg, #0d6efd, #6610f2)", color: "white",
                        padding: "8px 20px", fontSize: "0.85rem", opacity: aiBioLoading ? 0.7 : 1,
                      }}>
                      {aiBioLoading ? <span className="spinner-border spinner-border-sm" /> : <><i className="fa fa-magic" /> AI Generate</>}
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
                  <div className="d-flex mb-3" style={{ gap: 8 }}>
                    <input className="form-control rounded-pill" placeholder="Add a skill..." value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} />
                    <button type="button" className="btn btn-outline-primary rounded-pill px-4 fw-semibold" onClick={addSkill}>Add</button>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {form.skills.map((s, i) => (
                      <span key={i} style={{ background: "linear-gradient(135deg, #64748b, #475569)", color: "white", padding: "4px 14px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.3px", display: "flex", alignItems: "center", gap: 8 }}>
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
              {sectionTitle("fa-share-alt", "Social Links")}
              <div className="row g-3">
                {[
                  ["github", "fab fa-github", "GitHub URL"],
                  ["linkedin", "fab fa-linkedin", "LinkedIn URL"],
                  ["portfolio", "fa fa-briefcase", "Portfolio URL"],
                  ["youtube", "fab fa-youtube", "YouTube URL"],
                  ["twitter", "fab fa-twitter", "Twitter URL"],
                ].map(([k, icon, ph]) => (
                  <div className="col-md-6" key={k}>
                    <label className="form-label fw-semibold small d-flex align-items-center" style={{ gap: 5 }}><i className={icon} />{k.charAt(0).toUpperCase() + k.slice(1)}</label>
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

            <div className="learner-card p-4 mb-4">
              {sectionTitle("fa-envelope", "Email Verification")}
              {isVerified ? (
                <div className="d-flex align-items-center" style={{ gap: 8 }}>
                  <i className="fa fa-check-circle text-success" style={{ fontSize: "1.2rem" }} />
                  <span className="small text-success fw-semibold">Verified</span>
                </div>
              ) : (
              <div className="d-flex align-items-center justify-content-between flex-wrap" style={{ gap: 10 }}>
                <p className="mb-0 small text-muted d-flex align-items-center" style={{ gap: 6 }}>
                  <i className="fa fa-exclamation-triangle text-warning" />
                  Your email is not verified. Please check your inbox or resend the verification email.
                </p>
                <LoadingButton className="btn btn-outline-primary rounded-pill px-4 fw-semibold d-inline-flex align-items-center" style={{ gap: 8 }} onClick={handleResendVerification} loading={verifySending}>
                  <i className="fa fa-paper-plane" />Resend Verification
                </LoadingButton>
              </div>
              )}
            </div>

            <div className="learner-card p-4 mb-4">
              {sectionTitle("fa-calendar", "Calendar Sync")}
              {calendarLoading ? (
                <div className="text-center py-3"><span className="spinner-border spinner-border-sm text-primary" /></div>
              ) : (
                <div className="d-flex align-items-center justify-content-between flex-wrap" style={{ gap: 10 }}>
                  <div>
                    {calendarConnected ? (
                      <p className="mb-0 small d-flex align-items-center" style={{ gap: 6 }}>
                        <i className="fa fa-check-circle text-success" />
                        Connected as <strong>{calendarEmail}</strong>
                      </p>
                    ) : (
                      <p className="text-muted small mb-0 d-flex align-items-center" style={{ gap: 6 }}>
                        <i className="fa fa-info-circle" />
                        Sync accepted bookings to your Google Calendar automatically.
                      </p>
                    )}
                  </div>
                  {calendarConnected ? (
                    <LoadingButton className="btn btn-outline-danger rounded-pill px-4 fw-semibold" onClick={handleDisconnectCalendar}>
                      Disconnect
                    </LoadingButton>
                  ) : (
                    <LoadingButton className="btn btn-outline-primary rounded-pill px-4 fw-semibold d-inline-flex align-items-center" style={{ gap: 8 }} onClick={handleConnectCalendar}>
                      <i className="fa fa-google" />Connect Google Calendar
                    </LoadingButton>
                  )}
                </div>
              )}
            </div>

            <div className="learner-card p-4 mb-4" style={{ borderLeft: "4px solid #dc2626" }}>
              {sectionTitle("fa-trash", "Danger Zone")}
              <p className="small text-muted mb-3">
                Once you delete your account, your profile and personal data will be permanently removed. Your reviews and session history will remain but be anonymized.
              </p>
              <button className="btn btn-outline-danger rounded-pill px-4 fw-semibold d-inline-flex align-items-center" style={{ gap: 8 }} onClick={() => setShowDeleteModal(true)}>
                <i className="fa fa-trash" />Delete My Account
              </button>
            </div>

            <div className="d-flex justify-content-center mb-4" style={{ gap: 10 }}>
              <LoadingButton loading={saving} type="submit" className="btn btn-primary rounded-pill px-5 py-2 fw-semibold d-inline-flex align-items-center" style={{ gap: 8 }}>
                <i className="fa fa-save" />Save Changes
              </LoadingButton>
            </div>
          </form>

          {/* Delete Account Modal */}
          {showDeleteModal && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1050 }}
              onClick={() => { setShowDeleteModal(false); setDeletePassword(""); }}>
              <div style={{ background: "#fff", borderRadius: 20, padding: 32, maxWidth: 400, width: "90%", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
                onClick={(e) => e.stopPropagation()}>
                <h5 className="fw-bold mb-2" style={{ color: "#dc2626" }}>Delete Account</h5>
                <p className="small text-muted mb-3">This action is permanent. Enter your password to confirm.</p>
                <input type="password" className="form-control rounded-pill mb-3" placeholder="Enter your password"
                  value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />
                <div className="d-flex gap-2 justify-content-end">
                  <button className="btn btn-secondary rounded-pill px-4" onClick={() => { setShowDeleteModal(false); setDeletePassword(""); }}>Cancel</button>
                  <LoadingButton loading={deleting} className="btn btn-danger rounded-pill px-4 fw-semibold d-inline-flex align-items-center" style={{ gap: 8 }} onClick={handleDeleteAccount}>
                    <i className="fa fa-trash" />Delete
                  </LoadingButton>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Settings;
