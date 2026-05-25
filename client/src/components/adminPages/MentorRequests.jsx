import React, { useEffect, useState } from "react";
import Apiservices from "../../../Apiservices";
import { LoadingState } from "../learner/LearnerUI";
import { showToast } from "../../utils/toastUtils";
import { confirmAlert } from "../../utils/alertUtils";

const MentorRequests = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [appDetail, setAppDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    loadMentors();
  }, []);

  const loadMentors = async () => {
    try {
      setError("");
      setLoading(true);
      const res = await Apiservices.getUsers({ params: { role: "mentor" } });
      setMentors(res.data.data || []);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to load mentors");
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (mentor) => {
    setSelectedMentor(mentor);
    setAppDetail(null);
    setDetailLoading(true);
    try {
      const res = await Apiservices.getAllMentorApplications({ params: { userId: mentor._id } });
      const apps = res.data.data || [];
      if (apps.length > 0) setAppDetail(apps[0]);
    } catch (e) {
      console.log(e);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleBlock = async (userId) => {
    const confirmed = await confirmAlert("Block this mentor? They will lose mentor access.");
    if (!confirmed) return;
    setActionLoading(userId);
    try {
      const res = await Apiservices.blockUser(userId);
      if (res.data.success) { showToast.success("Mentor blocked"); loadMentors(); }
      else showToast.warning(res.data.message);
    } catch (err) { showToast.error(err.response?.data?.message || "Failed"); }
    finally { setActionLoading(null); }
  };

  const handleUnblock = async (userId) => {
    const confirmed = await confirmAlert("Unblock this mentor?");
    if (!confirmed) return;
    setActionLoading(userId);
    try {
      const res = await Apiservices.unblockUser(userId);
      if (res.data.success) { showToast.success("Mentor unblocked"); loadMentors(); }
      else showToast.warning(res.data.message);
    } catch (err) { showToast.error(err.response?.data?.message || "Failed"); }
    finally { setActionLoading(null); }
  };

  const activeMentors = mentors.filter((m) => m.status === "active");
  const blockedMentors = mentors.filter((m) => m.status === "blocked");

  return (
    <>
      <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-4">
        <div>
          <span className="text-primary fw-semibold small text-uppercase" style={{ letterSpacing: "0.5px" }}>
            SkillSwap Admin
          </span>
          <h1 className="fw-bold mb-1">Mentors</h1>
          <p className="text-muted mb-0">Manage all mentors on the platform.</p>
        </div>
      </div>

      {error && <div className="alert alert-danger rounded-4">{error}</div>}

      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="learner-card p-4 h-100">
            <h3 className="fw-bold mb-0">{mentors.length}</h3>
            <p className="text-muted mb-0 small">Total Mentors</p>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="learner-card p-4 h-100">
            <h3 className="fw-bold mb-0 text-success">{activeMentors.length}</h3>
            <p className="text-muted mb-0 small">Active</p>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="learner-card p-4 h-100">
            <h3 className="fw-bold mb-0 text-danger">{blockedMentors.length}</h3>
            <p className="text-muted mb-0 small">Blocked</p>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : mentors.length ? (
        <div className="learner-card p-4">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Mentor</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mentors.map((mentor) => (
                  <tr key={mentor._id} style={{ cursor: "pointer" }} onClick={() => viewDetails(mentor)}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={mentor.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=0d6efd&color=fff&size=64`}
                          alt="" className="rounded-circle" width="40" height="40" style={{ objectFit: "cover" }}
                        />
                        <div>
                          <h6 className="fw-bold mb-0">{mentor.name}</h6>
                          {mentor.bio && <small className="text-muted">{mentor.bio.slice(0, 60)}</small>}
                        </div>
                      </div>
                    </td>
                    <td><small>{mentor.email}</small></td>
                    <td><small>{new Date(mentor.createdAt).toLocaleDateString()}</small></td>
                    <td>
                      <span className={`badge rounded-pill ${mentor.status === "active" ? "bg-success" : "bg-danger"}`}>
                        {mentor.status}
                      </span>
                    </td>
                    <td className="text-end" onClick={(e) => e.stopPropagation()}>
                      {actionLoading === mentor._id ? (
                        <span className="spinner-border spinner-border-sm" />
                      ) : mentor.status === "active" ? (
                        <button className="btn btn-outline-danger btn-sm rounded-pill" onClick={() => handleBlock(mentor._id)}>
                          <i className="fa fa-ban me-1" />Block
                        </button>
                      ) : (
                        <button className="btn btn-outline-success btn-sm rounded-pill" onClick={() => handleUnblock(mentor._id)}>
                          <i className="fa fa-unlock me-1" />Unblock
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="learner-card p-5 text-center">
          <h5 className="fw-bold">No mentors found</h5>
          <p className="text-muted mb-0">No mentors have been created yet.</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedMentor && (
        <>
          <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 1040 }} onClick={() => setSelectedMentor(null)} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 1050, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
            <div className="learner-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">{selectedMentor.name}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedMentor(null)} />
              </div>

              {detailLoading ? (
                <div className="text-center py-4"><div className="spinner-border spinner-border-sm text-primary" /></div>
              ) : appDetail ? (
                <div className="row g-3">
                  <div className="col-12">
                    <small className="text-muted d-block fw-semibold">Skills / Expertise</small>
                    <p className="mb-0">{appDetail.skills}</p>
                  </div>
                  <div className="col-12">
                    <small className="text-muted d-block fw-semibold">Experience</small>
                    <p className="mb-0">{appDetail.experience}</p>
                  </div>
                  {appDetail.bio && (
                    <div className="col-12">
                      <small className="text-muted d-block fw-semibold">Bio</small>
                      <p className="mb-0">{appDetail.bio}</p>
                    </div>
                  )}
                  {appDetail.category && (
                    <div className="col-md-6">
                      <small className="text-muted d-block fw-semibold">Category</small>
                      <p className="mb-0">{appDetail.category}</p>
                    </div>
                  )}
                  {appDetail.portfolioLink && (
                    <div className="col-md-6">
                      <small className="text-muted d-block fw-semibold">Portfolio</small>
                      <p className="mb-0"><a href={appDetail.portfolioLink} target="_blank" rel="noopener noreferrer">{appDetail.portfolioLink}</a></p>
                    </div>
                  )}
                  <div className="col-12">
                    <small className="text-muted d-block fw-semibold">Status</small>
                    <span className={`badge rounded-pill ${appDetail.status === "approved" ? "bg-success" : "bg-secondary"}`}>{appDetail.status}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted mb-0">No application details found for this mentor.</p>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MentorRequests;
