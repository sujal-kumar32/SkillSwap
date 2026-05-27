import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Apiservices from "../../../Apiservices";
import { LoadingState } from "../learner/LearnerUI";

const SessionView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const response = await Apiservices.getSession(id);
        if (response.data.success) {
          setSession(response.data.data);
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
    fetchSession();
  }, [id]);

  return (
    <div>
      <div className="admin-page-header mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center" style={{ gap: 10 }}>
          <div>
            <h1 className="fw-bold mb-1">Session Details</h1>
            <p className="text-muted mb-0">Review the paid session details.</p>
          </div>
          <div className="d-flex align-items-center" style={{ gap: 8 }}>
            <button className="btn btn-outline-secondary rounded-pill px-3 fw-semibold" style={{ fontSize: "0.85rem" }} onClick={() => navigate(-1)}>
              <i className="fa fa-arrow-left" /> Back
            </button>
            <button className="btn btn-primary rounded-pill px-3 fw-semibold" style={{ fontSize: "0.85rem" }} onClick={() => navigate(`/admin/session/${id}/edit`)}>
              <i className="fa fa-edit" /> Edit Session
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <div className="alert alert-danger rounded-4">{error}</div>
      ) : (
        <div className="admin-card p-4">
          <div className="row g-4">
            <div className="col-md-6">
              <h4 className="fw-bold mb-3">{session.title}</h4>
              <p style={{ color: "#64748b", lineHeight: 1.7 }}>{session.description || "No description provided."}</p>
              <div className="d-flex flex-wrap gap-4 mt-4">
                <div><span className="text-muted small">Status</span><br /><span className="fw-semibold">{session.status}</span></div>
                <div><span className="text-muted small">Price</span><br /><span className="fw-semibold">₹{session.price ?? 0}</span></div>
                <div><span className="text-muted small">Bookings</span><br /><span className="fw-semibold">{session.bookings ?? 0}</span></div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="p-4 rounded-4" style={{ background: "#f8faff" }}>
                <div className="mb-3"><span className="text-muted small">Skill</span><br /><span className="fw-semibold">{session.skillId?.name || "Unknown"}</span></div>
                <div className="mb-3"><span className="text-muted small">Session Type</span><br /><span className="fw-semibold">{session.sessionType || "online"}</span></div>
                <div className="mb-3"><span className="text-muted small">Meeting Link</span><br /><span className="fw-semibold">{session.meetLink || "Not set"}</span></div>
                <div><span className="text-muted small">Created</span><br /><span className="fw-semibold">{new Date(session.createdAt).toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionView;
