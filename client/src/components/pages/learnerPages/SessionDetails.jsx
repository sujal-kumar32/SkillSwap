import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { showToast } from "../../../utils/toastUtils";
import Apiservices from "../../../../Apiservices";
import { EmptyState, LoadingState, PageHeader, SessionCard, StatusBadge } from "../../learner/LearnerUI";

const SessionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        setError("");
        const [detailRes, relatedRes, bookingRes] = await Promise.all([
          Apiservices.fetchSessionDetails(id),
          Apiservices.fetchSessions(),
          Apiservices.fetchBookings().catch(() => ({ data: { data: [] } })),
        ]);
        setSession(detailRes.data.data);
        setBookings(bookingRes.data.data || []);
        setRelated((relatedRes.data.data || []).filter((item) => item._id !== id));
        const reviewRes = await Apiservices.fetchReviews().catch(() => ({
          data: { data: [] },
        }));
        setReviews(
          (reviewRes.data.data || []).filter(
            (review) => (review.sessionId?._id || review.sessionId) === id,
          ),
        );
      } catch (error) {
        console.log(error);
        setSession(null);
        setRelated([]);
        setReviews([]);
        setError(error.response?.data?.message || "Failed to load session details");
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [id]);

  const existingBooking = bookings.find((b) => {
    const sId = b.sessionId?._id || b.sessionId;
    return sId === id && ["pending", "accepted", "completed"].includes(b.requestStatus);
  });

  if (loading) return <LoadingState label="Loading session details..." />;
  if (!session) {
    return (
      <EmptyState
        title="Session not found"
        text={error || "This session may no longer be available."}
        actionLabel="Explore Sessions"
        actionTo="/learner/explore"
      />
    );
  }

  const outcomes = [
    "Understand the core skill concepts through practical examples.",
    "Build confidence with mentor-guided practice.",
    "Leave with a clear next-step learning plan.",
  ];

  return (
    <>
      <PageHeader
        title={session.title}
        subtitle={`${session.skillId?.name || "Skill"} • ${session.sessionType || "online"} session`}
        action={existingBooking ? (
          <span className="badge bg-success rounded-pill px-4 py-2 fs-6 fw-semibold"><i className="fa fa-check me-1" />Already Booked</span>
        ) : (
          <button className="btn btn-primary rounded-pill px-4" onClick={() => navigate(`/learner/book/${session._id}`)}>Book Session</button>
        )}
      />

      <div className="row g-4">
        <div className="col-xl-8">
          <div className="learner-card overflow-hidden mb-4">
            <img src={session.thumbnail} alt={session.title} className="w-100" style={{ height: 330, objectFit: "cover" }} />
            <div className="p-4">
              <div className="d-flex flex-wrap gap-2 mb-3">
                <StatusBadge status={session.status} />
                <span className="badge bg-light text-primary">{session.skillId?.categoryId?.name || "Learning"}</span>
              </div>
              <h4 className="fw-bold">About this session</h4>
              <p className="text-muted">{session.description || "A practical learning session led by a SkillSwap mentor."}</p>

              <h5 className="fw-bold mt-4">Learning outcomes</h5>
              <ul className="text-muted">
                {outcomes.map((item) => <li key={item}>{item}</li>)}
              </ul>

              <h5 className="fw-bold mt-4">Reviews</h5>
              {reviews.length ? reviews.map((review) => (
                <div className="border-top py-3" key={review._id}>
                  <div className="text-warning mb-1">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
                  <p className="mb-1">{review.comment}</p>
                  <small className="text-muted">{review.mentor}</small>
                </div>
              )) : (
                <p className="text-muted mb-0">No reviews for this session yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="learner-card p-4 mb-4">
            <h5 className="fw-bold">Mentor</h5>
            <div className="d-flex align-items-center gap-3 my-3">
              <img src={session.mentorId?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.mentorId?.name || "Mentor")}&background=0d6efd&color=fff`} alt="Mentor" className="rounded-circle" width="56" height="56" style={{ objectFit: "cover" }} />
              <div>
                <h6 className="fw-bold mb-0">{session.mentorId?.name || "SkillSwap Mentor"}</h6>
                <small className="text-muted">{session.mentorId?.email || "mentor@skillswap.com"}</small>
              </div>
            </div>
            <div className="list-group list-group-flush mb-3">
              <div className="list-group-item px-0 d-flex justify-content-between"><span>Date</span><strong>{session.date || "Flexible"}</strong></div>
              <div className="list-group-item px-0 d-flex justify-content-between"><span>Time</span><strong>{session.time || "Flexible"}</strong></div>
              <div className="list-group-item px-0 d-flex justify-content-between"><span>Duration</span><strong>{session.duration || 60} min</strong></div>
              <div className="list-group-item px-0 d-flex justify-content-between"><span>Price</span><strong>{session.price ? `₹${session.price}` : "Free"}</strong></div>
            </div>
            <div className="d-grid gap-2">
              {existingBooking ? (
                <button className="btn btn-success rounded-pill" disabled><i className="fa fa-check me-1" />Already Booked</button>
              ) : (
                <button className="btn btn-primary rounded-pill" onClick={() => navigate(`/learner/book/${session._id}`)}>Book Session</button>
              )}
              <button className="btn btn-outline-secondary rounded-pill" onClick={() => showToast.info("Session saved")}>Save / Wishlist</button>
              <button className="btn btn-outline-primary rounded-pill" onClick={() => navigator.clipboard?.writeText(window.location.href)}>Share</button>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <>
          <h5 className="fw-bold mt-3 mb-3">Related Sessions</h5>
          <div className="row g-4">
            {related.slice(0, 3).map((item) => (
              <div className="col-md-6 col-xl-4" key={item._id}>
                <SessionCard session={item} onBook={() => navigate(`/learner/book/${item._id}`)} />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default SessionDetails;
