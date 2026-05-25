import React, { useEffect, useState } from "react";
import { showToast } from "../../utils/toastUtils";
import Apiservices from "../../../Apiservices";
import { LoadingState } from "../learner/LearnerUI";
import Pagination from "../Pagination";

const AdminProgress = () => {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await Apiservices.getAllProgress({ page, limit: 15 });
        setLearners(res.data.data || []);
        setTotalPages(res.data.pages || 1);
        setTotal(res.data.total || 0);
      } catch (err) {
        showToast.error("Failed to load learner progress");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page]);

  const activeCount = learners.filter((l) => l.totalBookings > 0).length;
  const avgCompletion = learners.length
    ? Math.round(learners.reduce((s, l) => s + l.completion, 0) / learners.length)
    : 0;

  return (
    <div>
      <div className="admin-page-header mb-4">
        <h1 className="fw-bold mb-1">Track Learning Progress</h1>
        <p className="text-muted mb-0">Monitor all learners' progress and engagement across the platform.</p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-sm-4">
          <div className="admin-card p-4">
            <p className="text-muted mb-1 small fw-semibold text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.3px" }}>Total Learners</p>
            <h3 className="fw-bold mb-0">{total}</h3>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="admin-card p-4">
            <p className="text-muted mb-1 small fw-semibold text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.3px" }}>Active Learners</p>
            <h3 className="fw-bold mb-0" style={{ color: "#198754" }}>{activeCount}</h3>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="admin-card p-4">
            <p className="text-muted mb-1 small fw-semibold text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.3px" }}>Avg Completion</p>
            <h3 className="fw-bold mb-0" style={{ color: "#0d6efd" }}>{avgCompletion}%</h3>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : (
        <div className="admin-card">
          <div className="p-4">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th className="fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", letterSpacing: "0.3px", borderBottom: "2px solid #eef2f7" }}>Learner</th>
                    <th className="fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", letterSpacing: "0.3px", borderBottom: "2px solid #eef2f7" }}>Email</th>
                    <th className="fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", letterSpacing: "0.3px", borderBottom: "2px solid #eef2f7" }}>Bookings</th>
                    <th className="fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", letterSpacing: "0.3px", borderBottom: "2px solid #eef2f7" }}>Completed</th>
                    <th className="fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", letterSpacing: "0.3px", borderBottom: "2px solid #eef2f7" }}>Progress</th>
                    <th className="fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", letterSpacing: "0.3px", borderBottom: "2px solid #eef2f7" }}>Skills</th>
                  </tr>
                </thead>
                <tbody>
                  {learners.length ? (
                    learners.map((l) => (
                      <tr key={l._id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <img src={l.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(l.name)}&background=0d6efd&color=fff`}
                              alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
                            <span className="fw-semibold" style={{ color: "#1e293b" }}>{l.name}</span>
                          </div>
                        </td>
                        <td style={{ color: "#64748b" }}>{l.email}</td>
                        <td className="fw-semibold">{l.totalBookings}</td>
                        <td style={{ color: "#198754" }}>{l.completedBookings}</td>
                        <td style={{ minWidth: 140 }}>
                          <div className="d-flex align-items-center gap-2">
                            <div className="progress flex-grow-1" style={{ height: 8, borderRadius: 999, background: "#eef2f7" }}>
                              <div className="progress-bar" style={{ width: `${l.completion}%`, borderRadius: 999, background: l.completion > 50 ? "#198754" : l.completion > 20 ? "#d97706" : "#ef4444" }} />
                            </div>
                            <small className="fw-semibold" style={{ color: "#64748b" }}>{l.completion}%</small>
                          </div>
                        </td>
                        <td style={{ color: "#64748b" }}>
                          {l.skills?.length ? l.skills.slice(0, 2).join(", ") + (l.skills.length > 2 ? "..." : "") : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="6" className="text-center py-4 text-muted">No learners found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProgress;
