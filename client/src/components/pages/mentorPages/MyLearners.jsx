import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { showToast } from "../../../utils/toastUtils";
import Apiservices from "../../../../Apiservices";
import { PageHeader, LoadingState } from "../../learner/LearnerUI";
import Pagination from "../../Pagination";

const avatarFor = (name = "Learner", image) =>
  image || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0d6efd&color=fff`;

const Learners = () => {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchLearners = async () => {
      try {
        setLoading(true);
        const response = await Apiservices.getMentorLearners({ page, limit: 12 });
        setLearners(response.data.data || []);
        setTotalPages(response.data.pages || 1);
      } catch (error) {
        console.log(error);
        showToast.error(error.response?.data?.message || "Failed to load learners");
      } finally {
        setLoading(false);
      }
    };

    fetchLearners();
  }, [page]);

  const stats = useMemo(() => {
    const avgProgress = learners.length
      ? Math.round(
          learners.reduce((sum, learner) => sum + (learner.progress || 0), 0) /
            learners.length,
        )
      : 0;

    return {
      total: learners.length,
      avgProgress,
      sessions: learners.reduce(
        (sum, learner) => sum + (learner.sessions || 0),
        0,
      ),
    };
  }, [learners]);

  return (
    <>
      <PageHeader
        title="My Learners"
        subtitle="Track learner engagement and progress."
      />

      {/* BODY */}
      <div className="learners-wrapper mb-5">
        <div className="container">

          {/* STATS */}
          <div className="row g-4 mb-5">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm stats-card">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="stats-icon bg-primary">
                      <i className="fa fa-users"></i>
                    </div>

                    <div className="ms-3">
                      <h3 className="fw-bold mb-0">{stats.total}</h3>

                      <small className="text-muted">Total Learners</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm stats-card">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="stats-icon bg-success">
                      <i className="fa fa-chart-line"></i>
                    </div>

                    <div className="ms-3">
                      <h3 className="fw-bold mb-0">{stats.avgProgress}%</h3>

                      <small className="text-muted">Avg Progress</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm stats-card">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="stats-icon bg-warning">
                      <i className="fa fa-star"></i>
                    </div>

                    <div className="ms-3">
                      <h3 className="fw-bold mb-0">{stats.sessions}</h3>

                      <small className="text-muted">Joined Sessions</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* LEARNERS GRID */}
          <div className="row g-4">
            {loading ? (
              <div className="col-12"><LoadingState /></div>
            ) : learners.length ? (
              learners.map((learner) => (
              <div className="col-lg-3 col-md-6" key={learner._id}>
                <div className="card border-0 shadow-sm learner-card h-100">
                  <div className="card-body text-center p-4">
                    {/* IMAGE */}
                    <img
                      src={avatarFor(learner.name, learner.profileImage)}
                      alt={learner.name}
                      className="learner-image mb-3"
                    />

                    {/* INFO */}
                    <h5 className="fw-bold mb-1">{learner.name}</h5>

                    <p className="text-primary fw-semibold mb-3">
                      {learner.skills?.join(", ") || learner.lastSession || "Learner"}
                    </p>

                    {/* DETAILS */}
                    <div className="small text-muted mb-3">
                      <div className="mb-2">
                        <i className="fa fa-video text-primary me-2"></i>
                        {learner.sessions} Sessions Joined
                      </div>

                      <div>
                        <i className="fa fa-chart-line text-success me-2"></i>
                        Progress: {learner.progress}%
                      </div>
                    </div>

                    {/* PROGRESS */}
                    <div className="progress mb-4" style={{ height: "8px" }}>
                      <div
                        className="progress-bar bg-success"
                        style={{ width: `${learner.progress}%` }}
                      ></div>
                    </div>

                    {/* BUTTONS */}
                    <div className="d-flex gap-3 mt-3">
                      <button className="btn btn-primary rounded-pill flex-fill py-2" disabled>
                        <i className="fa fa-user me-2"></i>
                        Profile
                      </button>

                      <button className="btn btn-outline-dark rounded-pill flex-fill py-2" disabled>
                        <i className="fa fa-envelope me-2"></i>
                        Message
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
            ) : (
              <div className="col-12">
                <div className="card border-0 shadow-sm stats-card">
                  <div className="card-body text-center py-5">
                    <h5 className="fw-bold">No learners yet</h5>
                    <p className="text-muted mb-0">
                      Accepted learner bookings will appear here.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {/* CSS */}
      <style>
        {`
          .learners-wrapper {
            position: relative;
            background:
              radial-gradient(circle at top left, rgba(13,110,253,0.06), transparent 25%),
              radial-gradient(circle at bottom right, rgba(25,135,84,0.05), transparent 25%),
              linear-gradient(to bottom, #f8fbff, #f5f7ff);
            overflow: hidden;
          }

          .learner-card {
            border-radius: 24px;
            background: white !important;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            overflow: hidden;
          }

          .learner-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 24px 55px rgba(15,23,42,0.1) !important;
          }

          .stats-card {
            border-radius: 20px;
            background: rgba(255,255,255,0.88) !important;
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255,255,255,0.7) !important;
            transition: all 0.3s ease;
          }

          .stats-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 16px 40px rgba(15,23,42,0.06) !important;
          }

          .learner-image {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 50%;
            border: 4px solid #eef2ff;
          }

          .stats-icon {
            width: 56px;
            height: 56px;
            border-radius: 16px;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            flex-shrink: 0;
          }

          .btn {
            font-weight: 600;
          }
        `}
      </style>
    </>
  );
};

export default Learners;
