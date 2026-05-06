import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Apiservices from "../../../Apiservices";

const badgeClass = (status) => {
  switch (status) {
    case "pending":
      return "badge-warning";
    case "accepted":
      return "badge-success";
    case "rejected":
      return "badge-danger";
    default:
      return "badge-secondary";
  }
};

const ViewRequests = () => {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);

        const res = await Apiservices.getRequests();
        setRequests(res.data.data || []);
      } catch (err) {
        console.log(err);
        toast.error("Failed to load requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // FILTER + SEARCH
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const q = search.toLowerCase();

      const matchSearch =
        (r.userId?.name || "").toLowerCase().includes(q) ||
        (r.sessionId?.title || "").toLowerCase().includes(q);

      const matchFilter =
        filter === "All" || r.status?.toLowerCase() === filter.toLowerCase();

      return matchSearch && matchFilter;
    });
  }, [requests, search, filter]);

  // APPROVE / REJECT
  const handleStatus = (id, status) => {
    Apiservices.updateRequest(id, status)
      .then(() => {
        toast.success(`Request ${status}`);
        setRequests((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status } : r)),
        );
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to update request");
      });
  };

  return (
    <div className="container py-5">
      {/* HEADER */}
      <div className="mb-4">
        <h1>View All Requests</h1>
        <p className="text-muted">Manage all session requests from users</p>
      </div>

      {/* SEARCH + FILTER */}
      <div className="row mb-4">
        <div className="col-md-6">
          <input
            type="search"
            className="form-control"
            placeholder="Search by user or session"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="col-md-6 text-md-end mt-2 mt-md-0">
          {["All", "pending", "accepted", "rejected"].map((s) => (
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
      <div className="card shadow-sm">
        <div className="card-body">
          {loading ? (
            <p className="text-center">Loading...</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Session</th>
                    <th>Mentor</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRequests.length ? (
                    filteredRequests.map((r) => (
                      <tr key={r._id}>
                        <td>{r.userId?.name}</td>
                        <td>{r.sessionId?.title}</td>
                        <td>{r.sessionId?.mentorId?.name}</td>
                        <td>{new Date(r.createdAt).toLocaleDateString()}</td>

                        <td>
                          <span className={`badge ${badgeClass(r.status)}`}>
                            {r.status}
                          </span>
                        </td>

                        <td className="text-end">
                          {r.status === "pending" && (
                            <>
                              <button
                                className="btn btn-success btn-sm me-2"
                                onClick={() => handleStatus(r._id, "accepted")}
                              >
                                Approve
                              </button>

                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleStatus(r._id, "rejected")}
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-4">
                        No requests found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewRequests;
