import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Apiservices from "../../../Apiservices";

const SessionEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
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
          // setSession(data);
          setForm({
            title: data.title || "",
            description: data.description || "",
            price: data.price ?? 0,
            status: data.status || "active",
            sessionType: data.sessionType || "online",
            meetLink: data.meetLink || "",
          });
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
    const value =
      field === "price" ? Number(event.target.value) : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const response = await Apiservices.updateSession(id, form);
      if (response.data.success) {
        toast.success("Session updated successfully");
        navigate(-1);
      } else {
        toast.error(response.data.message || "Failed to update session");
      }
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Failed to update session");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Edit Session</h1>
          <p className="text-muted">Change session details and save updates.</p>
        </div>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="row gx-4 gy-4">
              <div className="col-md-6">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.title}
                  onChange={handleChange("title")}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Price</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.price}
                  onChange={handleChange("price")}
                  min="0"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Status</label>
                <select
                  className="form-control"
                  value={form.status}
                  onChange={handleChange("status")}
                >
                  <option value="active">active</option>
                  <option value="completed">completed</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Session Type</label>
                <select
                  className="form-control"
                  value={form.sessionType}
                  onChange={handleChange("sessionType")}
                >
                  <option value="online">online</option>
                  <option value="offline">offline</option>
                </select>
              </div>

              <div className="col-12">
                <label className="form-label">Meeting Link</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.meetLink}
                  onChange={handleChange("meetLink")}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={form.description}
                  onChange={handleChange("description")}
                />
              </div>

              <div className="col-12">
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionEdit;
