import React, { useEffect, useRef, useState } from "react";
import TopBar from "../layout/user/TopBar";
import { showToast } from "../../utils/toastUtils";
import LoadingButton from "../../utils/LoadingButton";
import Apiservices from "../../../Apiservices";

const Profile = () => {
  const fileInputRef = useRef(null);
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");
  const isMentor = roles.includes("mentor");
  const [activeTab, setActiveTab] = useState("general");

  const [profile, setProfile] = useState({
    name: "", email: "", bio: "", image: "",
    interests: "", goals: "",
    linkedin: "", github: "", portfolio: "",
    oldPassword: "", newPassword: "",
  });
  const [profileFile, setProfileFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setError("");
        const response = await Apiservices.getProfile();
        const user = response.data.data || {};
        setProfile((prev) => ({
          ...prev,
          name: user.name || "",
          email: user.email || "",
          bio: user.bio || "",
          image: user.profileImage || "",
          interests: (user.interests || []).join(", "),
          goals: user.learningGoals || "",
          linkedin: user.socialLinks?.linkedin || "",
          github: user.socialLinks?.github || "",
          portfolio: user.socialLinks?.portfolio || "",
        }));
      } catch (error) {
        console.log(error);
        setError(error.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileFile(file);
      setProfile((prev) => ({ ...prev, image: URL.createObjectURL(file) }));
    }
  };

  const clearFile = () => {
    setProfileFile(null);
    if (profile.image?.startsWith("blob:")) URL.revokeObjectURL(profile.image);
    setProfile((prev) => ({ ...prev, image: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const data = new FormData();
      data.append("name", profile.name);
      data.append("email", profile.email);
      data.append("bio", profile.bio);
      data.append("interests", profile.interests);
      data.append("goals", profile.goals);
      data.append("linkedin", profile.linkedin);
      data.append("github", profile.github);
      data.append("portfolio", profile.portfolio);
      if (profileFile) data.append("profileImage", profileFile);
      else if (profile.image && !profile.image.startsWith("blob:")) data.append("image", profile.image);
      if (profile.oldPassword || profile.newPassword) {
        data.append("oldPassword", profile.oldPassword);
        data.append("newPassword", profile.newPassword);
      }
      await Apiservices.updateProfile(data);
      showToast.success("Profile updated");
    } catch (error) {
      console.log(error);
      showToast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <TopBar />
        <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
          <div className="spinner-border text-primary" style={{ width: 48, height: 48 }} role="status" />
        </div>
      </>
    );
  }

  const tabs = [
    { id: "general", label: "General", icon: "fa-user" },
    { id: "social", label: "Social Links", icon: "fa-share-nodes" },
    { id: "security", label: "Security", icon: "fa-shield" },
  ];

  return (
    <>
      <TopBar />
      <div className="bg-image" style={{ minHeight: "calc(100vh - 64px)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
        {error && <div className="alert alert-danger rounded-4 mb-4">{error}</div>}

        {/* Profile Header */}
        <div className="learner-card p-4 mb-4">
          <div className="row align-items-center g-4">
            <div className="col-auto">
              <div style={{ position: "relative" }}>
                <img src={profile.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=0d6efd&color=fff&size=160`}
                  alt={profile.name} style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", border: "4px solid #eef2f7" }} />
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  style={{ position: "absolute", bottom: 2, right: 2, width: 32, height: 32, borderRadius: "50%", border: "2px solid white", background: "#0d6efd", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "0.75rem" }}>
                  <i className="fa fa-camera" />
                </button>
                <input type="file" ref={fileInputRef} accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
              </div>
            </div>
            <div className="col">
              <h3 className="fw-bold mb-1" style={{ color: "#1e293b" }}>{profile.name}</h3>
              <p className="text-muted mb-2">{profile.email}</p>
              <div className="d-flex gap-2">
                {isMentor && <span className="badge bg-primary rounded-pill">Mentor</span>}
                <span className="badge bg-light text-dark rounded-pill">Learner</span>
              </div>
            </div>
            <div className="col-auto d-flex gap-4 text-center">
              <div><div className="fw-bold fs-5" style={{ color: "#1e293b" }}>—</div><small className="text-muted">Sessions</small></div>
              <div><div className="fw-bold fs-5" style={{ color: "#1e293b" }}>—</div><small className="text-muted">Reviews</small></div>
              <div><div className="fw-bold fs-5" style={{ color: "#1e293b" }}>—</div><small className="text-muted">Skills</small></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="d-flex gap-2 mb-4" style={{ borderBottom: "1px solid #eef2f7", paddingBottom: 0 }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`btn btn-sm rounded-top-3 fw-semibold px-4 py-2 ${activeTab === t.id ? "btn-primary" : "btn-outline-secondary border-0"}`}
              style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, fontSize: "0.85rem" }}>
              <i className={`fa ${t.icon} me-2`} />{t.label}
            </button>
          ))}
        </div>

        <form onSubmit={saveProfile}>
          {/* General Tab */}
          {activeTab === "general" && (
            <div className="learner-card p-4">
              <h5 className="fw-bold mb-3" style={{ color: "#1e293b" }}>Basic Details</h5>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Full name</label>
                  <input name="name" className="form-control rounded-pill" value={profile.name} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Email</label>
                  <input name="email" type="email" className="form-control rounded-pill" value={profile.email} onChange={handleChange} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Bio</label>
                  <textarea name="bio" className="form-control rounded-4" rows="3" value={profile.bio} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">{isMentor ? "Skills / Expertise" : "Skills / Interests"}</label>
                  <input name="interests" className="form-control rounded-pill" value={profile.interests} onChange={handleChange} placeholder="e.g. React, Node.js" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">{isMentor ? "Teaching Goals" : "Learning Goals"}</label>
                  <input name="goals" className="form-control rounded-pill" value={profile.goals} onChange={handleChange} placeholder="e.g. Master full-stack development" />
                </div>
              </div>
            </div>
          )}

          {/* Social Tab */}
          {activeTab === "social" && (
            <div className="learner-card p-4">
              <h5 className="fw-bold mb-3" style={{ color: "#1e293b" }}>Social Links</h5>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label fw-semibold"><i className="fab fa-linkedin text-primary me-2" />LinkedIn</label>
                  <input name="linkedin" className="form-control rounded-pill" placeholder="https://linkedin.com/in/..." value={profile.linkedin} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold"><i className="fab fa-github text-dark me-2" />GitHub</label>
                  <input name="github" className="form-control rounded-pill" placeholder="https://github.com/..." value={profile.github} onChange={handleChange} />
                </div>
                {isMentor && (
                  <div className="col-md-6">
                    <label className="form-label fw-semibold"><i className="fa fa-briefcase text-warning me-2" />Portfolio</label>
                    <input name="portfolio" className="form-control rounded-pill" placeholder="https://..." value={profile.portfolio} onChange={handleChange} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="learner-card p-4">
              <h5 className="fw-bold mb-3" style={{ color: "#1e293b" }}>Change Password</h5>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Current password</label>
                  <input name="oldPassword" type="password" className="form-control rounded-pill" placeholder="Enter current password" value={profile.oldPassword} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">New password</label>
                  <input name="newPassword" type="password" className="form-control rounded-pill" placeholder="Enter new password" value={profile.newPassword} onChange={handleChange} />
                </div>
              </div>
            </div>
          )}

          <div className="d-flex justify-content-end mt-4">
            <LoadingButton loading={saving} type="submit" className="btn btn-primary rounded-pill px-5 py-2 fw-semibold">
              <i className="fa fa-save me-2" />Save Changes
            </LoadingButton>
          </div>
      </form>
      </div>
      </div>
    </>
  );
};

export default Profile;
