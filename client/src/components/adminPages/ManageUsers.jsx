import React, { useMemo, useState, useEffect } from "react";
import { toast } from "react-toastify";
import Apiservices from "../../../Apiservices";

const badgeClass = (status) => {
  switch (status) {
    case "active":
      return "badge-success";
    case "blocked":
      return "badge-danger";
    case "pending":
      return "badge-warning";
    default:
      return "badge-secondary";
  }
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Fetch users on mount
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
        toast.error("Failed to load users");
      }
    } catch (err) {
      setError(err.message || "Error fetching users");
      toast.error("Error fetching users");
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
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      toast.error("Failed to update user status");
      console.log(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = (userId) => updateStatus(userId, "active");
  const handleBlock = (userId) => updateStatus(userId, "blocked");
  const handleUnblock = (userId) => updateStatus(userId, "active");

  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-4">
        <div>
          <h1 className="mb-2">Manage Users</h1>
          <p className="text-muted mb-0">
            Review and control user access. Approve new signups and block users
            instantly.
          </p>
        </div>
        <div className="mt-3 mt-md-0 btn-group" role="group">
          <button type="button" className="btn btn-outline-primary">
            Export
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={fetchUsers}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="row mb-4">
            <div className="col-sm-4 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="text-uppercase text-muted mb-3">
                    Total Users
                  </h6>
                  <h3 className="mb-0">{users.length}</h3>
                </div>
              </div>
            </div>
            <div className="col-sm-4 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="text-uppercase text-muted mb-3">
                    Pending Approval
                  </h6>
                  <h3 className="mb-0">
                    {users.filter((user) => user.status === "pending").length}
                  </h3>
                </div>
              </div>
            </div>
            <div className="col-sm-4 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="text-uppercase text-muted mb-3">Blocked</h6>
                  <h3 className="mb-0">
                    {users.filter((user) => user.status === "blocked").length}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="row align-items-center mb-4">
                <div className="col-md-6 mb-3 mb-md-0">
                  <div className="input-group">
                    <input
                      type="search"
                      className="form-control"
                      placeholder="Search by name, email or role"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                    <div className="input-group-append">
                      <span className="input-group-text bg-white border-left-0">
                        <i className="fa fa-search" />
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 text-md-right">
                  {["All", "active", "pending", "blocked"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={`btn btn-sm ${filter === status ? "btn-primary" : "btn-outline-secondary"} mx-1 mb-2`}
                      onClick={() => setFilter(status)}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="thead-light">
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length ? (
                      filteredUsers.map((user) => (
                        <tr key={user._id}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>
                            {user.roles &&
                              user.roles[0].charAt(0).toUpperCase() +
                                user.roles[0].slice(1)}
                          </td>
                          <td>
                            <span
                              className={`badge ${badgeClass(user.status)}`}
                            >
                              {user.status.charAt(0).toUpperCase() +
                                user.status.slice(1)}
                            </span>
                          </td>
                          <td className="text-end">
                            {user.status === "pending" && (
                              <button
                                type="button"
                                className="btn btn-sm btn-success me-2"
                                onClick={() => handleApprove(user._id)}
                                disabled={actionLoading === user._id}
                              >
                                {actionLoading === user._id
                                  ? "Loading..."
                                  : "Approve"}
                              </button>
                            )}
                            {user.status !== "blocked" ? (
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() => handleBlock(user._id)}
                                disabled={actionLoading === user._id}
                              >
                                {actionLoading === user._id
                                  ? "Loading..."
                                  : "Block"}
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-success"
                                onClick={() => handleUnblock(user._id)}
                                disabled={actionLoading === user._id}
                              >
                                {actionLoading === user._id
                                  ? "Loading..."
                                  : "Unblock"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">
                          No users match the current search or filter.
                        </td>
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
