import React, { useEffect, useState } from "react";
import Apiservices from "../../../Apiservices";
import { LoadingState } from "../learner/LearnerUI";
import { showToast } from "../../utils/toastUtils";
import { confirmAlert } from "../../utils/alertUtils";
import UserLink from "../shared/UserLink";

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
      const res = await Apiservices.adminBlockUser(userId);
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
      const res = await Apiservices.adminUnblockUser(userId);
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
                      <div className="d-flex align-items-center" style={{ gap: 18 }}>
                        <img
                          src={mentor.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=0d6efd&color=fff&size=64`}
                          alt="" className="rounded-circle" style={{ width: 40, height: 40, objectFit: "cover", flexShrink: 0 }}
                        />
                        <div>
                          <h6 className="fw-bold mb-0"><UserLink user={mentor} /></h6>
                          {mentor.bio && <small className="text-muted">{mentor.bio.slice(0, 60)}</small>}
                        </div>
                      </div>
                    </td>
                    <td><small>{mentor.email}</small></td>
                    <td><small>{new Date(mentor.createdAt).toLocaleDateString()}</small></td>
                    <td>
                      <span style={{ background: mentor.status === "active" ? "linear-gradient(135deg, #16a34a, #15803d)" : "linear-gradient(135deg, #dc2626, #b91c1c)", color: "white", padding: "4px 14px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.3px" }}>
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
            <div className="learner-card" style={{ overflow: "hidden" }}>
              <div style={{ padding: "28px 24px",
                background: "linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)", color: "#fff" }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center" style={{ gap: "10px" }}>
                    <img
                      src={selectedMentor.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedMentor.name)}&background=fff&color=0d6efd&size=64`}
                      alt="" className="rounded-circle" style={{ width: 44, height: 44, objectFit: "cover", flexShrink: 0, border: "2px solid rgba(255,255,255,0.4)" }}
                    />
                    <div>
                      <h5 className="fw-bold mb-0" style={{ color: "#fff" }}>{selectedMentor.name}</h5>
                      <small style={{ opacity: 0.85 }}>{selectedMentor.email}</small>
                    </div>
                  </div>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedMentor(null)} />
                </div>
              </div>
              <div style={{ padding: "24px" }}>
                {detailLoading ? (
                  <div className="text-center py-4"><div className="spinner-border spinner-border-sm text-primary" /></div>
                ) : appDetail ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div>
                      <small className="text-muted d-block fw-semibold small mb-1">Skills / Expertise</small>
                      <div style={{ background: "#f8faff", borderRadius: 12, padding: "12px 16px", border: "1px solid #e2e8f0", fontSize: "0.92rem" }}>{appDetail.skills}</div>
                    </div>
                    <div>
                      <small className="text-muted d-block fw-semibold small mb-1">Experience</small>
                      <div style={{ background: "#f8faff", borderRadius: 12, padding: "12px 16px", border: "1px solid #e2e8f0", fontSize: "0.92rem", whiteSpace: "pre-wrap" }}>{appDetail.experience}</div>
                    </div>
                    {appDetail.bio && (
                      <div>
                        <small className="text-muted d-block fw-semibold small mb-1">Bio</small>
                        <div style={{ background: "#f8faff", borderRadius: 12, padding: "12px 16px", border: "1px solid #e2e8f0", fontSize: "0.92rem" }}>{appDetail.bio}</div>
                      </div>
                    )}
                    <div className="row g-3">
                      {appDetail.category && (
                        <div className="col-md-6">
                          <small className="text-muted d-block fw-semibold small mb-1">Category</small>
                          <div style={{ background: "#f8faff", borderRadius: 12, padding: "10px 14px", border: "1px solid #e2e8f0", fontSize: "0.92rem" }}>{appDetail.category}</div>
                        </div>
                      )}
                      {appDetail.portfolioLink && (
                        <div className="col-md-6">
                          <small className="text-muted d-block fw-semibold small mb-1">Portfolio</small>
                          <div style={{ background: "#f8faff", borderRadius: 12, padding: "10px 14px", border: "1px solid #e2e8f0", fontSize: "0.92rem", overflow: "hidden", textOverflow: "ellipsis" }}>
                            <a href={appDetail.portfolioLink} target="_blank" rel="noopener noreferrer" style={{ color: "#0d6efd", textDecoration: "none" }}>{appDetail.portfolioLink}</a>
                          </div>
                        </div>
                      )}
                      <div className="col-12">
                        <small className="text-muted d-block fw-semibold small mb-1">Status</small>
                        <div>
                          <span style={{ background: appDetail.status === "approved" ? "linear-gradient(135deg, #16a34a, #15803d)" : "linear-gradient(135deg, #64748b, #475569)", color: "white", padding: "4px 14px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.3px" }}>{appDetail.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted mb-0">No application details found for this mentor.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MentorRequests;
