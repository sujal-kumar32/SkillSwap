import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Apiservices from "../../../Apiservices";

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
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Session Details</h1>
          <p className="text-muted">Review the paid session details.</p>
        </div>
        <div className="btn-group">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/admin/session/${id}/edit`)}
          >
            Edit Session
          </button>
        </div>
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
            <div className="row gx-4 gy-4">
              <div className="col-md-6">
                <h5 className="mb-2">{session.title}</h5>
                <p className="text-muted">
                  {session.description || "No description provided."}
                </p>
                <p>
                  <strong>Status:</strong> {session.status}
                </p>
                <p>
                  <strong>Price:</strong> ₹{session.price ?? 0}
                </p>
                <p>
                  <strong>Bookings:</strong> {session.bookings ?? 0}
                </p>
              </div>

              <div className="col-md-6">
                <p>
                  <strong>Skill:</strong> {session.skillId?.name || "Unknown"}
                </p>
                <p>
                  <strong>Session type:</strong>{" "}
                  {session.sessionType || "online"}
                </p>
                <p>
                  <strong>Meeting link:</strong> {session.meetLink || "Not set"}
                </p>
                <p>
                  <strong>Created:</strong>{" "}
                  {new Date(session.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionView;
