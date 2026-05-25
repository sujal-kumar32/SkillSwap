import React, { useEffect, useMemo, useState } from "react";
import { showToast } from "../../utils/toastUtils";
import Apiservices from "../../../Apiservices";
import { LoadingState } from "../learner/LearnerUI";
import Pagination from "../Pagination";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await Apiservices.fetchReviews({ page, limit: 15 });
        setReviews(res.data.data || []);
        setTotalPages(res.data.pages || 1);
      } catch (err) {
        showToast.error("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page]);

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      const q = search.toLowerCase();
      const matchSearch = (r.mentor || "").toLowerCase().includes(q) || (r.session || "").toLowerCase().includes(q);
      const matchFilter = filter === "All" || r.rating === Number(filter);
      return matchSearch && matchFilter;
    });
  }, [reviews, search, filter]);

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0.0";

  const ratings = [5, 4, 3, 2, 1];

  const handleSearch = (value) => { setSearch(value); setPage(1); };
  const handleFilter = (value) => { setFilter(value); setPage(1); };

  return (
    <div>
      <div className="admin-page-header mb-4">
        <h1 className="fw-bold mb-1">Reviews & Ratings</h1>
        <p className="text-muted mb-0">View all reviews and ratings across the platform.</p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-sm-4">
          <div className="admin-card p-4">
            <p className="text-muted mb-1 small fw-semibold text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.3px" }}>Total Reviews</p>
            <h3 className="fw-bold mb-0">{reviews.length}</h3>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="admin-card p-4">
            <p className="text-muted mb-1 small fw-semibold text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.3px" }}>Avg Rating</p>
            <h3 className="fw-bold mb-0" style={{ color: "#d97706" }}>{avgRating} <small className="fw-normal" style={{ fontSize: "0.9rem" }}>/ 5</small></h3>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="admin-card p-4">
            <p className="text-muted mb-1 small fw-semibold text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.3px" }}>5-Star Reviews</p>
            <h3 className="fw-bold mb-0" style={{ color: "#198754" }}>{reviews.filter((r) => r.rating === 5).length}</h3>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : (
        <div className="admin-card">
          <div className="p-4">
            <div className="row align-items-center g-3 mb-4">
              <div className="col-md-6">
                <input type="search" className="form-control rounded-pill" placeholder="Search by mentor or session"
                  value={search} onChange={(e) => handleSearch(e.target.value)}
                  style={{ background: "#f8faff", border: "1px solid #eef2f7", padding: "10px 16px" }} />
              </div>
              <div className="col-md-6 text-md-end">
                <button className={`btn btn-sm rounded-pill mx-1 fw-semibold ${filter === "All" ? "btn-primary" : "btn-outline-secondary"}`}
                  style={{ fontSize: "0.8rem" }} onClick={() => handleFilter("All")}>All</button>
                {ratings.map((r) => (
                  <button key={r} className={`btn btn-sm rounded-pill mx-1 fw-semibold ${filter === String(r) ? "btn-primary" : "btn-outline-secondary"}`}
                    style={{ fontSize: "0.8rem" }} onClick={() => handleFilter(String(r))}>{r}★</button>
                ))}
              </div>
            </div>

            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th className="fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", letterSpacing: "0.3px", borderBottom: "2px solid #eef2f7" }}>Learner</th>
                    <th className="fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", letterSpacing: "0.3px", borderBottom: "2px solid #eef2f7" }}>Session</th>
                    <th className="fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", letterSpacing: "0.3px", borderBottom: "2px solid #eef2f7" }}>Mentor</th>
                    <th className="fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", letterSpacing: "0.3px", borderBottom: "2px solid #eef2f7" }}>Rating</th>
                    <th className="fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", letterSpacing: "0.3px", borderBottom: "2px solid #eef2f7" }}>Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length ? (
                    filtered.map((r) => (
                      <tr key={r._id}>
                        <td className="fw-semibold" style={{ color: "#1e293b" }}>{r.learnerId?.name || "Unknown"}</td>
                        <td style={{ color: "#64748b" }}>{r.session || r.sessionId?.title}</td>
                        <td style={{ color: "#64748b" }}>{r.mentor || r.mentorId?.name}</td>
                        <td><span className="text-warning">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span></td>
                        <td style={{ color: "#64748b", maxWidth: 250 }} className="text-truncate">{r.comment || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" className="text-center py-4 text-muted">No reviews found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
