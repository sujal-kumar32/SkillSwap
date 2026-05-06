import React, { useMemo, useState, useEffect } from "react";
import { toast } from "react-toastify";
import Apiservices from "../../../Apiservices";

const badgeClass = (status) => {
  switch (status) {
    case "approved":
      return "badge-success";
    case "rejected":
      return "badge-danger";
    case "pending":
      return "badge-warning";
    case "deleted":
      return "badge-dark";
    default:
      return "badge-secondary";
  }
};

const SkillApproval = () => {
  const [skills, setSkills] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchSkills(filter === "deleted");
  }, [filter]);

  const fetchSkills = async (includeDeleted = false) => {
    try {
      setLoading(true);
      const response = await Apiservices.getSkills(includeDeleted);
      if (response.data.success) {
        setSkills(response.data.data);
      } else {
        toast.error("Failed to load skills");
      }
    } catch (err) {
      toast.error("Error fetching skills");
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
        filter === "All" ||
        filter === "deleted" ||
        skill.status?.toLowerCase() === filter.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [skills, search, filter]);

  // HANDLERS
  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const response = await Apiservices.updateSkillStatus(id, "approved");
      if (response.data.success) {
        setSkills((prev) =>
          prev.map((s) => (s._id === id ? { ...s, status: "approved" } : s)),
        );
        toast.success("Skill Approved");
      } else {
        toast.error(response.data.message || "Failed to approve skill");
      }
    } catch (err) {
      toast.error("Failed to approve skill");
      console.log(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      const response = await Apiservices.updateSkillStatus(id, "rejected");
      if (response.data.success) {
        setSkills((prev) =>
          prev.map((s) => (s._id === id ? { ...s, status: "rejected" } : s)),
        );
        toast.success("Skill Rejected");
      } else {
        toast.error(response.data.message || "Failed to reject skill");
      }
    } catch (err) {
      toast.error("Failed to reject skill");
      console.log(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await Apiservices.deleteSkill(id);
      if (response.data.success) {
        setSkills((prev) => prev.filter((s) => s._id !== id));
        toast.success("Skill Deleted");
      } else {
        toast.error(response.data.message || "Failed to delete skill");
      }
    } catch (err) {
      toast.error("Failed to delete skill");
      console.log(err);
    }
  };

  return (
    <div className="container py-5">
      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-4">
        <div>
          <h1 className="mb-2">Skill Approval</h1>
          <p className="text-muted mb-0">
            Review, approve or reject user-submitted skills.
          </p>
        </div>

        <div className="mt-3 mt-md-0 btn-group">
          <button className="btn btn-outline-primary">Export</button>
          <button
            className="btn btn-outline-secondary"
            onClick={() => fetchSkills(filter === "deleted")}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* STATS */}
      {!loading && filter !== "deleted" && (
        <div className="row mb-4">
          <div className="col-sm-4 mb-3">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h6 className="text-muted">Total Skills</h6>
                <h3>{skills.length}</h3>
              </div>
            </div>
          </div>

          <div className="col-sm-4 mb-3">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h6 className="text-muted">Pending</h6>
                <h3>{skills.filter((s) => s.status === "pending").length}</h3>
              </div>
            </div>
          </div>

          <div className="col-sm-4 mb-3">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h6 className="text-muted">Rejected</h6>
                <h3>{skills.filter((s) => s.status === "rejected").length}</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          {/* SEARCH + FILTER */}
          <div className="row mb-4">
            <div className="col-md-6">
              <input
                type="search"
                className="form-control"
                placeholder="Search by skill, category or user"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-md-6 text-md-end mt-2 mt-md-0">
              {["All", "approved", "pending", "rejected", "deleted"].map(
                (status) => (
                  <button
                    key={status}
                    className={`btn btn-sm mx-1 ${
                      filter === status
                        ? "btn-primary"
                        : "btn-outline-secondary"
                    }`}
                    onClick={() => setFilter(status)}
                  >
                    {status}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* TABLE */}
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Skill</th>
                  <th>Category</th>
                  <th>Posted By</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredSkills.length ? (
                  filteredSkills.map((skill) => (
                    <tr key={skill._id}>
                      <td>{skill.name}</td>
                      <td>{skill.categoryId?.name || "-"}</td>
                      <td>{skill.createdBy?.name || "Unknown"}</td>

                      <td>
                        <span
                          className={`badge ${badgeClass(
                            skill.isDeleted ? "deleted" : skill.status,
                          )}`}
                        >
                          {skill.isDeleted ? "deleted" : skill.status}
                        </span>
                      </td>

                      <td className="text-end">
                        {skill.status === "pending" && (
                          <>
                            <button
                              className="btn btn-success btn-sm me-2"
                              onClick={() => handleApprove(skill._id)}
                              disabled={actionLoading === skill._id}
                            >
                              Approve
                            </button>

                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleReject(skill._id)}
                              disabled={actionLoading === skill._id}
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {!skill.isDeleted && (
                          <button
                            className="btn btn-outline-danger btn-sm ms-2"
                            onClick={() => handleDelete(skill._id)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      No skills found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillApproval;
