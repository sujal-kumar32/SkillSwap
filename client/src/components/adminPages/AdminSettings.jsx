import React, { useEffect, useState } from "react";
import { showToast } from "../../utils/toastUtils";
import LoadingButton from "../../utils/LoadingButton";
import Apiservices from "../../../Apiservices";
import { LoadingState } from "../learner/LearnerUI";

const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await Apiservices.getSettings();
        setSettings(res.data.data);
      } catch {
        showToast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleChange = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await Apiservices.updateSettings(settings);
      showToast.success("Settings saved");
    } catch {
      showToast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="admin-page-header mb-4">
          <h1 className="fw-bold mb-1">System Settings</h1>
          <p className="text-muted mb-0">Configure platform-wide settings.</p>
        </div>
        <LoadingState />
      </div>
    );
  }

  return (
    <div>
      <style>{`
        .settings-card {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(10px);
          border-radius: 35px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.08);
          max-width: 720px;
        }
        .settings-header {
          background: linear-gradient(135deg, #0d6efd, #6610f2);
          padding: 30px 35px;
          color: white;
        }
        .settings-control {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 14px 16px;
          transition: 0.3s;
          font-size: 0.95rem;
        }
        .settings-control:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 4px rgba(13,110,253,0.12);
          outline: none;
        }
      `}</style>

      <div className="admin-page-header mb-4">
        <h1 className="fw-bold mb-1">System Settings</h1>
        <p className="text-muted mb-0">Configure platform-wide settings.</p>
      </div>

      <div className="settings-card">
        <div className="settings-header">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1 text-white">Platform Configuration</h2>
              <p className="mb-0 text-white opacity-75">Manage your platform branding, limits, and preferences.</p>
            </div>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
              <i className="fa fa-cog" />
            </div>
          </div>
        </div>

        <div className="p-5">
          <form onSubmit={handleSave}>
            <h5 className="fw-bold mb-4" style={{ color: "#1e293b" }}>General</h5>
            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Site Name</label>
                <input type="text" className="settings-control" value={settings.siteName} onChange={handleChange("siteName")} placeholder="SkillSwap" />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Contact Email</label>
                <input type="email" className="settings-control" value={settings.contactEmail} onChange={handleChange("contactEmail")} placeholder="admin@skillswap.com" />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">Site Description</label>
                <textarea className="settings-control" rows="3" value={settings.siteDescription} onChange={handleChange("siteDescription")} placeholder="Description" style={{ resize: "vertical" }} />
              </div>
            </div>

            <hr className="my-4" style={{ borderColor: "#eef2f7" }} />

            <h5 className="fw-bold mb-4" style={{ color: "#1e293b" }}>Session Defaults</h5>
            <div className="row g-4 mb-4">
              <div className="col-md-4">
                <label className="form-label fw-semibold">Max Learners / Session</label>
                <input type="number" className="settings-control" value={settings.maxLearnersPerSession} onChange={handleChange("maxLearnersPerSession")} min="1" />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Default Duration (min)</label>
                <input type="number" className="settings-control" value={settings.defaultSessionDuration} onChange={handleChange("defaultSessionDuration")} min="5" />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Platform Fee (%)</label>
                <input type="number" className="settings-control" value={settings.platformFee} onChange={handleChange("platformFee")} min="0" step="0.5" />
              </div>
            </div>

            <hr className="my-4" style={{ borderColor: "#eef2f7" }} />

            <h5 className="fw-bold mb-4" style={{ color: "#1e293b" }}>Preferences</h5>
            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Currency</label>
                <select className="settings-control" value={settings.currency} onChange={handleChange("currency")}>
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Timezone</label>
                <select className="settings-control" value={settings.timezone} onChange={handleChange("timezone")}>
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div className="col-12">
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" id="enableReg" checked={settings.enableRegistration} onChange={handleChange("enableRegistration")} />
                  <label className="form-check-label fw-semibold" htmlFor="enableReg">Enable User Registration</label>
                </div>
              </div>
            </div>

            <div className="pt-3">
              <LoadingButton loading={saving} type="submit" className="btn btn-primary rounded-pill px-5 py-3 fw-semibold" style={{ fontSize: "1rem" }}>
                <i className="fa fa-save me-2" />Save Settings
              </LoadingButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
