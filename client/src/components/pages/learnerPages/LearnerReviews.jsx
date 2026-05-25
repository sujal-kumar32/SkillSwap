import React, { useEffect, useMemo, useState } from "react";
import { deleteConfirmAlert } from "../../../../src/utils/alertUtils";
import { showToast } from "../../../utils/toastUtils";
import LoadingButton from "../../../../src/utils/LoadingButton";
import Apiservices from "../../../../Apiservices";
import { EmptyState, LoadingState, PageHeader, StatCard } from "../../learner/LearnerUI";
import Pagination from "../../Pagination";

const LearnerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [form, setForm] = useState({ session: "", mentor: "", rating: 5, comment: "" });
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setError("");
        const response = await Apiservices.fetchReviews({ page, limit: 12 });
        setReviews(response.data.data || []);
        setTotalPages(response.data.pages || 1);
      } catch (error) {
        console.log(error);
        setReviews([]);
        setError(error.response?.data?.message || "Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [page]);

  const average = useMemo(
    () => (reviews.reduce((sum, review) => sum + review.rating, 0) / (reviews.length || 1)).toFixed(1),
    [reviews],
  );

  const submitReview = async (event) => {
    event.preventDefault();
    try {
      const response = await Apiservices.createReview(form);
      setReviews((prev) => [response.data.data, ...prev]);
      showToast.success("Review submitted");
    } catch (error) {
      console.log(error);
      showToast.error(error.response?.data?.message || "Failed to submit review");
      return;
    }
    setForm({ session: "", mentor: "", rating: 5, comment: "" });
    setShowReviewForm(false);
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
        <StatCard icon="fa-pen" label="Pending Reviews" value="3" tone="info" />
      </div>

      {loading ? <LoadingState /> : reviews.length ? (
        <div className="row g-4">
          {reviews.map((review) => (
            <div className="col-md-6" key={review._id}>
              <div className="learner-card p-4 h-100">
                <div className="d-flex justify-content-between">
                  <div>
                    <h5 className="fw-bold mb-1">{review.session}</h5>
                    <small className="text-muted">{review.mentor}</small>
                  </div>
                  <div className="text-warning">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
                </div>
                <p className="text-muted mt-3">{review.comment}</p>
                <div className="d-flex gap-2">
                  <LoadingButton
                    className="btn btn-outline-danger btn-sm rounded-pill"
                    onClick={async () => {
                      const confirmed = await deleteConfirmAlert("this review");
                      if (!confirmed) return;
                      try {
                        await Apiservices.deleteReview(review._id);
                        setReviews((prev) => prev.filter((item) => item._id !== review._id));
                        showToast.success("Review deleted");
                      } catch (error) {
                        console.log(error);
                        showToast.error(error.response?.data?.message || "Failed to delete review");
                      }
                    }}
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
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3" style={{ background: "rgba(15,23,42,.45)", zIndex: 1050 }}>
          <form className="learner-card p-4" style={{ maxWidth: 520, width: "100%" }} onSubmit={submitReview}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Give Review</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowReviewForm(false)} />
            </div>
            <input className="form-control mb-3" placeholder="Session name" value={form.session} onChange={(e) => setForm({ ...form, session: e.target.value })} required />
            <input className="form-control mb-3" placeholder="Mentor name" value={form.mentor} onChange={(e) => setForm({ ...form, mentor: e.target.value })} required />
            <select className="form-select mb-3" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
              {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
            </select>
            <textarea className="form-control mb-4" rows="4" placeholder="Feedback" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} required />
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowReviewForm(false)}>Cancel</button>
              <LoadingButton className="btn btn-primary rounded-pill px-4">Submit Review</LoadingButton>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default LearnerReviews;
