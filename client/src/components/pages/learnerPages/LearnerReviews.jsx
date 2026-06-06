import React, { useEffect, useMemo, useState } from "react";
import { deleteConfirmAlert } from "../../../../src/utils/alertUtils";
import { showToast } from "../../../utils/toastUtils";
import LoadingButton from "../../../../src/utils/LoadingButton";
import Apiservices from "../../../../Apiservices";
import { EmptyState, PageHeader, StatCard, CardSkeleton } from "../../learner/LearnerUI";
import Pagination from "../../Pagination";
import { useXpCelebration, BadgeUnlockModal } from "../../ui/XpCelebration";
import UserLink from "../../../components/shared/UserLink";

const Modal = ({ children }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 1050,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "16px", background: "rgba(15,23,42,.45)",
  }}>
    <div className="learner-card" style={{
      maxWidth: 500, width: "100%", maxHeight: "90vh", overflowY: "auto",
      padding: "24px",
    }}>
      {children}
    </div>
  </div>
);

const StarInput = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="d-flex gap-1" style={{ fontSize: "1.5rem", cursor: "pointer" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          style={{
            color: star <= (hover || value) ? "#f59e0b" : "#d1d5db",
            transition: "color 0.15s",
            userSelect: "none",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const LearnerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [form, setForm] = useState({ sessionId: "", session: "", mentor: "", rating: 5, comment: "" });
  const [editingReview, setEditingReview] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: "" });
  const [error, setError] = useState("");
  const { badgeData, setBadgeData, handleXpResponse } = useXpCelebration();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [allReviews, setAllReviews] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setError("");
        setLoading(true);
        const [reviewRes, bookingRes, allRes] = await Promise.all([
          Apiservices.fetchReviews({ page, limit: 12 }),
          Apiservices.fetchBookings({ limit: 100 }).catch(() => ({ data: { data: [] } })),
          Apiservices.fetchReviews({ limit: 10000 }).catch(() => ({ data: { data: [] } })),
        ]);
        setReviews(reviewRes.data.data || []);
        setTotalPages(reviewRes.data.pages || 1);
        setBookings(bookingRes.data.data || []);
        setAllReviews(allRes.data.data || []);
      } catch (error) {
        console.log(error);
        setReviews([]);
        setBookings([]);
        setError(error.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [page]);

  const reviewedSessionIds = useMemo(
    () => new Set(allReviews.map((r) => r.sessionId?._id || r.sessionId).filter(Boolean)),
    [allReviews],
  );

  const pendingCount = useMemo(
    () => bookings.filter(
      (b) => (b.requestStatus === "completed" || b.requestStatus === "accepted" || b.sessionId?.status === "completed")
        && !reviewedSessionIds.has(b.sessionId?._id || b.sessionId),
    ).length,
    [bookings, reviewedSessionIds],
  );

  const average = useMemo(
    () => (reviews.reduce((sum, review) => sum + review.rating, 0) / (reviews.length || 1)).toFixed(1),
    [reviews],
  );

  const availableBookings = useMemo(
    () => bookings.filter(
      (b) => (b.requestStatus === "completed" || b.requestStatus === "accepted" || b.sessionId?.status === "completed")
        && !reviewedSessionIds.has(b.sessionId?._id || b.sessionId),
    ),
    [bookings, reviewedSessionIds],
  );

  const handleSessionSelect = (sessionId) => {
    const booking = bookings.find((b) => (b.sessionId?._id || b.sessionId) === sessionId);
    if (booking) {
      setForm((prev) => ({
        sessionId,
        session: booking.sessionId?.title || "",
        mentor: booking.mentorId?.name || booking.sessionId?.mentorId?.name || "",
        rating: prev.rating,
        comment: prev.comment,
      }));
    }
  };

  const resetForm = () => {
    setForm({ sessionId: "", session: "", mentor: "", rating: 5, comment: "" });
  };

  const submitReview = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        rating: form.rating,
        comment: form.comment,
      };
      if (form.sessionId) {
        payload.sessionId = form.sessionId;
      } else {
        payload.session = form.session;
        payload.mentor = form.mentor;
      }
      const response = await Apiservices.createReview(payload);
      setReviews((prev) => [response.data.data, ...prev]);
      setAllReviews((prev) => [response.data.data, ...prev]);
      showToast.success("Review submitted");
      if (response.data?.xp) {
        handleXpResponse(response.data.xp);
      }
    } catch (error) {
      console.log(error);
      showToast.error(error.response?.data?.message || "Failed to submit review");
      return;
    }
    resetForm();
    setShowReviewForm(false);
  };

  const openEditReview = (review) => {
    setEditingReview(review);
    setEditForm({ rating: review.rating, comment: review.comment || "" });
  };

  const submitEditReview = async (event) => {
    event.preventDefault();
    if (!editingReview) return;
    try {
      const response = await Apiservices.updateReview(editingReview._id, editForm);
      setReviews((prev) => prev.map((r) => (r._id === editingReview._id ? { ...r, ...response.data.data } : r)));
      showToast.success("Review updated");
    } catch (error) {
      console.log(error);
      showToast.error(error.response?.data?.message || "Failed to update review");
      return;
    }
    setEditingReview(null);
    setEditForm({ rating: 5, comment: "" });
  };

  const handleDeleteReview = async (review) => {
    const confirmed = await deleteConfirmAlert("this review");
    if (!confirmed) return;
    try {
      await Apiservices.deleteReview(review._id);
      setReviews((prev) => prev.filter((item) => item._id !== review._id));
      setAllReviews((prev) => prev.filter((item) => item._id !== review._id));
      showToast.success("Review deleted");
    } catch (error) {
      console.log(error);
      showToast.error(error.response?.data?.message || "Failed to delete review");
    }
  };

  return (
    <>
      <PageHeader
        title="Reviews & Ratings"
        subtitle="Give mentor feedback and manage your previous reviews."
        action={<button className="btn btn-primary rounded-pill px-4" onClick={() => setShowReviewForm(true)}>Give Review</button>}
      />
      {error && <div className="alert alert-danger rounded-4">{error}</div>}
      <div className="row g-4 mb-4">
        <StatCard icon="fa-star" label="Average Rating Given" value={average} tone="warning" />
        <StatCard icon="fa-comments" label="Reviews Written" value={reviews.length} />
        <StatCard icon="fa-user-tie" label="Mentors Rated" value={new Set(reviews.map((r) => r.mentor)).size} tone="success" />
        <StatCard icon="fa-pen" label="Pending Reviews" value={pendingCount} tone="info" />
      </div>

      {loading ? (
        <div className="row g-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="col-md-6" key={i}><CardSkeleton lines={2} /></div>
          ))}
        </div>
      ) : reviews.length ? (
        <div className="row g-4">
          {reviews.map((review) => (
            <div className="col-md-6" key={review._id}>
              <div className="learner-card p-4 h-100">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h5 className="fw-bold mb-1">{review.session}</h5>
                    <small className="text-muted"><UserLink userId={review.mentorId || booking?.mentorId?._id} name={review.mentor} /></small>
                  </div>
                  <span className="text-warning">{Array(review.rating).fill("★").join("")}{Array(5 - review.rating).fill("☆").join("")}</span>
                </div>
                <p className="text-muted mt-2 mb-3">{review.comment}</p>
                <div className="d-flex" style={{ gap: "10px" }}>
                  <LoadingButton
                    className="btn btn-outline-primary btn-sm rounded-pill"
                    onClick={() => openEditReview(review)}
                  >
                    Edit
                  </LoadingButton>
                  <LoadingButton
                    className="btn btn-outline-danger btn-sm rounded-pill"
                    onClick={() => handleDeleteReview(review)}
                  >
                    Delete
                  </LoadingButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No reviews yet" text="After completing sessions, leave feedback for mentors." />
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {showReviewForm && (
        <Modal>
          <div style={{ margin: "-24px -24px 20px -24px", padding: "28px 24px", borderRadius: "20px 20px 0 0",
            background: "linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)", color: "#fff" }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-1" style={{ color: "#fff" }}>Write a Review</h5>
                <small style={{ opacity: 0.85 }}>Share your learning experience</small>
              </div>
              <button type="button" className="btn-close btn-close-white" onClick={() => { resetForm(); setShowReviewForm(false); }} />
            </div>
          </div>
          <form onSubmit={submitReview}>
            {availableBookings.length > 0 ? (
              <div className="mb-4">
                <label className="form-label fw-semibold text-muted small">Which session are you reviewing?</label>
                <select className="form-select" style={{ borderRadius: 12, padding: "10px 14px", border: "1px solid #e2e8f0", background: "#f8faff", maxWidth: "100%" }}
                  value={form.sessionId} onChange={(e) => handleSessionSelect(e.target.value)}>
                  <option value="">Select a session...</option>
                  {availableBookings.map((b) => (
                    <option key={b._id} value={b.sessionId?._id || b.sessionId}>
                      {(b.sessionId?.title || "Untitled Session").substring(0, 40)}{(b.sessionId?.title || "").length > 40 ? "…" : ""} — <UserLink user={b.mentorId} name={b.mentorId?.name || "Mentor"} />
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="mb-4">
                <label className="form-label fw-semibold text-muted small">Session Name</label>
                <input className="form-control mb-2" placeholder="e.g. React Basics" value={form.session} onChange={(e) => setForm((prev) => ({ ...prev, session: e.target.value }))} required={!form.sessionId} />
                <label className="form-label fw-semibold text-muted small">Mentor Name</label>
                <input className="form-control" placeholder="e.g. John Doe" value={form.mentor} onChange={(e) => setForm((prev) => ({ ...prev, mentor: e.target.value }))} required={!form.sessionId} />
              </div>
            )}
            <div className="mb-4">
              <label className="form-label fw-semibold text-muted small d-block mb-2">Your Rating</label>
              <div style={{ background: "#f8faff", borderRadius: 12, padding: "12px 16px", border: "1px solid #e2e8f0" }}>
                <StarInput value={form.rating} onChange={(v) => setForm((prev) => ({ ...prev, rating: v }))} />
                <div className="mt-1" style={{ fontSize: "0.8rem", color: form.rating >= 4 ? "#059669" : form.rating >= 3 ? "#d97706" : "#dc2626" }}>
                  {form.rating === 5 && "Excellent! Loved it"}
                  {form.rating === 4 && "Great session"}
                  {form.rating === 3 && "Good, but could be better"}
                  {form.rating === 2 && "Needs improvement"}
                  {form.rating === 1 && "Not satisfied"}
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold text-muted small">Feedback</label>
              <textarea className="form-control" rows="4" placeholder="What did you like? What could be improved?" value={form.comment} onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))} required
                style={{ borderRadius: 12, border: "1px solid #e2e8f0", resize: "vertical" }} />
            </div>
            <div className="d-flex justify-content-end gap-2 border-top pt-3" style={{ borderColor: "#eef2f7" }}>
              <button type="button" className="btn rounded-pill px-4" style={{ border: "1px solid #e2e8f0", color: "#64748b" }}
                onClick={() => { resetForm(); setShowReviewForm(false); }}>Cancel</button>
              <LoadingButton className="btn btn-primary rounded-pill px-4">Submit Review</LoadingButton>
            </div>
          </form>
        </Modal>
      )}

      {editingReview && (
        <Modal>
          <div style={{ margin: "-24px -24px 20px -24px", padding: "28px 24px", borderRadius: "20px 20px 0 0",
            background: "linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)", color: "#fff" }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-1" style={{ color: "#fff" }}>Edit Review</h5>
                <small style={{ opacity: 0.85 }}>Update your feedback</small>
              </div>
              <button type="button" className="btn-close btn-close-white" onClick={() => { setEditingReview(null); setEditForm({ rating: 5, comment: "" }); }} />
            </div>
          </div>
          <form onSubmit={submitEditReview}>
            <div style={{ background: "#f0f4fa", borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
              <div className="fw-bold" style={{ fontSize: "0.95rem" }}>{editingReview.session}</div>
              <div className="text-muted" style={{ fontSize: "0.85rem" }}>{editingReview.mentor}</div>
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold text-muted small d-block mb-2">Your Rating</label>
              <div style={{ background: "#f8faff", borderRadius: 12, padding: "12px 16px", border: "1px solid #e2e8f0" }}>
                <StarInput value={editForm.rating} onChange={(v) => setEditForm((prev) => ({ ...prev, rating: v }))} />
                <div className="mt-1" style={{ fontSize: "0.8rem", color: editForm.rating >= 4 ? "#059669" : editForm.rating >= 3 ? "#d97706" : "#dc2626" }}>
                  {editForm.rating === 5 && "Excellent! Loved it"}
                  {editForm.rating === 4 && "Great session"}
                  {editForm.rating === 3 && "Good, but could be better"}
                  {editForm.rating === 2 && "Needs improvement"}
                  {editForm.rating === 1 && "Not satisfied"}
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold text-muted small">Feedback</label>
              <textarea className="form-control" rows="4" placeholder="What did you like? What could be improved?" value={editForm.comment} onChange={(e) => setEditForm((prev) => ({ ...prev, comment: e.target.value }))} required
                style={{ borderRadius: 12, border: "1px solid #e2e8f0", resize: "vertical" }} />
            </div>
            <div className="d-flex justify-content-end gap-2 border-top pt-3" style={{ borderColor: "#eef2f7" }}>
              <button type="button" className="btn rounded-pill px-4" style={{ border: "1px solid #e2e8f0", color: "#64748b" }}
                onClick={() => { setEditingReview(null); setEditForm({ rating: 5, comment: "" }); }}>Cancel</button>
              <LoadingButton className="btn btn-primary rounded-pill px-4">Save Changes</LoadingButton>
            </div>
          </form>
        </Modal>
      )}
      <BadgeUnlockModal badges={badgeData} onClose={() => setBadgeData(null)} />
    </>
  );
};

export default LearnerReviews;