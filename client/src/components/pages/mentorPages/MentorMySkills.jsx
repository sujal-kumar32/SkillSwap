import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { showToast } from "../../../../src/utils/toastUtils";
import { deleteConfirmAlert } from "../../../../src/utils/alertUtils";
import LoadingButton from "../../../../src/utils/LoadingButton";
import Apiservices from "../../../../Apiservices";
import { EmptyState, LoadingState, PageHeader } from "../../learner/LearnerUI";
import { useAuth } from "../../../App";

const MentorMySkills = () => {
  const { user } = useAuth();
  const userId = user?._id;
  const [skills, setSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [tab, setTab] = useState("my");
  const userIdRef = useRef(userId);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const uid = userIdRef.current;
        const [myRes, allRes] = await Promise.all([
          Apiservices.getSkills(false, uid ? { createdBy: uid } : {}),
          Apiservices.getSkills(),
        ]);
        if (!cancelled) {
          setSkills(myRes.data.data || []);
          setAllSkills(allRes.data.data || []);
        }
      } catch {
        if (!cancelled) showToast.error("Failed to load skills");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [userId]);

  const handleDelete = async (id) => {
    const confirmed = await deleteConfirmAlert("this skill");
    if (!confirmed) return;
    setDeletingId(id);
    try {
      await Apiservices.deleteSkill(id);
      setSkills((prev) => prev.filter((s) => s._id !== id));
      showToast.success("Skill deleted");
    } catch {
      showToast.error("Failed to delete skill");
    } finally {
      setDeletingId(null);
    }
  };

  const statusBadge = (status) => {
    const map = {
      pending: { gradient: "linear-gradient(135deg, #eab308, #ca8a04)", color: "#1e293b" },
      approved: { gradient: "linear-gradient(135deg, #16a34a, #15803d)", color: "white" },
      rejected: { gradient: "linear-gradient(135deg, #dc2626, #b91c1c)", color: "white" },
    };
    const { gradient, color } = map[status] || { gradient: "linear-gradient(135deg, #64748b, #475569)", color: "white" };
    return <span style={{ background: gradient, color, padding: "4px 14px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.3px" }}>{status}</span>;
  };

  const skillCard = (skill, showOwner) => (
    <div className="col-md-6" key={skill._id}>
      <div className="learner-card p-4 h-100">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h5 className="fw-bold mb-0">{skill.name}</h5>
          {!showOwner && statusBadge(skill.status)}
        </div>
        <p className="text-muted small mb-2">
          {skill.categoryId?.name} &middot; {skill.level || "all"}
          {showOwner && skill.createdBy?.name && <span> &middot; by {skill.createdBy.name}</span>}
        </p>
        {skill.tags?.length > 0 && (
          <div className="d-flex flex-wrap gap-1 mb-2">
            {skill.tags.map((t, i) => <span key={i} style={{ background: "linear-gradient(135deg, #64748b, #475569)", color: "white", padding: "4px 14px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.3px" }}>{t}</span>)}
          </div>
        )}
        <p className="text-muted small mb-3">{skill.description?.slice(0, 120)}</p>
        {!showOwner ? (
          <div className="d-flex" style={{ gap: "10px" }}>
            <LoadingButton loading={deletingId === skill._id} className="btn btn-outline-danger btn-sm rounded-pill"
              onClick={() => handleDelete(skill._id)}>
              <i className="fa fa-trash me-1" />Delete
            </LoadingButton>
          </div>
        ) : (
          <Link to={`/mentor/create-session?skillId=${skill._id}`}
            className="btn btn-outline-primary btn-sm rounded-pill">
            <i className="fa fa-plus me-1" />Create Session
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      <PageHeader
        title="Skills"
        subtitle={tab === "my" ? "Skills you've created." : "All skills on the platform."}
        action={<Link to="/mentor/create-skill" className="btn btn-primary rounded-pill px-4">
          <i className="fa fa-plus" style={{ marginRight: 10 }} />New Skill</Link>}
      />

      <div className="row g-4 mb-4">
        <div className="col-sm-6">
          <div className="learner-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <p className="text-muted mb-1 small fw-semibold text-uppercase" style={{ letterSpacing: "0.5px" }}>My Skills</p>
                <h2 className="fw-bold mb-0 text-primary">{skills.length}</h2>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center", background: "linear-gradient(135deg, rgba(13,110,253,0.12), rgba(13,110,253,0.05))", color: "#0d6efd" }}>
                <i className="fas fa-user" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6">
          <div className="learner-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <p className="text-muted mb-1 small fw-semibold text-uppercase" style={{ letterSpacing: "0.5px" }}>All Skills</p>
                <h2 className="fw-bold mb-0 text-success">{allSkills.length}</h2>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center", background: "linear-gradient(135deg, rgba(25,135,84,0.12), rgba(25,135,84,0.05))", color: "#198754" }}>
                <i className="fas fa-globe" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex mb-4" style={{ gap: "4px", background: "#f1f5f9", borderRadius: 12, padding: "4px", display: "inline-flex" }}>
        <button onClick={() => setTab("my")}
          style={{
            padding: "8px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.88rem",
            background: tab === "my" ? "#fff" : "transparent",
            color: tab === "my" ? "#0d6efd" : "#64748b",
            boxShadow: tab === "my" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            transition: "all 0.2s",
          }}>
          <i className="fa fa-user me-2" />My Skills
        </button>
        <button onClick={() => setTab("all")}
          style={{
            padding: "8px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.88rem",
            background: tab === "all" ? "#fff" : "transparent",
            color: tab === "all" ? "#0d6efd" : "#64748b",
            boxShadow: tab === "all" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            transition: "all 0.2s",
          }}>
          <i className="fa fa-globe me-2" />All Skills
        </button>
      </div>

      {loading ? <LoadingState /> : (
        tab === "my" ? (
          skills.length ? (
            <div className="row g-4">
              {skills.map((skill) => skillCard(skill, false))}
            </div>
          ) : (
            <EmptyState title="No skills yet" text="Create your first skill to start offering sessions."
              actionLabel="Create Skill" actionTo="/mentor/create-skill" />
          )
        ) : (
          allSkills.length ? (
            <div className="row g-4">
              {allSkills.map((skill) => skillCard(skill, true))}
            </div>
          ) : (
            <EmptyState title="No skills found" text="No skills have been created on the platform yet." />
          )
        )
      )}
    </>
  );
};

export default MentorMySkills;
