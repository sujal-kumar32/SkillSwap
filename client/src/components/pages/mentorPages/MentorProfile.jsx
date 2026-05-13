import React, { useEffect, useRef, useState } from "react";
import { showToast } from "../../../../src/utils/toastUtils";
import LoadingButton from "../../../../src/utils/LoadingButton";
import Apiservices from "../../../../Apiservices";
import { PageHeader } from "../../learner/LearnerUI";

const MentorProfile = () => {
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    image: "",
    interests: "",
    goals: "",
    linkedin: "",
    github: "",
    portfolio: "",
    oldPassword: "",
    newPassword: "",
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
    if (profile.image?.startsWith("blob:")) {
      URL.revokeObjectURL(profile.image);
    }
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
      if (profileFile) {
        data.append("profileImage", profileFile);
      } else if (profile.image && !profile.image.startsWith("blob:")) {
        data.append("image", profile.image);
      }
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
        <PageHeader title="Mentor Profile" subtitle="Manage your mentor profile details and settings." />
        <div className="learner-card p-5 text-center">
          <div className="spinner-border text-primary" role="status" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Mentor Profile" subtitle="Manage your mentor profile details and settings." />
      {error && <div className="alert alert-danger rounded-4">{error}</div>}

      <form className="row g-4" onSubmit={saveProfile}>
        <div className="col-xl-4">
          <div className="learner-card p-4 text-center">
            <img
              src={profile.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=0d6efd&color=fff&size=160`}
              alt={profile.name}
              className="rounded-circle mb-3"
              width="120"
              height="120"
              style={{ objectFit: "cover" }}
            />
            <h5 className="fw-bold mb-1">{profile.name}</h5>
            <p className="text-muted small mb-3">{profile.email}</p>
            <div className="d-flex justify-content-center gap-2">
              <button type="button" className="btn btn-outline-primary btn-sm rounded-pill" onClick={() => fileInputRef.current?.click()}>
                <i className="fa fa-camera me-1" /> Upload Photo
              </button>
              {profileFile && (
                <button type="button" className="btn btn-outline-danger btn-sm rounded-pill" onClick={clearFile}>
                  <i className="fa fa-times me-1" /> Remove
                </button>
              )}
            </div>
            <input type="file" ref={fileInputRef} accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
          </div>
        </div>

        <div className="col-xl-8">
          <div className="learner-card p-4 mb-4">
            <h5 className="fw-bold mb-3">Basic Details</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Full name</label>
                <input name="name" className="form-control rounded-pill" value={profile.name} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input name="email" type="email" className="form-control rounded-pill" value={profile.email} onChange={handleChange} />
              </div>
              <div className="col-12">
                <label className="form-label">Bio</label>
                <textarea name="bio" className="form-control rounded-4" rows="3" value={profile.bio} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Skills / Expertise</label>
                <input name="interests" className="form-control rounded-pill" value={profile.interests} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Teaching Goals</label>
                <input name="goals" className="form-control rounded-pill" value={profile.goals} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="learner-card p-4 mb-4">
            <h5 className="fw-bold mb-3">Social Links</h5>
            <div className="row g-3">
              <div className="col-md-4">
                <input name="linkedin" className="form-control rounded-pill" placeholder="LinkedIn URL" value={profile.linkedin} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <input name="github" className="form-control rounded-pill" placeholder="GitHub URL" value={profile.github} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <input name="portfolio" className="form-control rounded-pill" placeholder="Portfolio URL" value={profile.portfolio} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="learner-card p-4">
            <h5 className="fw-bold mb-3">Password & Account Settings</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <input name="oldPassword" type="password" className="form-control rounded-pill" placeholder="Current password" value={profile.oldPassword} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <input name="newPassword" type="password" className="form-control rounded-pill" placeholder="New password" value={profile.newPassword} onChange={handleChange} />
              </div>
            </div>
            <LoadingButton loading={saving} type="submit" className="btn btn-primary rounded-pill px-4 mt-4">
              Save Profile
            </LoadingButton>
          </div>
        </div>
      </form>
    </>
  );
};

export default MentorProfile;
