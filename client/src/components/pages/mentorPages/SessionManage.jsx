import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Apiservices from "../../../../Apiservices";
import { LoadingState, PageHeader } from "../../learner/LearnerUI";
import SessionMaterials from "../../shared/SessionMaterials";

const SessionManage = () => {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await Apiservices.getSession(id);
        setSession(res.data.data);
      } catch {
        setSession(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [id]);

  if (loading) return <LoadingState label="Loading session..." />;
  if (!session) {
    return (
      <div className="text-center py-5">
        <h5 className="fw-bold">Session not found</h5>
        <Link to="/mentor/my-sessions" className="btn btn-primary rounded-pill mt-3">Back to My Sessions</Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={session.title}
        subtitle={`${session.skillId?.name || "Skill"} • ${session.sessionType || "online"} session`}
        action={
          <Link to="/mentor/my-sessions" className="btn btn-outline-secondary rounded-pill px-4 d-inline-flex align-items-center" style={{ gap: 6 }}>
            <i className="fa fa-arrow-left" /> Back
          </Link>
        }
      />

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm p-4 rounded-4">
            <SessionMaterials sessionId={id} mode="manage" />
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm p-4 rounded-4">
            <h6 className="fw-bold mb-3 d-flex align-items-center" style={{ gap: 8 }}>
              <i className="fa fa-info-circle text-primary" /> Session Info
            </h6>
            <div className="d-flex flex-column" style={{ gap: 10 }}>
              {session.thumbnail && (
                <img src={session.thumbnail} alt={session.title} className="w-100 rounded-3" style={{ height: 160, objectFit: "cover" }} />
              )}
              <div className="d-flex justify-content-between"><small className="text-muted">Status</small><span className="fw-semibold small">{session.status}</span></div>
              <div className="d-flex justify-content-between"><small className="text-muted">Skill</small><span className="fw-semibold small">{session.skillId?.name || "-"}</span></div>
              <div className="d-flex justify-content-between"><small className="text-muted">Type</small><span className="fw-semibold small">{session.sessionType}</span></div>
              <div className="d-flex justify-content-between"><small className="text-muted">Price</small><span className="fw-semibold small">{session.price ? `₹${session.price}` : "Free"}</span></div>
              <div className="d-flex justify-content-between"><small className="text-muted">Duration</small><span className="fw-semibold small">{session.duration || 60} min</span></div>
              {session.date && (
                <div className="d-flex justify-content-between"><small className="text-muted">Date</small><span className="fw-semibold small">{new Date(session.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })}</span></div>
              )}
              {session.time && (
                <div className="d-flex justify-content-between"><small className="text-muted">Time</small><span className="fw-semibold small">{session.time}</span></div>
              )}
              {session.description && (
                <div className="pt-2 border-top">
                  <small className="text-muted d-block mb-1">Description</small>
                  <p className="small mb-0">{session.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SessionManage;
