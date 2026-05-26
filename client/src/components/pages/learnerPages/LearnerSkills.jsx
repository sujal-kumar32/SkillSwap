import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Apiservices from "../../../../Apiservices";
import { showToast } from "../../../utils/toastUtils";
import { EmptyState, LoadingState, PageHeader } from "../../learner/LearnerUI";

const LearnerSkills = () => {
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await Apiservices.getSkills();
        if (!cancelled) setSkills(res.data.data || []);
      } catch {
        if (!cancelled) showToast.error("Failed to load skills");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const categories = useMemo(() => {
    const map = {};
    skills.forEach((s) => {
      const cat = s.categoryId;
      if (cat && cat._id) map[cat._id] = cat.name || "Uncategorized";
    });
    return Object.entries(map).map(([id, name]) => ({ id, name }));
  }, [skills]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return skills.filter((skill) => {
      const matchCat = selectedCategory === "all" || skill.categoryId?._id === selectedCategory;
      const matchSearch = !q
        || skill.name.toLowerCase().includes(q)
        || (skill.description || "").toLowerCase().includes(q)
        || (skill.tags || []).some((t) => t.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [skills, query, selectedCategory]);

  return (
    <>
      <PageHeader title="Browse Skills" subtitle="Explore all skills and find sessions that match your interests." />

      <div className="learner-card p-4 mb-4">
        <div className="row g-3">
          <div className="col-md-6">
            <input
              className="form-control rounded-pill"
              placeholder="Search skills by name, description, or tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <select
              className="form-select rounded-pill"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3 d-flex align-items-center">
            <span className="text-muted small fw-semibold">
              Showing {filtered.length} skill{filtered.length !== 1 ? "s" : ""}
              {selectedCategory !== "all" && ` in selected category`}
            </span>
          </div>
        </div>
      </div>

      {loading ? <LoadingState /> : filtered.length ? (
        <div className="row g-4">
          {filtered.map((skill) => (
            <div className="col-md-6 col-xl-4 d-flex" key={skill._id}>
              <div
                className="learner-card p-4 w-100 d-flex flex-column"
                style={{ cursor: "pointer", transition: "all 0.25s ease" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 32px rgba(15,23,42,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "";
                }}
                onClick={() => navigate(`/learner/explore?skillId=${skill._id}`)}
              >
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="fw-bold mb-0">{skill.name}</h5>
                  {skill.level && (
                    <span className="badge rounded-pill ms-2" style={{
                      background: skill.level === "beginner" ? "rgba(25,135,84,0.12)" : skill.level === "intermediate" ? "rgba(255,193,7,0.15)" : "rgba(220,53,69,0.12)",
                      color: skill.level === "beginner" ? "#198754" : skill.level === "intermediate" ? "#cc9a06" : "#dc3545",
                      fontWeight: 500, fontSize: "0.7rem", flexShrink: 0
                    }}>
                      {skill.level}
                    </span>
                  )}
                </div>

                <p className="text-muted small mb-2">
                  <i className="fa fa-folder text-primary me-1" />
                  {skill.categoryId?.name || "Uncategorized"}
                  {skill.createdBy?.name && (
                    <span> &middot; <i className="fa fa-user text-secondary me-1" />{skill.createdBy.name}</span>
                  )}
                </p>

                {skill.tags?.length > 0 && (
                  <div className="d-flex flex-wrap gap-1 mb-2">
                    {skill.tags.slice(0, 4).map((t, i) => (
                      <span key={i} className="badge rounded-pill px-2" style={{ background: "#f1f5f9", color: "#475569", fontWeight: 500, fontSize: "0.7rem" }}>
                        {t}
                      </span>
                    ))}
                    {skill.tags.length > 4 && (
                      <span className="badge rounded-pill px-2" style={{ background: "#eef2f7", color: "#94a3b8", fontWeight: 500, fontSize: "0.7rem" }}>
                        +{skill.tags.length - 4}
                      </span>
                    )}
                  </div>
                )}

                <p className="text-muted small mb-3 flex-grow-1" style={{ lineHeight: 1.5 }}>
                  {skill.description?.slice(0, 120) || "No description available."}
                  {(skill.description || "").length > 120 ? "..." : ""}
                </p>

                <button
                  className="btn btn-primary rounded-pill px-4 fw-semibold w-100 mt-auto"
                  onClick={(e) => { e.stopPropagation(); navigate(`/learner/explore?skillId=${skill._id}`); }}
                >
                  <i className="fa fa-compass me-2" />Browse Sessions
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No skills match your search"
          text="Try a different search term or clear the filters."
        />
      )}
    </>
  );
};

export default LearnerSkills;
