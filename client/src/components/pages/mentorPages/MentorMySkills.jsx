import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { showToast } from "../../../../src/utils/toastUtils";
import { deleteConfirmAlert } from "../../../../src/utils/alertUtils";
import LoadingButton from "../../../../src/utils/LoadingButton";
import Apiservices from "../../../../Apiservices";
import { EmptyState, LoadingState, PageHeader } from "../../learner/LearnerUI";
import Pagination from "../../Pagination";
import { useAuth } from "../../../App";

const MentorMySkills = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await Apiservices.getSkills();
        const allSkills = res.data.data || [];
        setSkills(allSkills.filter((s) => s.createdBy?._id === user?.id));
      } catch (err) {
        showToast.error("Failed to load skills");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = await deleteConfirmAlert("this skill");
    if (!confirmed) return;
    setDeletingId(id);
    try {
      await Apiservices.deleteSkill(id);
      setSkills((prev) => prev.filter((s) => s._id !== id));
      showToast.success("Skill deleted");
    } catch (err) {
      showToast.error("Failed to delete skill");
    } finally {
      setDeletingId(null);
    }
  };

  const statusBadge = (status) => {
    const map = { pending: "bg-warning text-dark", approved: "bg-success", rejected: "bg-danger" };
    return <span className={`badge rounded-pill ${map[status] || "bg-secondary"}`}>{status}</span>;
  };

  return (
    <>
      <PageHeader title="My Skills" subtitle="Skills you've created."
        action={<Link to="/mentor/create-skill" className="btn btn-primary rounded-pill px-4"><i className="fa fa-plus" style={{ marginRight: 10 }} />New Skill</Link>} />
      {loading ? <LoadingState /> : skills.length ? (
        <div className="row g-4">
          {skills.map((skill) => (
            <div className="col-md-6" key={skill._id}>
              <div className="learner-card p-4 h-100">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="fw-bold mb-0">{skill.name}</h5>
                  {statusBadge(skill.status)}
                </div>
                <p className="text-muted small mb-2">{skill.categoryId?.name} &middot; {skill.level || "all"}</p>
                {skill.tags?.length > 0 && (
                  <div className="d-flex flex-wrap gap-1 mb-2">
                    {skill.tags.map((t, i) => <span key={i} className="badge bg-light text-dark border rounded-pill px-2">{t}</span>)}
                  </div>
                )}
                <p className="text-muted small mb-3">{skill.description?.slice(0, 120)}</p>
                <div className="d-flex gap-2">
                  <LoadingButton loading={deletingId === skill._id} className="btn btn-outline-danger btn-sm rounded-pill"
                    onClick={() => handleDelete(skill._id)}>
                    <i className="fa fa-trash me-1" />Delete
                  </LoadingButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No skills yet" text="Create your first skill to start offering sessions."
          actionLabel="Create Skill" actionTo="/mentor/create-skill" />
      )}
    </>
  );
};

export default MentorMySkills;
