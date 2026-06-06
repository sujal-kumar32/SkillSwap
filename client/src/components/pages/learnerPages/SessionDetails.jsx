import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import UserLink from "../../../components/shared/UserLink";
import { showToast } from "../../../utils/toastUtils";
import Apiservices from "../../../../Apiservices";
import { EmptyState, LoadingState, PageHeader, SessionCard, StatusBadge } from "../../learner/LearnerUI";
import SessionMaterials from "../../shared/SessionMaterials";

const SessionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [mentorSlots, setMentorSlots] = useState([]);
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
        const mentorId = detailRes.data.data?.mentorId?._id || detailRes.data.data?.mentorId;
        if (mentorId) {
          Apiservices.getMentorAvailability(mentorId).then((avRes) => {
            setMentorSlots(avRes.data.data?.slots || []);
          }).catch(() => {});
        }
        setSession(detailRes.data.data);
        setSaved(detailRes.data.data?.isSaved || false);
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

  const availabilityText = useMemo(() => {
    if (!mentorSlots.length) return null;
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const daySlots = mentorSlots.map((s) => {
      const day = dayNames[s.dayOfWeek] || "?";
      return `${day} ${s.startTime?.slice(0, 5)}–${s.endTime?.slice(0, 5)}`;
    });
    if (daySlots.length <= 3) return daySlots.join(", ");
    return `${daySlots.slice(0, 3).join(", ")} +${daySlots.length - 3} more`;
  }, [mentorSlots]);

  const handleToggleSave = useCallback(async (sess) => {
    const targetId = sess?._id || session?._id;
    if (!targetId) return;
    try {
      const res = await Apiservices.toggleWishlist(targetId);
      if (targetId === session?._id) setSaved(res.data.saved);
      showToast.success(res.data.message);
    } catch (err) {
      showToast.error(err.response?.data?.message || "Failed to toggle wishlist");
    }
  }, [session?._id]);

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
          <span className="d-inline-flex align-items-center" style={{ gap: 6, background: existingBooking.requestStatus === "completed" ? "linear-gradient(135deg, #0d6efd, #0a58ca)" : "linear-gradient(135deg, #16a34a, #15803d)", color: "white", padding: "4px 14px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.3px" }}><i className="fa fa-check" />{existingBooking.requestStatus === "completed" ? "Completed" : "Already Booked"}</span>
        ) : (
          <button className="btn btn-primary rounded-pill px-4" onClick={() => navigate(`/learner/book/${session._id}`)}>Book Session</button>
        )}
      />

      <div className="row g-4">
        <div className="col-xl-8">
          <div className="learner-card overflow-hidden mb-4">
            <img src={session.thumbnail} alt={session.title} className="w-100" style={{ height: 330, objectFit: "cover" }} />
            <div className="p-4">
              <div className="d-flex flex-wrap mb-3" style={{ gap: "10px" }}>
                <StatusBadge status={session.status} />
                <span style={{ background: "linear-gradient(135deg, #64748b, #475569)", color: "white", padding: "4px 14px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.3px" }}>{session.skillId?.categoryId?.name || "Learning"}</span>
              </div>
              <h4 className="fw-bold">About this session</h4>
              <p className="text-muted">{session.description || "A practical learning session led by a SkillSwap mentor."}</p>

              <h5 className="fw-bold mt-4">Learning outcomes</h5>
              <ul className="text-muted">
                {outcomes.map((item) => <li key={item}>{item}</li>)}
              </ul>

              {existingBooking && (
                <div className="mt-4 p-3 rounded-4" style={{ background: "#f1f5f9" }}>
                  <SessionMaterials sessionId={id} mode="view" />
                </div>
              )}

              <h5 className="fw-bold mt-4">Reviews</h5>
              {reviews.length ? reviews.map((review) => (
                <div className="border-top py-3" key={review._id}>
                  <div className="text-warning mb-1">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
                  <p className="mb-1">{review.comment}</p>
                  <small className="text-muted"><UserLink user={review.learnerId} name={review.learner || review.learnerId?.name || "Anonymous"} /></small>
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
            <div className="d-flex align-items-center my-3" style={{ gap: "10px" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "#0d6efd" }}>
                <img src={session.mentorId?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.mentorId?.name || "Mentor")}&background=0d6efd&color=fff`} alt="Mentor" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
              <div>
                <h6 className="fw-bold mb-0"><UserLink user={session.mentorId} name={session.mentorId?.name || "SkillSwap Mentor"} /></h6>
                <small className="text-muted">{session.mentorId?.email || "mentor@skillswap.com"}</small>
                {session.mentorId?.trustScore != null && (() => {
                  const ts = session.mentorId.trustScore;
                  const bg = ts >= 90 ? "#d1fae5" : ts >= 70 ? "#fef3c7" : ts >= 50 ? "#ffedd5" : "#fee2e2";
                  const color = ts >= 90 ? "#065f46" : ts >= 70 ? "#92400e" : ts >= 50 ? "#9a3412" : "#991b1b";
                  const iconColor = ts >= 90 ? "#16a34a" : ts >= 70 ? "#d97706" : ts >= 50 ? "#ea580c" : "#dc2626";
                  return (
                    <div style={{ marginTop: 5 }}>
                      <span className="badge" style={{ background: bg, color, fontSize: "0.7rem" }}>
                        <i className="fa fa-shield-alt" style={{ marginRight: 5, color: iconColor }} />Trust {ts}/100
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
            {availabilityText && (
              <div className="mb-3 p-3 rounded-4" style={{ background: "#f1f5f9" }}>
                <small className="fw-semibold text-muted text-uppercase" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>Weekly Availability</small>
                <p className="small mb-0 mt-1">{availabilityText}</p>
              </div>
            )}
            <div className="list-group list-group-flush mb-3">
              <div className="list-group-item px-0 d-flex justify-content-between"><span>Date</span><strong>{session.date || "Flexible"}</strong></div>
              <div className="list-group-item px-0 d-flex justify-content-between"><span>Time</span><strong>{session.time || "Flexible"}</strong></div>
              <div className="list-group-item px-0 d-flex justify-content-between"><span>Duration</span><strong>{session.duration || 60} min</strong></div>
              <div className="list-group-item px-0 d-flex justify-content-between"><span>Session</span><strong>{session.maxLearners > 0 ? "Group" : "1:1"}</strong></div>
              {session.maxLearners > 0 && (
                <div className="list-group-item px-0 d-flex justify-content-between">
                  <span>Spots</span>
                  <strong>{session.spotsFilled || 0} / {session.maxLearners} filled</strong>
                </div>
              )}
              <div className="list-group-item px-0 d-flex justify-content-between"><span>Price</span><strong>{session.price ? `₹${session.price}` : "Free"}</strong></div>
              {session.bookingTypes?.includes("credits") && session.creditCost > 0 && (
                <div className="list-group-item px-0 d-flex justify-content-between"><span>Credit Cost</span><strong className="text-success">{session.creditCost} credits</strong></div>
              )}
            </div>
            <div className="d-flex flex-column" style={{ gap: 10 }}>
              {!existingBooking ? (
                <button className="btn btn-primary rounded-pill d-inline-flex align-items-center justify-content-center" style={{ gap: 6 }} onClick={() => navigate(`/learner/book/${session._id}`)}>Book Session</button>
              ) : existingBooking.requestStatus === "completed" ? (
                <>
                  <span className="d-inline-flex align-items-center justify-content-center" style={{ gap: 6, background: "linear-gradient(135deg, #0d6efd, #0a58ca)", color: "white", padding: "10px 14px", borderRadius: 999, fontSize: "0.85rem", fontWeight: 600 }}>
                    <i className="fa fa-check-circle" />Completed
                  </span>
                  <button className="btn btn-outline-warning rounded-pill d-inline-flex align-items-center justify-content-center" style={{ gap: 6 }} onClick={() => navigate(`/learner/reviews?session=${session._id}`)}>
                    <i className="fa fa-star" />Leave a Review
                  </button>
                </>
              ) : (
                <button className="btn btn-success rounded-pill d-inline-flex align-items-center justify-content-center" style={{ gap: 6 }} disabled><i className="fa fa-check" />Already Booked</button>
              )}
              {(!existingBooking || existingBooking.requestStatus !== "completed") && (
                <button className="btn btn-outline-secondary rounded-pill d-inline-flex align-items-center justify-content-center" style={{ gap: 6 }} onClick={() => handleToggleSave(session)}>
                  <i className={`fa ${saved ? "fa-heart" : "fa-heart-o"}`} style={{ color: saved ? "#dc2626" : undefined }} />{saved ? "Saved" : "Save / Wishlist"}
                </button>
              )}
              <button className="btn btn-outline-primary rounded-pill d-inline-flex align-items-center justify-content-center" style={{ gap: 6 }} onClick={() => navigator.clipboard?.writeText(window.location.href)}><i className="fa fa-share-alt" />Share</button>
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
                <SessionCard session={item} onBook={() => navigate(`/learner/book/${item._id}`)} onToggleSave={handleToggleSave} />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default SessionDetails;
