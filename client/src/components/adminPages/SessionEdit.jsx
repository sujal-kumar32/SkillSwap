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
        <div className="admin-card p-4" style={{ maxWidth: 720 }}>
          <form onSubmit={handleSubmit} className="row g-4">
            <div className="col-md-6">
              <label className="form-label fw-semibold" style={{ fontSize: "0.9rem" }}>Title</label>
              <input type="text" className="form-control" value={form.title} onChange={handleChange("title")} required
                style={{ borderRadius: 12, border: "1px solid #eef2f7", padding: "12px 16px" }} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold" style={{ fontSize: "0.9rem" }}>Price</label>
              <input type="number" className="form-control" value={form.price} onChange={handleChange("price")} min="0"
                style={{ borderRadius: 12, border: "1px solid #eef2f7", padding: "12px 16px" }} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold" style={{ fontSize: "0.9rem" }}>Status</label>
              <select className="form-control" value={form.status} onChange={handleChange("status")}
                style={{ borderRadius: 12, border: "1px solid #eef2f7", padding: "12px 16px" }}>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold" style={{ fontSize: "0.9rem" }}>Session Type</label>
              <select className="form-control" value={form.sessionType} onChange={handleChange("sessionType")}
                style={{ borderRadius: 12, border: "1px solid #eef2f7", padding: "12px 16px" }}>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold" style={{ fontSize: "0.9rem" }}>Thumbnail</label>
              <div className="d-flex align-items-center gap-3">
                <input type="file" ref={fileInputRef} accept="image/*" className="form-control" onChange={handleFileChange}
                  style={{ borderRadius: 12, border: "1px solid #eef2f7", padding: "10px 14px", maxWidth: 320 }} />
                {thumbnailPreview && (
                  <button type="button" className="btn btn-outline-danger btn-sm rounded-pill" onClick={clearThumbnail}>
                    <i className="fa fa-times me-1" /> Remove
                  </button>
                )}
              </div>
              {thumbnailPreview && (
                <img src={thumbnailPreview} alt="Thumbnail preview" className="mt-2 rounded-3"
                  style={{ maxHeight: 100, objectFit: "cover" }} />
              )}
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold" style={{ fontSize: "0.9rem" }}>Meeting Link</label>
              <input type="text" className="form-control" value={form.meetLink} onChange={handleChange("meetLink")}
                style={{ borderRadius: 12, border: "1px solid #eef2f7", padding: "12px 16px" }} />
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold" style={{ fontSize: "0.9rem" }}>Description</label>
              <textarea className="form-control" rows="4" value={form.description} onChange={handleChange("description")}
                style={{ borderRadius: 12, border: "1px solid #eef2f7", padding: "12px 16px" }} />
            </div>
            <div className="col-12">
              <LoadingButton loading={saving} type="submit" className="btn btn-primary rounded-pill px-4 fw-semibold"
                style={{ padding: "12px 32px" }}>
                Save Changes
              </LoadingButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SessionEdit;
