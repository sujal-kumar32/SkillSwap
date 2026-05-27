import React, { useEffect, useState } from "react";
import Apiservices from "../../../../Apiservices";
import { EmptyState, LoadingState, PageHeader, StatCard } from "../../learner/LearnerUI";
import Pagination from "../../Pagination";

const MentorReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const average = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "—";
  const learnerSet = new Set(reviews.map((r) => r.learner || r.learnerId?.name).filter(Boolean));

  return (
    <>
      <PageHeader title="Mentor Reviews" subtitle="See what learners are saying about your sessions." />
      {error && <div className="alert alert-danger rounded-4">{error}</div>}

      <div className="row g-4 mb-4">
        <StatCard icon="fa-star" label="Average Rating" value={average} tone="warning" />
        <StatCard icon="fa-comments" label="Total Reviews" value={reviews.length} />
        <StatCard icon="fa-users" label="Learners Rated" value={learnerSet.size} tone="success" />
      </div>

      {loading ? <LoadingState /> : reviews.length ? (
        <div className="row g-4">
          {reviews.map((review) => (
            <div className="col-md-6" key={review._id}>
              <div className="learner-card p-4 h-100">
                <div className="d-flex justify-content-between align-items-start" style={{ gap: "10px" }}>
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <img
                        src={review.learnerId?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.learner || "L")}&background=0d6efd&color=fff&size=32`}
                        alt="" className="rounded-circle" width="32" height="32" style={{ objectFit: "cover" }}
                      />
                      <div>
                        <h6 className="fw-bold mb-0">{review.learner || review.learnerId?.name || "Anonymous"}</h6>
                        <small className="text-muted">{review.session}</small>
                      </div>
                    </div>
                  </div>
                  <div className="text-warning flex-shrink-0">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
                </div>
                {review.comment && <p className="text-muted mt-3 mb-0">{review.comment}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No Reviews Yet" text="You don't have any reviews from learners yet." />
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </>
  );
};

export default MentorReviews;
