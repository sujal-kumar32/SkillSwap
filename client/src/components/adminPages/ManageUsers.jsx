import React, { useState, useEffect, useRef } from "react";
import { confirmAlert, deleteConfirmAlert } from "../../utils/alertUtils";
import { showToast } from "../../utils/toastUtils";
import LoadingButton from "../../utils/LoadingButton";
import Apiservices from "../../../Apiservices";
import { TableSkeleton } from "../learner/LearnerUI";
import Pagination from "../Pagination";
import UserLink from "../shared/UserLink";

const PAGE_SIZE = 10;

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const debounceRef = useRef(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setActiveSearch(search), 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [page, filter, activeSearch]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: PAGE_SIZE };
      if (filter !== "All") params.status = filter.toLowerCase();
      if (activeSearch.trim()) params.search = activeSearch.trim();
      const response = await Apiservices.getUsers({ params });
      if (response.data.success) {
        setUsers(response.data.data);
        setTotalPages(response.data.pages || 1);
        setTotal(response.data.total || 0);
      } else {
        setError("Failed to load users");
        showToast.error("Failed to load users");
      }
    } catch (err) {
      setError(err.message || "Error fetching users");
      showToast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (userId, newStatus) => {
    try {
      setActionLoading(userId);
      const response = await Apiservices.updateUserStatus(userId, newStatus);
      if (response.data.success) {
        setUsers((current) =>
          current.map((user) =>
            user._id === userId ? { ...user, status: newStatus } : user,
          ),
        );
        showToast.success(response.data.message);
      } else {
        showToast.error(response.data.message);
      }
    } catch (err) {
      showToast.error("Failed to update user status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBlock = async (userId) => {
    const confirmed = await confirmAlert("Block this user? They will lose access immediately.");
    if (!confirmed) return;
    updateStatus(userId, "blocked");
  };
  const handleUnblock = async (userId) => {
    const confirmed = await confirmAlert("Unblock this user? They will regain access.");
    if (!confirmed) return;
    updateStatus(userId, "active");
  };

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setActiveSearch(val), 400);
  };

  const StatCard = ({ label, value, icon, color }) => (
    <div className="col-sm-6 mb-3">
      <div className="admin-card p-4 h-100">
        <div className="d-flex align-items-center" style={{ gap: 10 }}>
          <div className="admin-stat-icon" style={{ background: `${color}15`, color }}>
            <i className={`fa ${icon}`} />
          </div>
          <div>
            <p className="text-muted mb-0 small fw-semibold text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.3px" }}>{label}</p>
            <h3 className="fw-bold mb-0">{value}</h3>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="admin-page-header mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center" style={{ gap: 10 }}>
          <div>
            <h1 className="fw-bold mb-1">Manage Users</h1>
            <p className="text-muted mb-0">Review and control user access. Block or unblock users instantly.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show rounded-4" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)} />
        </div>
      )}

      <div className="row g-4 mb-4">
        <StatCard label="All Users" value="-" icon="fa-users" color="#0d6efd" />
      </div>

      <div className="admin-card">
        <div className="p-4">
          <div className="row align-items-center g-3 mb-4">
            <div className="col-md-6">
              <input type="search" className="form-control rounded-pill" placeholder="Search by name, email, or role"
                value={search} onChange={(e) => handleSearch(e.target.value)}
                style={{ background: "#f8faff", border: "1px solid #eef2f7", padding: "10px 16px" }} />
            </div>
            <div className="col-md-6 text-md-end">
              {["All", "active", "blocked", "deleted"].map((s) => (
                <button key={s} className={`btn btn-sm rounded-pill mx-2 fw-semibold px-3 py-2 ${filter === s ? "btn-primary" : "btn-outline-secondary"}`}
                  style={{ fontSize: "0.8rem" }} onClick={() => { setFilter(s); setPage(1); }}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <TableSkeleton rows={5} cols={4} />
          ) : users.length ? (
            <>
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead>
                    <tr>
                      <th className="fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", borderBottom: "2px solid #eef2f7" }}>User</th>
                      <th className="fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", borderBottom: "2px solid #eef2f7" }}>Role</th>
                      <th className="fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", borderBottom: "2px solid #eef2f7" }}>Status</th>
                      <th className="text-end fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", borderBottom: "2px solid #eef2f7" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} style={{ borderBottom: "12px solid #f1f5f9" }}>
                        <td>
                          <div className="d-flex align-items-center" style={{ gap: 14 }}>
                            <img src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0d6efd&color=fff`}
                              alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                            <div className="min-w-0">
                              <div className="fw-semibold text-truncate" style={{ color: "#1e293b" }}><UserLink user={user} /></div>
                              <small style={{ color: "#64748b" }} className="text-truncate d-block">{user.email}</small>
                            </div>
                          </div>
                        </td>
                        <td>{(user.roles || []).join(", ")}</td>
                        <td>
                          <span style={{ background: user.status === "active" ? "linear-gradient(135deg, #16a34a, #15803d)" : user.status === "deleted" ? "linear-gradient(135deg, #374151, #1f2937)" : "linear-gradient(135deg, #dc2626, #b91c1c)", color: "white", padding: "4px 14px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.3px" }}>{user.status}</span>
                        </td>
                        <td className="text-end" style={{ whiteSpace: "nowrap" }}>
                          {user.status === "deleted" ? (
                            <span className="text-muted small fw-semibold">{user.deletedBy === "self" ? "Deleted by user" : user.deletedBy === "admin" ? "Deleted by admin" : "Account deleted"}</span>
                          ) : (
                            <>
                              {user.status === "active" ? (
                                <LoadingButton loading={actionLoading === user._id} className="btn btn-sm btn-outline-danger rounded-pill fw-semibold"
                                  style={{ fontSize: "0.8rem" }} onClick={() => handleBlock(user._id)}>
                                  <i className="fa fa-ban me-1" /> Block
                                </LoadingButton>
                              ) : (
                                <LoadingButton loading={actionLoading === user._id} className="btn btn-sm btn-outline-success rounded-pill fw-semibold"
                                  style={{ fontSize: "0.8rem" }} onClick={() => handleUnblock(user._id)}>
                                  <i className="fa fa-check me-1" /> Unblock
                                </LoadingButton>
                              )}
                              <button className="btn btn-sm btn-outline-dark rounded-pill fw-semibold px-3 py-2"
                                style={{ fontSize: "0.8rem", marginLeft: 6 }}
                                onClick={async () => {
                                  const ok = await deleteConfirmAlert(`user "${user.name}"`);
                                  if (!ok) return;
                                  try {
                                    setActionLoading(user._id);
                                    const res = await Apiservices.updateUserStatus(user._id, "deleted");
                                    setUsers((prev) =>
                                      prev.map((u) =>
                                        u._id === user._id ? { ...u, ...res.data.data } : u,
                                      ),
                                    );
                                    showToast.success("User deleted");
                                  } catch (err) {
                                    showToast.error(err.response?.data?.message || "Failed to delete user");
                                  } finally {
                                    setActionLoading(null);
                                  }
                                }}>
                                <i className="fa fa-trash me-1" /> Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-between align-items-center px-3 py-4 border-top">
                <small className="text-muted">Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} of {total}</small>
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-muted">No users found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
