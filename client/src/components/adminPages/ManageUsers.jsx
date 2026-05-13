import React, { useMemo, useState, useEffect } from "react";
import { confirmAlert } from "../../utils/alertUtils";
import { showToast } from "../../utils/toastUtils";
import LoadingButton from "../../utils/LoadingButton";
import Apiservices from "../../../Apiservices";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await Apiservices.getUsers();
      if (response.data.success) {
        setUsers(response.data.data);
      } else {
        setError("Failed to load users");
        showToast.error("Failed to load users");
      }
    } catch (err) {
      setError(err.message || "Error fetching users");
      showToast.error("Error fetching users");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const query = search.trim().toLowerCase();
      const matchesSearch =
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.roles && user.roles[0]?.toLowerCase().includes(query));
      const matchesFilter =
        filter === "All" || user.status?.toLowerCase() === filter.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [filter, search, users]);

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
      console.log(err);
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

  const StatCard = ({ label, value, icon, color }) => (
    <div className="col-sm-6 mb-3">
      <div className="admin-card p-4 h-100">
        <div className="d-flex align-items-center gap-3">
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
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h1 className="fw-bold mb-1">Manage Users</h1>
            <p className="text-muted mb-0">Review and control user access. Block or unblock users instantly.</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary rounded-pill px-3 fw-semibold" style={{ fontSize: "0.85rem" }}>Export</button>
            <button className="btn btn-outline-primary rounded-pill px-3 fw-semibold" style={{ fontSize: "0.85rem" }} onClick={fetchUsers} disabled={loading}>
              <i className="fa fa-refresh me-1" /> Refresh
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show rounded-4" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)} />
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            <StatCard label="Total Users" value={users.length} icon="fa-users" color="#0d6efd" />
            <StatCard label="Blocked" value={users.filter((u) => u.status === "blocked").length} icon="fa-ban" color="#dc3545" />
          </div>

          <div className="admin-card">
            <div className="p-4">
              <div className="row align-items-center g-3 mb-4">
                <div className="col-md-6">
                  <div className="input-group">
                    <input type="search" className="form-control rounded-start-pill" placeholder="Search by name, email or role" value={search} onChange={(e) => setSearch(e.target.value)}
                      style={{ background: "#f8faff", border: "1px solid #eef2f7", padding: "10px 16px" }} />
                    <span className="input-group-text bg-white rounded-end-pill" style={{ border: "1px solid #eef2f7" }}>
                      <i className="fa fa-search text-muted" />
                    </span>
                  </div>
                </div>
                <div className="col-md-6 text-md-end">
                  {["All", "active", "blocked"].map((s) => (
                    <button key={s} className={`btn btn-sm rounded-pill mx-1 fw-semibold ${filter === s ? "btn-primary" : "btn-outline-secondary"}`}
                      style={{ fontSize: "0.8rem" }} onClick={() => setFilter(s)}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead>
                    <tr>
                      <th className="fw-semibold" style={{ color: "#64748b", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.3px", borderBottom: "2px solid #eef2f7" }}>Name</th>
                      <th className="fw-semibold" style={{ color: "#64748b", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.3px", borderBottom: "2px solid #eef2f7" }}>Email</th>
                      <th className="fw-semibold" style={{ color: "#64748b", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.3px", borderBottom: "2px solid #eef2f7" }}>Role</th>
                      <th className="fw-semibold" style={{ color: "#64748b", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.3px", borderBottom: "2px solid #eef2f7" }}>Status</th>
                      <th className="text-end fw-semibold" style={{ color: "#64748b", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.3px", borderBottom: "2px solid #eef2f7" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length ? (
                      filteredUsers.map((user) => (
                        <tr key={user._id}>
                          <td className="fw-semibold" style={{ color: "#1e293b" }}>{user.name}</td>
                          <td style={{ color: "#64748b" }}>{user.email}</td>
                          <td><span className="badge rounded-pill" style={{ background: "#f1f5f9", color: "#475569", fontWeight: 500 }}>{user.roles?.[0]?.charAt(0).toUpperCase() + user.roles?.[0]?.slice(1) || "User"}</span></td>
                          <td><span className={`badge rounded-pill fw-medium ${user.status === "active" ? "bg-success" : "bg-danger"}`} style={{ fontSize: "0.75rem" }}>{user.status.charAt(0).toUpperCase() + user.status.slice(1)}</span></td>
                          <td className="text-end">
                            {user.status !== "blocked" ? (
                              <LoadingButton loading={actionLoading === user._id} className="btn btn-sm rounded-pill fw-semibold"
                                style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fee2e2", fontSize: "0.8rem" }}
                                onClick={() => handleBlock(user._id)} disabled={actionLoading === user._id}
                                onMouseEnter={(e) => { e.target.style.background = "#fee2e2"; }} onMouseLeave={(e) => { e.target.style.background = "#fef2f2"; }}>
                                Block
                              </LoadingButton>
                            ) : (
                              <LoadingButton loading={actionLoading === user._id} className="btn btn-sm rounded-pill fw-semibold"
                                style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #dcfce7", fontSize: "0.8rem" }}
                                onClick={() => handleUnblock(user._id)} disabled={actionLoading === user._id}
                                onMouseEnter={(e) => { e.target.style.background = "#dcfce7"; }} onMouseLeave={(e) => { e.target.style.background = "#f0fdf4"; }}>
                                Unblock
                              </LoadingButton>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">No users match the current search or filter.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageUsers;
