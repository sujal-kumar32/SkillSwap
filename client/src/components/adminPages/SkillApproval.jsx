import React, { useMemo, useState, useEffect } from "react";
import { confirmAlert, deleteConfirmAlert } from "../../utils/alertUtils";
import { showToast } from "../../utils/toastUtils";
import LoadingButton from "../../utils/LoadingButton";
import Apiservices from "../../../Apiservices";
import { LoadingState } from "../learner/LearnerUI";
import UserLink from "../shared/UserLink";
import Pagination from "../Pagination";

const SkillApproval = () => {
  const [skills, setSkills] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchSkills(filter === "deleted");
  }, [filter, page]);

  const fetchSkills = async (includeDeleted = false) => {
    try {
      setLoading(true);
      const response = await Apiservices.getSkills(includeDeleted, { page, limit: 10 });
      if (response.data.success) {
        setSkills(response.data.data);
        setTotalPages(response.data.pages || 1);
      } else {
        showToast.error("Failed to load skills");
      }
    } catch (err) {
      showToast.error("Error fetching skills");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      const query = search.toLowerCase();
      const matchesSearch =
        skill.name?.toLowerCase().includes(query) ||
        skill.categoryId?.name?.toLowerCase().includes(query) ||
        skill.createdBy?.name?.toLowerCase().includes(query);
      const matchesFilter =
        filter === "All" || filter === "deleted" || skill.status?.toLowerCase() === filter.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [skills, search, filter]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const response = await Apiservices.updateSkillStatus(id, "approved");
      if (response.data.success) {
        setSkills((prev) => prev.map((s) => (s._id === id ? { ...s, status: "approved" } : s)));
        showToast.success("Skill Approved");
      } else {
        showToast.error(response.data.message || "Failed to approve skill");
      }
    } catch (err) {
      showToast.error("Failed to approve skill");
      console.log(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    const confirmed = await confirmAlert("Reject this skill? This can be changed later.");
    if (!confirmed) return;
    setActionLoading(id);
    try {
      const response = await Apiservices.updateSkillStatus(id, "rejected");
      if (response.data.success) {
        setSkills((prev) => prev.map((s) => (s._id === id ? { ...s, status: "rejected" } : s)));
        showToast.success("Skill Rejected");
      } else {
        showToast.error(response.data.message || "Failed to reject skill");
      }
    } catch (err) {
      showToast.error("Failed to reject skill");
      console.log(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await deleteConfirmAlert("this skill");
    if (!confirmed) return;
    setActionLoading(id);
    try {
      const response = await Apiservices.deleteSkill(id);
      if (response.data.success) {
        setSkills((prev) => prev.filter((s) => s._id !== id));
        showToast.success("Skill Deleted");
      } else {
        showToast.error(response.data.message || "Failed to delete skill");
      }
    } catch (err) {
      showToast.error("Failed to delete skill");
      console.log(err);
    } finally {
      setActionLoading(null);
    }
  };

  const StatCard = ({ label, value, color }) => (
    <div className="col-sm-4 mb-3">
      <div className="admin-card p-4 h-100">
        <p className="text-muted mb-1 small fw-semibold text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.3px" }}>{label}</p>
        <h3 className="fw-bold mb-0" style={{ color }}>{value}</h3>
      </div>
    </div>
  );

  return (
    <div>
      <div className="admin-page-header mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center" style={{ gap: 10 }}>
          <div>
            <h1 className="fw-bold mb-1">Skill Approval</h1>
            <p className="text-muted mb-0">Review, approve or reject user-submitted skills.</p>
          </div>
          <div className="d-flex align-items-center" style={{ gap: 8 }}>
            <button className="btn btn-outline-secondary rounded-pill px-3 fw-semibold" style={{ fontSize: "0.85rem" }}>Export</button>
            <button className="btn btn-outline-primary rounded-pill px-3 fw-semibold" style={{ fontSize: "0.85rem" }} onClick={() => fetchSkills(filter === "deleted")}>
              <i className="fa fa-refresh" /> Refresh
            </button>
          </div>
        </div>
      </div>

      {!loading && filter !== "deleted" && (
        <div className="row g-4 mb-4">
          <StatCard label="Total Skills" value={skills.length} color="#0d6efd" />
          <StatCard label="Pending" value={skills.filter((s) => s.status === "pending").length} color="#d97706" />
          <StatCard label="Rejected" value={skills.filter((s) => s.status === "rejected").length} color="#dc3545" />
        </div>
      )}

      {loading ? (
        <LoadingState />
      ) : (
        <div className="admin-card">
          <div className="p-4">
            <div className="row align-items-center g-3 mb-4">
              <div className="col-md-6">
                <input type="search" className="form-control rounded-pill" placeholder="Search by skill, category or user"
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  style={{ background: "#f8faff", border: "1px solid #eef2f7", padding: "10px 16px" }} />
              </div>
              <div className="col-md-6 text-md-end">
                <div className="d-flex align-items-center justify-content-md-end flex-wrap" style={{ gap: 8 }}>
                  {["All", "approved", "pending", "rejected", "deleted"].map((s) => (
                    <button key={s} className={`btn btn-sm rounded-pill fw-semibold px-3 py-2 ${filter === s ? "btn-primary" : "btn-outline-secondary"}`}
                      style={{ fontSize: "0.8rem" }} onClick={() => setFilter(s)}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th className="fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", letterSpacing: "0.3px", borderBottom: "2px solid #eef2f7" }}>Skill</th>
                    <th className="fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", letterSpacing: "0.3px", borderBottom: "2px solid #eef2f7" }}>Category</th>
                    <th className="fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", letterSpacing: "0.3px", borderBottom: "2px solid #eef2f7" }}>Posted By</th>
                    <th className="fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", letterSpacing: "0.3px", borderBottom: "2px solid #eef2f7" }}>Status</th>
                    <th className="text-end fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", letterSpacing: "0.3px", borderBottom: "2px solid #eef2f7" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSkills.length ? (
                    filteredSkills.map((skill) => (
                      <tr key={skill._id}>
                        <td className="fw-semibold" style={{ color: "#1e293b" }}>{skill.name}</td>
                        <td style={{ color: "#64748b" }}>{skill.categoryId?.name || "-"}</td>
                        <td style={{ color: "#64748b" }}><UserLink user={skill.createdBy} name={skill.createdBy?.name || "Unknown"} /></td>
                        <td>
                          <span style={{ background: skill.isDeleted ? "linear-gradient(135deg, #374151, #1f2937)" : skill.status === "approved" ? "linear-gradient(135deg, #16a34a, #15803d)" : skill.status === "pending" ? "linear-gradient(135deg, #eab308, #ca8a04)" : "linear-gradient(135deg, #dc2626, #b91c1c)", color: skill.status === "pending" ? "#1e293b" : "white", padding: "4px 14px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.3px" }}>
                            {skill.isDeleted ? "Deleted" : skill.status}
                          </span>
                        </td>
                        <td className="text-end">
                          {skill.status === "pending" && (
                            <>
                              <LoadingButton loading={actionLoading === skill._id} className="btn btn-sm btn-success rounded-pill me-2 fw-semibold px-3 py-2"
                                style={{ fontSize: "0.8rem" }} onClick={() => handleApprove(skill._id)}>
                                <i className="fa fa-check me-1" />Approve
                              </LoadingButton>
                              <LoadingButton loading={actionLoading === skill._id} className="btn btn-sm btn-outline-danger rounded-pill me-2 fw-semibold px-3 py-2"
                                style={{ fontSize: "0.8rem" }} onClick={() => handleReject(skill._id)}>
                                <i className="fa fa-times me-1" />Reject
                              </LoadingButton>
                            </>
                          )}
                          {!skill.isDeleted && (
                            <LoadingButton loading={actionLoading === skill._id} className="btn btn-sm btn-outline-dark rounded-pill fw-semibold px-3 py-2"
                              style={{ fontSize: "0.8rem" }} onClick={() => handleDelete(skill._id)}>
                              <i className="fa fa-trash me-1" />Delete
                            </LoadingButton>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">No skills found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default SkillApproval;
