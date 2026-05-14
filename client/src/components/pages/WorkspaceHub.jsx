import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import TopBar from "../layout/user/TopBar";
import { showToast } from "../../utils/toastUtils";
import LoadingButton from "../../../src/utils/LoadingButton";
import Apiservices from "../../../Apiservices";

function WorkspaceHub() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "User";

  const [isMentor, setIsMentor] = useState(false);
  const [appStatus, setAppStatus] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [applying, setApplying] = useState(false);

  const [stats, setStats] = useState({
    sessionsJoined: 0,
    skillsLearning: 0,
    mentorSessions: 0,
    totalReviews: 0
  });
  const [profileImage, setProfileImage] = useState("");
  const [loadingStats, setLoadingStats] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [mentorForm, setMentorForm] = useState({ skills: "", experience: "", bio: "", category: "", portfolioLink: "" });

  useEffect(() => {
    const roles = JSON.parse(localStorage.getItem("roles") || "[]");
    const mentorStatus = roles.includes("mentor") || localStorage.getItem("role") === "admin";
    setIsMentor(mentorStatus);

    if (!mentorStatus) {
      Apiservices.getMyApplication().then((r) => {
        if (r.data?.data) setAppStatus(r.data.data.status);
      }).catch(() => {});
    }

    const fetchDashboardData = async () => {
      try {
        setLoadingStats(true);

        const profileRes = await Apiservices.getProfile().catch(() => ({ data: { data: {} } }));
        const userData = profileRes.data.data || {};
        if (userData.profileImage) setProfileImage(userData.profileImage);

        const bookingsRes = await Apiservices.fetchBookings().catch(() => ({ data: { data: [] } }));
        const bookings = bookingsRes.data.data || [];

        const activeBookings = bookings.filter(b => b.requestStatus === "accepted" || b.requestStatus === "completed");

        const uniqueSkills = new Set();
        activeBookings.forEach(b => {
          if (b.sessionId?.title) uniqueSkills.add(b.sessionId.title);
        });

        const reviewsRes = await Apiservices.fetchReviews().catch(() => ({ data: { data: [] } }));
        const reviews = reviewsRes.data.data || [];

        let mentorSessionsCount = 0;
        let mentorSessions = [];
        if (mentorStatus) {
          const sessionsRes = await Apiservices.getMySessions().catch(() => ({ data: { data: [] } }));
          mentorSessionsCount = (sessionsRes.data.data || []).length;
          mentorSessions = (sessionsRes.data.data || []).map((s) => ({
            _id: s._id,
            title: `Your Session: ${s.title}`,
            date: s.date,
            createdAt: s.createdAt,
            isMentor: true,
          }));
        }

        setStats({
          sessionsJoined: activeBookings.length,
          skillsLearning: uniqueSkills.size,
          mentorSessions: mentorSessionsCount,
          totalReviews: reviews.length
        });

        const allItems = [
          ...bookings.map((b) => ({ ...b, _sortDate: b.createdAt || b.date })),
          ...mentorSessions.map((s) => ({ ...s, _sortDate: s.createdAt || s.date, requestStatus: "mentor" })),
        ];

        const activities = allItems
          .sort((a, b) => new Date(b._sortDate) - new Date(a._sortDate))
          .slice(0, 5)
          .map((item, index) => {
            if (item.isMentor) {
              return {
                id: item._id || index,
                title: item.title,
                time: item.date ? new Date(item.date).toLocaleDateString() : "Recently",
                color: "primary",
              };
            }

            const isCompleted = item.requestStatus === "completed";
            const isAccepted = item.requestStatus === "accepted";
            const isPending = item.requestStatus === "pending";

            let color = "primary";
            let title = "Booked Session";

            if (isCompleted) { color = "success"; title = `Completed ${item.sessionId?.title || "Session"}`; }
            else if (isAccepted) { color = "info"; title = `Upcoming: ${item.sessionId?.title || "Session"}`; }
            else if (isPending) { color = "warning"; title = `Requested ${item.sessionId?.title || "Session"}`; }

            return {
              id: item._id || index,
              title,
              time: item.date ? new Date(item.date).toLocaleDateString() + (item.timeSlot ? ` at ${item.timeSlot}` : "") : "Recently",
              color,
            };
          });

        setRecentActivities(activities);

      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleMentorEntry = () => {
    if (isMentor) {
      navigate("/mentor");
      return;
    }
    if (appStatus === "pending") {
      showToast.info("Your application is pending admin approval");
      return;
    }
    if (appStatus === "rejected") {
      showToast.info("Your previous application was rejected. You can apply again.");
    }
    if (appStatus === "blocked") {
      showToast.error("Your mentor access has been blocked by admin");
      return;
    }
    setShowForm(true);
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    if (!mentorForm.skills.trim() || !mentorForm.experience.trim()) {
      showToast.warning("Skills and experience are required");
      return;
    }
    try {
      setApplying(true);
      const res = await Apiservices.applyForMentor(mentorForm);
      if (res.data.success) {
        if (res.data.token) localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", "mentor");
        localStorage.setItem("roles", JSON.stringify(res.data.data?.roles || ["learner", "mentor"]));
        setIsMentor(true);
        setShowForm(false);
        showToast.success("You are now a mentor!");
        navigate("/mentor");
      } else {
        showToast.warning(res.data.message);
      }
    } catch (err) {
      showToast.error(err?.response?.data?.message || "Error submitting application");
    } finally {
      setApplying(false);
    }
  };

  return (
    <>
      <TopBar />
      <div className="workspace-hub-wrapper bg-image">
      <div className="bg-grid"></div>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>
      <div className="orb orb-4"></div>
      <div className="orb orb-5"></div>

      <div className="container py-5 position-relative">
        {/* TOP SECTION */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-5">
          <div className="d-flex align-items-center gap-4">
            <div className="avatar-wrapper">
              <img
                src={profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0d6efd&color=fff&size=100`}
                alt="Profile"
                className="rounded-circle shadow-lg"
                style={{ objectFit: "cover", width: 100, height: 100 }}
              />
              <span className="status-dot"></span>
            </div>
            <div>
              <div className="d-flex align-items-center mb-2" style={{ gap: "24px" }}>
                <h1 className="fw-bold mb-0 greeting-text">{userName}</h1>
                <span className="badge rounded-pill px-3 py-2 badge-learner">Learner</span>
                {isMentor && (
                  <span className="badge rounded-pill px-3 py-2 badge-mentor">Mentor</span>
                )}
              </div>
              <p className="text-muted fs-5 mb-0 subtitle-text">
                Continue learning or start teaching today.
              </p>
            </div>
          </div>
        </div>

        {/* QUICK STATS */}
        <h5 className="fw-bold mb-4 section-title">Quick Stats</h5>
        <div className="row g-4 mb-5">
          <div className="col-md-3">
            <div className="stat-card h-100 p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="stat-label mb-1">Sessions Joined</p>
                  <h3 className="fw-bold mb-0 stat-value">
                    {loadingStats ? <span className="spinner-border spinner-border-sm text-primary"></span> : stats.sessionsJoined}
                  </h3>
                </div>
                <div className="stat-icon stat-icon-primary">
                  <i className="fa fa-video"></i>
                </div>
              </div>
              <div className="stat-progress">
                <div className="stat-progress-bar stat-progress-bar-primary" style={{ width: `${Math.min(stats.sessionsJoined * 10, 100)}%` }}></div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card h-100 p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="stat-label mb-1">Skills Learning</p>
                  <h3 className="fw-bold mb-0 stat-value">
                    {loadingStats ? <span className="spinner-border spinner-border-sm text-success"></span> : stats.skillsLearning}
                  </h3>
                </div>
                <div className="stat-icon stat-icon-success">
                  <i className="fa fa-lightbulb"></i>
                </div>
              </div>
              <div className="stat-progress">
                <div className="stat-progress-bar stat-progress-bar-success" style={{ width: `${Math.min(stats.skillsLearning * 20, 100)}%` }}></div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card h-100 p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="stat-label mb-1">Mentor Sessions</p>
                  <h3 className="fw-bold mb-0 stat-value">
                    {loadingStats ? <span className="spinner-border spinner-border-sm text-warning"></span> : stats.mentorSessions}
                  </h3>
                </div>
                <div className="stat-icon stat-icon-warning">
                  <i className="fa fa-chalkboard-teacher"></i>
                </div>
              </div>
              <div className="stat-progress">
                <div className="stat-progress-bar stat-progress-bar-warning" style={{ width: `${Math.min(stats.mentorSessions * 10, 100)}%` }}></div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card h-100 p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="stat-label mb-1">Total Reviews</p>
                  <h3 className="fw-bold mb-0 stat-value">
                    {loadingStats ? <span className="spinner-border spinner-border-sm text-info"></span> : stats.totalReviews}
                  </h3>
                </div>
                <div className="stat-icon stat-icon-info">
                  <i className="fa fa-star"></i>
                </div>
              </div>
              <div className="stat-progress">
                <div className="stat-progress-bar stat-progress-bar-info" style={{ width: `${Math.min(stats.totalReviews * 20, 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-5">
          {/* MAIN WORKSPACE CARDS */}
          <div className="col-lg-8">
            <h5 className="fw-bold mb-4 section-title">Your Workspaces</h5>
            <div className="row g-4">
              <div className="col-md-6">
                <div className="workspace-card learner-workspace h-100">
                  <div className="workspace-card-bg"></div>
                  <div className="card-body p-5 position-relative z-1">
                    <div className="workspace-icon mb-4">
                      <i className="fa fa-user-graduate fs-3"></i>
                    </div>
                    <h3 className="fw-bold text-white mb-3">Learner Workspace</h3>
                    <ul className="list-unstyled text-white-50 mb-4 workspace-features">
                      <li><i className="fa fa-check-circle me-2"></i>Explore Sessions</li>
                      <li><i className="fa fa-check-circle me-2"></i>Continue Learning</li>
                      <li><i className="fa fa-check-circle me-2"></i>Track Progress</li>
                    </ul>
                    <Link to="/learner" className="btn btn-light rounded-pill px-4 py-2 fw-bold w-100 workspace-btn">
                      Enter Learner Workspace
                    </Link>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="workspace-card mentor-workspace h-100">
                  <div className="workspace-card-bg"></div>
                  <div className="card-body p-5 position-relative z-1">
                    <div className="workspace-icon mb-4">
                      <i className="fa fa-chalkboard-teacher fs-3"></i>
                    </div>
                    <h3 className="fw-bold text-white mb-3">Mentor Workspace</h3>
                    <ul className="list-unstyled text-white-50 mb-4 workspace-features">
                      <li><i className="fa fa-check-circle me-2"></i>Create Sessions</li>
                      <li><i className="fa fa-check-circle me-2"></i>Manage Learners</li>
                      <li><i className="fa fa-check-circle me-2"></i>Track Bookings</li>
                    </ul>
                    <LoadingButton
                      onClick={handleMentorEntry}
                      loading={applying}
                      className="btn btn-light rounded-pill px-4 py-2 fw-bold w-100 workspace-btn"
                    >
                      {isMentor ? "Enter Mentor Workspace" : appStatus === "pending" ? "Application Pending" : appStatus === "blocked" ? "Access Blocked" : appStatus === "rejected" ? "Reapply as Mentor" : "Become a Mentor"}
                    </LoadingButton>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RECENT ACTIVITY */}
          <div className="col-lg-4">
            <h5 className="fw-bold mb-4 section-title">Recent Activity</h5>
            <div className="activity-card h-100 p-4">
              {loadingStats ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status"></div>
                </div>
              ) : recentActivities.length > 0 ? (
                <div className="timeline">
                  {recentActivities.map((activity) => (
                    <div className="timeline-item" key={activity.id}>
                      <div className={`timeline-marker bg-${activity.color}`}></div>
                      <div className="timeline-content">
                        <h6 className="fw-bold mb-1 timeline-title">{activity.title}</h6>
                        <p className="small mb-0 timeline-time">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 no-activity">
                  <div className="no-activity-icon mb-3">
                    <i className="fa fa-history"></i>
                  </div>
                  <p className="mb-0">No recent activity found.</p>
                  <p className="small mt-1">Start learning to see your activity here!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <>
          <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 1040 }} onClick={() => setShowForm(false)} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 1050, width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto" }}>
            <div className="learner-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 className="fw-bold mb-1">Become a Mentor</h5>
                  <small className="text-muted">Submit your application for admin review</small>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowForm(false)} />
              </div>
              <form onSubmit={submitApplication}>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-semibold">Skills / Expertise *</label>
                    <input className="form-control rounded-pill" placeholder="e.g. React, Node.js, Python" value={mentorForm.skills} onChange={(e) => setMentorForm({ ...mentorForm, skills: e.target.value })} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">Experience *</label>
                    <textarea className="form-control rounded-4" rows="3" placeholder="Describe your teaching/professional experience" value={mentorForm.experience} onChange={(e) => setMentorForm({ ...mentorForm, experience: e.target.value })} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">Bio</label>
                    <textarea className="form-control rounded-4" rows="2" placeholder="Short bio about yourself" value={mentorForm.bio} onChange={(e) => setMentorForm({ ...mentorForm, bio: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Category</label>
                    <input className="form-control rounded-pill" placeholder="e.g. Web Development" value={mentorForm.category} onChange={(e) => setMentorForm({ ...mentorForm, category: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Portfolio Link</label>
                    <input className="form-control rounded-pill" placeholder="https://..." value={mentorForm.portfolioLink} onChange={(e) => setMentorForm({ ...mentorForm, portfolioLink: e.target.value })} />
                  </div>
                </div>
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowForm(false)}>Cancel</button>
                  <LoadingButton loading={applying} type="submit" className="btn btn-success rounded-pill px-4 fw-semibold">
                    {applying ? "Submitting..." : "Submit Application"}
                  </LoadingButton>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      <style>{`
        .workspace-hub-wrapper {
          min-height: 100vh;
          background:
            radial-gradient(ellipse at 20% 0%, rgba(13,110,253,0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 100%, rgba(25,135,84,0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(111,66,193,0.03) 0%, transparent 50%),
            linear-gradient(180deg, rgba(248,250,255,0.85) 0%, rgba(240,242,245,0.85) 100%);
          position: relative;
          overflow: hidden;
        }

        /* Grid overlay */
        .bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(13,110,253,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(13,110,253,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          mask-image: radial-gradient(ellipse at 50% 0%, black 30%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse at 50% 0%, black 30%, transparent 70%);
        }

        /* Animated orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.5;
          animation: orbFloat 25s ease-in-out infinite;
          pointer-events: none;
          will-change: transform;
        }

        .orb-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(13,110,253,0.25), transparent 70%);
          top: -150px;
          left: -100px;
          animation-delay: 0s;
          animation-duration: 28s;
        }

        .orb-2 {
          width: 450px;
          height: 450px;
          background: radial-gradient(circle, rgba(25,135,84,0.2), transparent 70%);
          bottom: -100px;
          right: -80px;
          animation-delay: -7s;
          animation-duration: 22s;
        }

        .orb-3 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(111,66,193,0.15), transparent 70%);
          top: 40%;
          left: 60%;
          animation-delay: -14s;
          animation-duration: 30s;
        }

        .orb-4 {
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(255,193,7,0.12), transparent 70%);
          top: 10%;
          right: 10%;
          animation-delay: -5s;
          animation-duration: 18s;
        }

        .orb-5 {
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, rgba(13,202,240,0.12), transparent 70%);
          bottom: 20%;
          left: 5%;
          animation-delay: -10s;
          animation-duration: 35s;
        }

        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          20% { transform: translate(60px, -40px) scale(1.08) rotate(3deg); }
          40% { transform: translate(-30px, 50px) scale(0.92) rotate(-2deg); }
          60% { transform: translate(40px, 20px) scale(1.05) rotate(4deg); }
          80% { transform: translate(-50px, -30px) scale(0.95) rotate(-3deg); }
        }

        /* Avatar */
        .avatar-wrapper {
          position: relative;
          flex-shrink: 0;
        }

        .avatar-wrapper img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border: 3px solid white;
          transition: transform 0.3s ease;
        }

        .avatar-wrapper:hover img {
          transform: scale(1.05);
        }

        .status-dot {
          position: absolute;
          bottom: 5px;
          right: 5px;
          width: 16px;
          height: 16px;
          background: #22c55e;
          border: 3px solid white;
          border-radius: 50%;
        }

        .greeting-text {
          font-size: 1.75rem;
          background: linear-gradient(135deg, #1e293b, #0d6efd);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle-text {
          color: #64748b !important;
          font-weight: 400;
        }

        .badge-learner {
          background: linear-gradient(135deg, #0d6efd, #0a58ca);
          color: white;
          font-weight: 500;
          font-size: 0.8rem;
          box-shadow: 0 2px 8px rgba(13,110,253,0.3);
        }

        .badge-mentor {
          background: linear-gradient(135deg, #198754, #146c43);
          color: white;
          font-weight: 500;
          font-size: 0.8rem;
          box-shadow: 0 2px 8px rgba(25,135,84,0.3);
        }

        .section-title {
          color: #1e293b;
          font-size: 1.1rem;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        /* Stat Cards */
        .stat-card {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.7);
          box-shadow: 0 4px 16px rgba(0,0,0,0.04);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: default;
          position: relative;
          overflow: hidden;
        }

        .stat-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          border-color: transparent;
        }

        .stat-label {
          color: #94a3b8;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }

        .stat-value {
          color: #1e293b;
          font-size: 2rem;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          transition: transform 0.3s ease;
        }

        .stat-card:hover .stat-icon {
          transform: scale(1.1) rotate(-5deg);
        }

        .stat-icon-primary {
          background: linear-gradient(135deg, rgba(13,110,253,0.12), rgba(13,110,253,0.06));
          color: #0d6efd;
        }

        .stat-icon-success {
          background: linear-gradient(135deg, rgba(25,135,84,0.12), rgba(25,135,84,0.06));
          color: #198754;
        }

        .stat-icon-warning {
          background: linear-gradient(135deg, rgba(255,193,7,0.12), rgba(255,193,7,0.06));
          color: #d97706;
        }

        .stat-icon-info {
          background: linear-gradient(135deg, rgba(13,202,240,0.12), rgba(13,202,240,0.06));
          color: #0891b2;
        }

        .stat-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: #f1f5f9;
        }

        .stat-progress-bar {
          height: 100%;
          border-radius: 0 0 0 20px;
          transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stat-progress-bar-primary { background: linear-gradient(90deg, #0d6efd, #60a5fa); }
        .stat-progress-bar-success { background: linear-gradient(90deg, #198754, #4ade80); }
        .stat-progress-bar-warning { background: linear-gradient(90deg, #d97706, #fbbf24); }
        .stat-progress-bar-info { background: linear-gradient(90deg, #0891b2, #67e8f9); }

        /* Workspace Cards */
        .workspace-card {
          border-radius: 24px;
          overflow: hidden;
          position: relative;
          transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: none;
        }

        .workspace-card:hover {
          transform: translateY(-12px) scale(1.01);
          box-shadow: 0 30px 60px rgba(0,0,0,0.15);
        }

        .workspace-card-bg {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.5s ease;
          background: radial-gradient(circle at 30% 50%, rgba(255,255,255,0.15), transparent 60%);
        }

        .workspace-card:hover .workspace-card-bg {
          opacity: 1;
        }

        .learner-workspace {
          background: linear-gradient(145deg, #0d6efd 0%, #0a58ca 50%, #084298 100%);
        }

        .mentor-workspace {
          background: linear-gradient(145deg, #198754 0%, #146c43 50%, #0f5132 100%);
        }

        .workspace-icon {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(10px);
          color: white;
          transition: all 0.3s ease;
        }

        .workspace-card:hover .workspace-icon {
          background: rgba(255,255,255,0.3);
          transform: scale(1.05);
        }

        .workspace-features li {
          margin-bottom: 12px;
          font-size: 0.9rem;
          opacity: 0.85;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .workspace-features li:hover {
          opacity: 1;
          transform: translateX(4px);
        }

        .workspace-btn {
          border: none;
          transition: all 0.3s ease;
          color: #1e293b !important;
          font-size: 0.9rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .workspace-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }

        /* Activity Card */
        .activity-card {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.7);
          box-shadow: 0 4px 16px rgba(0,0,0,0.04);
          transition: box-shadow 0.3s ease;
        }

        .activity-card:hover {
          box-shadow: 0 12px 32px rgba(0,0,0,0.06);
        }

        /* Timeline */
        .timeline {
          position: relative;
          padding-left: 1.5rem;
        }

        .timeline::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0.3rem;
          height: 100%;
          width: 2px;
          background: linear-gradient(to bottom, #e2e8f0, transparent);
        }

        .timeline-item {
          position: relative;
          margin-bottom: 1.5rem;
          animation: slideIn 0.4s ease forwards;
          opacity: 0;
        }

        .timeline-item:nth-child(1) { animation-delay: 0.1s; }
        .timeline-item:nth-child(2) { animation-delay: 0.2s; }
        .timeline-item:nth-child(3) { animation-delay: 0.3s; }
        .timeline-item:nth-child(4) { animation-delay: 0.4s; }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .timeline-item:last-child {
          margin-bottom: 0;
        }

        .timeline-marker {
          position: absolute;
          left: -1.65rem;
          top: 0.3rem;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 0 0 2px #e2e8f0;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .timeline-item:hover .timeline-marker {
          transform: scale(1.3);
          box-shadow: 0 0 0 4px currentColor;
        }

        .timeline-title {
          color: #1e293b;
          font-size: 0.95rem;
        }

        .timeline-time {
          color: #94a3b8;
        }

        .no-activity {
          color: #94a3b8;
        }

        .no-activity-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          font-size: 1.5rem;
          color: #cbd5e1;
          transition: all 0.3s ease;
        }

        .activity-card:hover .no-activity-icon {
          background: #e2e8f0;
          transform: scale(1.05);
        }

        .bg-success { background: #22c55e !important; }
        .bg-primary { background: #3b82f6 !important; }
        .bg-warning { background: #f59e0b !important; }
        .bg-info { background: #06b6d4 !important; }
      `}</style>
    </div>
    </>
  );
}

export default WorkspaceHub;
