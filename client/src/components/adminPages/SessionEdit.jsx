import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { showToast } from "../../utils/toastUtils";
import LoadingButton from "../../utils/LoadingButton";
import Apiservices from "../../../Apiservices";
import { LoadingState } from "../learner/LearnerUI";

const SessionEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: 0,
    status: "active",
    sessionType: "online",
    meetLink: "",
    bookingTypes: ["paid"],
    creditCost: 0,
    creditSnapshot: null,
  });

  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await Apiservices.getSession(id);
        if (response.data.success) {
          const data = response.data.data;
          setForm({
            title: data.title || "",
            description: data.description || "",
            price: data.price ?? 0,
            status: data.status || "active",
            sessionType: data.sessionType || "online",
            meetLink: data.meetLink || "",
            bookingTypes: data.bookingTypes || ["paid"],
            creditCost: data.creditCost || 0,
            creditSnapshot: data.creditSnapshot || null,
          });
          if (data.thumbnail) setThumbnailPreview(data.thumbnail);
        } else {
          setError(response.data.message || "Session not found");
        }
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load session");
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, [id]);

  const handleChange = (field) => (event) => {
    const value = field === "price" ? Number(event.target.value) : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const clearThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const data = new FormData();
      data.append("title", form.title);
      data.append("description", form.description);
      data.append("price", form.price);
      data.append("status", form.status);
      data.append("sessionType", form.sessionType);
      data.append("meetLink", form.meetLink);
      data.append("bookingTypes", "paid");
      if (form.bookingTypes.includes("credits")) {
        data.append("bookingTypes", "credits");
      }
      if (thumbnailFile) data.append("thumbnail", thumbnailFile);
      const response = await Apiservices.updateSession(id, data);
      if (response.data.success) {
        showToast.success("Session updated successfully");
        navigate(-1);
      } else {
        showToast.error(response.data.message || "Failed to update session");
      }
    } catch (err) {
      console.log(err);
      showToast.error(err?.response?.data?.message || "Failed to update session");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="admin-page-header mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center" style={{ gap: 10 }}>
          <div>
            <h1 className="fw-bold mb-1">Edit Session</h1>
            <p className="text-muted mb-0">Change session details and save updates.</p>
          </div>
          <button className="btn btn-outline-secondary rounded-pill px-3 fw-semibold" style={{ fontSize: "0.85rem" }} onClick={() => navigate(-1)}>
            <i className="fa fa-arrow-left" /> Back
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <div className="alert alert-danger rounded-4">{error}</div>
      ) : (
        <div className="admin-card p-4">
          <form onSubmit={handleSubmit}>
            <h5 className="fw-bold mb-4 pb-3" style={{ borderBottom: "1px solid #eef2f7" }}>Basic Info</h5>
            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Title</label>
                <input type="text" className="form-control" value={form.title} onChange={handleChange("title")} required
                  style={{ borderRadius: 12, border: "1px solid #eef2f7", padding: "12px 16px" }} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Price (₹)</label>
                <input type="number" className="form-control" value={form.price} onChange={handleChange("price")} min="0"
                  style={{ borderRadius: 12, border: "1px solid #eef2f7", padding: "12px 16px" }} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Credits</label>
                <div className="d-flex flex-wrap align-items-center" style={{ gap: 10 }}>
                  <button type="button"
                    className={`px-3 py-1 fw-semibold rounded-pill border-0 ${form.bookingTypes.includes("credits") ? "btn btn-success" : "btn btn-outline-secondary"}`}
                    onClick={() => setForm((prev) => ({ ...prev, bookingTypes: prev.bookingTypes.includes("credits") ? ["paid"] : ["paid", "credits"] }))}
                    style={{ fontSize: "0.85rem" }}>
                    <i className={`fa ${form.bookingTypes.includes("credits") ? "fa-check-circle" : "fa-coins"}`} style={{ marginRight: 6 }} />
                    {form.bookingTypes.includes("credits") ? "Credits Enabled" : "Enable Credits"}
                  </button>
                  {form.bookingTypes.includes("credits") && (
                    <span className="d-inline-flex align-items-center" style={{ gap: 4, padding: "2px 8px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>
                      <i className="fa fa-coins" />{form.creditCost || "auto"} per booking
                    </span>
                  )}
                </div>
                <small className="text-muted" style={{ fontSize: "0.72rem" }}>Students can pay with skill credits instead of money</small>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Status</label>
                <select className="form-select" value={form.status} onChange={handleChange("status")}
                  style={{ borderRadius: 12, border: "1px solid #eef2f7", padding: "12px 16px" }}>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Session Type</label>
                <select className="form-select" value={form.sessionType} onChange={handleChange("sessionType")}
                  style={{ borderRadius: 12, border: "1px solid #eef2f7", padding: "12px 16px" }}>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>

            <h5 className="fw-bold mb-4 pb-3" style={{ borderBottom: "1px solid #eef2f7" }}>Media & Links</h5>
            <div className="d-flex flex-column" style={{ gap: 14 }}>
              <div>
                <label className="form-label fw-semibold">Thumbnail</label>
                <input type="file" ref={fileInputRef} accept="image/*" className="form-control" onChange={handleFileChange}
                  style={{ borderRadius: 12, border: "1px solid #eef2f7", padding: "10px 14px" }} />
                {thumbnailPreview && (
                  <div className="d-flex align-items-center" style={{ gap: 12, marginTop: 14 }}>
                    <img src={thumbnailPreview} alt="Thumbnail preview" className="rounded-3"
                      style={{ maxHeight: 80, objectFit: "cover" }} />
                    <button type="button" className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={clearThumbnail}>
                      <i className="fa fa-times me-1" /> Remove
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="form-label fw-semibold">Meeting Link</label>
                <input type="text" className="form-control" value={form.meetLink} onChange={handleChange("meetLink")}
                  style={{ borderRadius: 12, border: "1px solid #eef2f7", padding: "12px 16px" }} />
              </div>
            </div>

            <h5 className="fw-bold mt-4 mb-4 pb-3" style={{ borderBottom: "1px solid #eef2f7" }}>Description</h5>
            <textarea className="form-control" rows="4" value={form.description} onChange={handleChange("description")}
              style={{ borderRadius: 12, border: "1px solid #eef2f7", padding: "12px 16px", marginBottom: 24 }} />

            <div className="d-flex" style={{ gap: 10 }}>
              <LoadingButton loading={saving} type="submit" className="btn btn-primary rounded-pill px-4 fw-semibold"
                style={{ padding: "12px 24px" }}>
                Save Changes
              </LoadingButton>
              <button type="button" className="btn btn-outline-secondary rounded-pill px-4 fw-semibold"
                style={{ padding: "12px 24px" }} onClick={() => navigate(-1)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SessionEdit;
