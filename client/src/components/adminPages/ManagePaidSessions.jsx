import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Apiservices from "../../../Apiservices";

const badgeClass = (status) => {
  switch (status) {
    case "active":
      return "badge-success";
    case "completed":
      return "badge-primary";
    case "cancelled":
      return "badge-danger";
    case "blocked":
      return "badge-dark";
    default:
      return "badge-secondary";
  }
};

const ManagePaidSessions = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await Apiservices.getSessions();
      if (response.data.success) {
        setSessions(response.data.data);
      } else {
        setError(response.data.message || "Failed to load sessions");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load sessions");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const q = search.toLowerCase();

      const matchSearch =
        s.title?.toLowerCase().includes(q) ||
        s.mentor?.toLowerCase().includes(q);

      const matchFilter =
        filter === "All" || s.status?.toLowerCase() === filter.toLowerCase();

      return matchSearch && matchFilter;
    });
  }, [sessions, search, filter]);

  return (
    <div className="container py-5">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Manage Paid Sessions</h1>
          <p className="text-muted">
            Monitor, edit and control all paid sessions.
          </p>
        </div>

        <div className="btn-group">
          <button className="btn btn-outline-primary">Export</button>
          <button className="btn btn-outline-secondary" onClick={fetchSessions}>
            Refresh
          </button>
        </div>
      </div>

      {/* STATS */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h6>Total Sessions</h6>
                  <h3>{sessions.length}</h3>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h6>Active</h6>
                  <h3>
                    {sessions.filter((s) => s.status === "active").length}
                  </h3>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h6>Total Revenue</h6>
                  <h3>
                    ₹
                    {sessions.reduce(
                      (acc, s) => acc + (s.price ?? 0) * (s.bookings ?? 0),
                      0,
                    )}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* TABLE CARD */}
      {!loading && (
        <div className="card shadow-sm">
          <div className="card-body">
            {/* SEARCH + FILTER */}
            <div className="row mb-4">
              <div className="col-md-6">
                <input
                  type="search"
                  className="form-control"
                  placeholder="Search by session or mentor"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="col-md-6 text-md-end mt-2 mt-md-0">
                {["All", "active", "completed", "cancelled"].map((s) => (
                  <button
                    key={s}
                    className={`btn btn-sm mx-1 ${
                      filter === s ? "btn-primary" : "btn-outline-secondary"
                    }`}
                    onClick={() => setFilter(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* TABLE */}
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Session</th>
                    <th>Mentor</th>
                    <th>Skill</th>
                    <th>Price</th>
                    <th>Bookings</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSessions.length ? (
                    filteredSessions.map((s) => (
                      <tr key={s._id}>
                        <td>{s.title}</td>
                        <td>{s.mentor || "Unknown"}</td>
                        <td>{s.skillId?.name || s.skill || "-"}</td>
                        <td>₹{s.price ?? 0}</td>
                        <td>{s.bookings ?? 0}</td>

                        <td>
                          <span className={`badge ${badgeClass(s.status)}`}>
                            {s.status}
                          </span>
                        </td>

                        <td className="text-end">
                          <button
                            className="btn btn-info btn-sm me-2"
                            onClick={() => navigate(`/admin/session/${s._id}`)}
                          >
                            View
                          </button>

                          <button
                            className="btn btn-warning btn-sm me-2"
                            onClick={() =>
                              navigate(`/admin/session/${s._id}/edit`)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={async () => {
                              setActionLoading(s._id);
                              try {
                                const response =
                                  await Apiservices.deleteSession(s._id);
                                if (response.data.success) {
                                  setSessions((prev) =>
                                    prev.filter((item) => item._id !== s._id),
                                  );
                                  toast.success("Session deleted");
                                } else {
                                  toast.error(
                                    response.data.message ||
                                      "Failed to delete session",
                                  );
                                }
                              } catch (err) {
                                console.log(err);
                                toast.error("Failed to delete session");
                              } finally {
                                setActionLoading(null);
                              }
                            }}
                            disabled={actionLoading === s._id}
                          >
                            {actionLoading === s._id ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center text-muted py-4">
                        No sessions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePaidSessions;
