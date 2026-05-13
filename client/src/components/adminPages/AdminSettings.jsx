import React from "react";
import { showToast } from "../../utils/toastUtils";

const AdminSettings = () => {
  const [settings, setSettings] = React.useState({
    siteName: "SkillSwap",
    siteDescription: "A platform for skill sharing and mentorship.",
    contactEmail: "admin@skillswap.com",
    maxLearnersPerSession: 30,
    defaultSessionDuration: 60,
    enableRegistration: true,
  });

  const handleChange = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    showToast.success("Settings saved (local only — no backend endpoint yet)");
  };

  return (
    <div>
      <div className="admin-page-header mb-4">
        <h1 className="fw-bold mb-1">System Settings</h1>
        <p className="text-muted mb-0">Configure platform-wide settings.</p>
      </div>

      <div className="admin-card" style={{ maxWidth: 620 }}>
        <div className="p-4">
          <form onSubmit={handleSave}>
            <div className="mb-3">
              <label className="form-label fw-semibold mb-1" style={{ color: "#1e293b" }}>Site Name</label>
              <input type="text" className="form-control" value={settings.siteName} onChange={handleChange("siteName")}
                style={{ borderRadius: 10, border: "1px solid #e2e8f0", padding: "10px 14px" }} />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold mb-1" style={{ color: "#1e293b" }}>Site Description</label>
              <textarea className="form-control" rows="2" value={settings.siteDescription} onChange={handleChange("siteDescription")}
                style={{ borderRadius: 10, border: "1px solid #e2e8f0", padding: "10px 14px" }} />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold mb-1" style={{ color: "#1e293b" }}>Contact Email</label>
              <input type="email" className="form-control" value={settings.contactEmail} onChange={handleChange("contactEmail")}
                style={{ borderRadius: 10, border: "1px solid #e2e8f0", padding: "10px 14px" }} />
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold mb-1" style={{ color: "#1e293b" }}>Max Learners/Session</label>
                <input type="number" className="form-control" value={settings.maxLearnersPerSession} onChange={handleChange("maxLearnersPerSession")}
                  style={{ borderRadius: 10, border: "1px solid #e2e8f0", padding: "10px 14px" }} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold mb-1" style={{ color: "#1e293b" }}>Default Duration (min)</label>
                <input type="number" className="form-control" value={settings.defaultSessionDuration} onChange={handleChange("defaultSessionDuration")}
                  style={{ borderRadius: 10, border: "1px solid #e2e8f0", padding: "10px 14px" }} />
              </div>
            </div>
            <div className="mb-4">
              <div className="form-check">
                <input type="checkbox" className="form-check-input" id="enableReg" checked={settings.enableRegistration} onChange={handleChange("enableRegistration")} />
                <label className="form-check-label fw-semibold" htmlFor="enableReg" style={{ color: "#1e293b" }}>Enable User Registration</label>
              </div>
            </div>
            <button type="submit" className="btn btn-primary rounded-pill px-4 fw-semibold" style={{ padding: "10px 28px" }}>
              <i className="fa fa-save me-2" />Save Settings
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
