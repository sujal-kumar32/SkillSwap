import React, { useState } from "react";
import { showToast } from "../../../../src/utils/toastUtils";
import LoadingButton from "../../../../src/utils/LoadingButton";
import Apiservices from "../../../../Apiservices";
import { PageHeader } from "../../learner/LearnerUI";

const MentorCreateSkill = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [img, setImg] = useState();
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [level, setLevel] = useState("all");
  const [tagsInput, setTagsInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState({ description: false, tags: false });

  React.useEffect(() => {
    Apiservices.getCategories()
      .then((res) => setCategories(res.data.data))
      .catch(() => showToast.error("Failed to load categories"));
  }, []);

  const generateAIDescription = async () => {
    if (!name.trim()) {
      showToast.warning("Enter a skill name first");
      return;
    }
    setAiLoading((prev) => ({ ...prev, description: true }));
    try {
      const res = await Apiservices.generateDescription({
        skill: name,
        sessionType: "online",
      });
      setDescription(res.data.data.description);
      showToast.success("AI description generated");
    } catch (err) {
      showToast.error(err.response?.data?.message || "Failed to generate description");
    } finally {
      setAiLoading((prev) => ({ ...prev, description: false }));
    }
  };

  const generateAITags = async () => {
    if (!name.trim()) {
      showToast.warning("Enter a skill name first");
      return;
    }
    setAiLoading((prev) => ({ ...prev, tags: true }));
    try {
      const res = await Apiservices.generateTags({ skill: name });
      setTagsInput(res.data.data.tags);
      showToast.success("AI tags generated");
    } catch (err) {
      showToast.error(err.response?.data?.message || "Failed to generate tags");
    } finally {
      setAiLoading((prev) => ({ ...prev, tags: false }));
    }
  };

  const handleForm = async (e) => {
    e.preventDefault();
    if (!name || !categoryId) {
      showToast.error("Skill name and category are required");
      return;
    }
    const data = new FormData();
    data.append("name", name);
    data.append("categoryId", categoryId);
    data.append("description", description);
    if (img) data.append("thumbnail", img);
    data.append("level", level);
    if (tagsInput.trim()) data.append("tags", tagsInput);

    setSubmitting(true);
    try {
      const res = await Apiservices.AddSkill(data);
      if (res.data.success) {
        showToast.success("Skill created! Awaiting admin approval.");
        setName("");
        setDescription("");
        setImg(null);
        setCategoryId("");
        setLevel("all");
        setTagsInput("");
      } else {
        showToast.warning(res.data.message || "Failed to create skill");
      }
    } catch (err) {
      showToast.error(err?.response?.data?.message || "Failed to create skill");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        .skill-form-card {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(10px);
          border-radius: 35px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.08);
        }
        .skill-card-header {
          background: linear-gradient(135deg, #0d6efd, #6610f2);
          padding: 35px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .skill-header-icon {
          width: 70px;
          height: 70px;
          border-radius: 20px;
          background: rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }
        .skill-control,
        .skill-select,
        .skill-textarea {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 16px;
          transition: 0.3s;
          font-size: 0.95rem;
        }
        .skill-control:focus,
        .skill-select:focus,
        .skill-textarea:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 4px rgba(13,110,253,0.12);
          outline: none;
        }
        .skill-upload-box {
          border: 2px dashed #cbd5e1;
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          background: #f8fafc;
          cursor: pointer;
          transition: all 0.3s;
        }
        .skill-upload-box:hover {
          border-color: #0d6efd;
          background: rgba(13,110,253,0.04);
        }
        .tip-row {
          display: flex;
          gap: 20px;
          margin-bottom: 28px;
        }
        .tip-row:last-child {
          margin-bottom: 0;
        }
        .tip-icon {
          width: 50px;
          height: 50px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: white;
          font-size: 1.1rem;
        }
        .tips-card {
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(10px);
          border-radius: 30px;
          padding: 35px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.06);
        }
      `}</style>

      <PageHeader title="Create Skill" subtitle="Submit a new skill for admin approval." />

      <div className="row g-5">
        <div className="col-lg-8">
          <div className="skill-form-card">
            <div className="skill-card-header">
              <div>
                <h2 className="fw-bold mb-2">Skill Setup</h2>
                <p className="mb-0 opacity-75">Define a new skill for the marketplace.</p>
              </div>
              <div className="skill-header-icon">
                <i className="fa fa-lightbulb"></i>
              </div>
            </div>

            <div className="p-5">
              <form onSubmit={handleForm} className="row g-4">
                <div className="col-12">
                  <label className="form-label fw-bold">Skill Name</label>
                  <input type="text" className="skill-control" value={name} onChange={(e) => setName(e.target.value)}
                    required placeholder="e.g. React.js" />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Category</label>
                  <select className="skill-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Level</label>
                  <select className="skill-select" value={level} onChange={(e) => setLevel(e.target.value)}>
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div className="col-12">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <label className="form-label fw-bold mb-0">Description</label>
                    <button
                      type="button"
                      className="btn rounded-pill fw-semibold border-0 d-flex align-items-center gap-2"
                      onClick={generateAIDescription}
                      disabled={aiLoading.description}
                      style={{
                        background: "linear-gradient(135deg, #0d6efd, #6610f2)",
                        color: "white",
                        padding: "8px 18px",
                        fontSize: "0.85rem",
                        opacity: aiLoading.description ? 0.7 : 1,
                        transition: "all 0.3s",
                        boxShadow: aiLoading.description ? "none" : "0 4px 14px rgba(102,16,242,0.3)",
                      }}
                    >
                      {aiLoading.description ? (
                        <><span className="spinner-border spinner-border-sm" role="status" /> <span>Generating...</span></>
                      ) : (
                        <><i className="fa fa-wand-magic-sparkles" /> <span>Generate with AI</span></>
                      )}
                    </button>
                  </div>
                  <textarea className="skill-textarea" rows="4" value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what this skill covers..." style={{ resize: "vertical" }} />
                </div>

                <div className="col-12">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <label className="form-label fw-bold mb-0">
                      Tags <small className="text-muted fw-normal">(comma-separated)</small>
                    </label>
                    <button
                      type="button"
                      className="btn rounded-pill fw-semibold border-0 d-flex align-items-center gap-2"
                      onClick={generateAITags}
                      disabled={aiLoading.tags}
                      style={{
                        background: "linear-gradient(135deg, #0d6efd, #6610f2)",
                        color: "white",
                        padding: "8px 18px",
                        fontSize: "0.85rem",
                        opacity: aiLoading.tags ? 0.7 : 1,
                        transition: "all 0.3s",
                        boxShadow: aiLoading.tags ? "none" : "0 4px 14px rgba(102,16,242,0.3)",
                      }}
                    >
                      {aiLoading.tags ? (
                        <><span className="spinner-border spinner-border-sm" role="status" /> <span>Suggesting...</span></>
                      ) : (
                        <><i className="fa fa-wand-magic-sparkles" /> <span>AI Suggest</span></>
                      )}
                    </button>
                  </div>
                  <input type="text" className="skill-control" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="e.g. react, hooks, redux" />
                  {tagsInput.trim() && (
                    <div className="d-flex flex-wrap gap-1 mt-2">
                      {tagsInput.split(",").map((t, i) => t.trim() ? <span key={i} className="badge rounded-pill px-3 py-2"
                        style={{ background: "#eef2ff", color: "#4338ca", border: "1px solid #c7d2fe" }}>{t.trim()}</span> : null)}
                    </div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Thumbnail <small className="text-muted fw-normal">(optional)</small></label>
                  <div className="skill-upload-box" onClick={() => document.getElementById("skillFile")?.click()}>
                    {img ? (
                      <div>
                        <i className="fa fa-check-circle text-success fa-2x mb-2"></i>
                        <p className="mb-0 fw-semibold text-success">{img.name}</p>
                        <small className="text-muted">Click to change</small>
                      </div>
                    ) : (
                      <div>
                        <i className="fa fa-cloud-upload-alt fa-2x text-primary mb-2"></i>
                        <p className="mb-0 fw-semibold">Click to upload</p>
                        <small className="text-muted">PNG, JPG up to 5MB</small>
                      </div>
                    )}
                  </div>
                  <input id="skillFile" type="file" className="d-none" accept="image/*" onChange={(e) => setImg(e.target.files[0])} />
                </div>

                <div className="col-12 pt-2">
                  <LoadingButton loading={submitting} type="submit" className="btn btn-primary rounded-pill px-5 py-3 fw-semibold"
                    style={{ fontSize: "1rem" }}>
                    <i className="fa fa-lightbulb me-2" />Submit Skill
                  </LoadingButton>
                  <small className="text-muted d-block mt-3">Skills require admin approval before appearing publicly.</small>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="tips-card">
            <div className="d-flex align-items-center mb-4" style={{ gap: 30 }}>
              <div className="tip-icon" style={{ background: "linear-gradient(135deg, #0d6efd, #6610f2)" }}>
                <i className="fa fa-lightbulb"></i>
              </div>
              <h5 className="fw-bold mb-0">AI Tips</h5>
            </div>
            <div className="tip-row">
              <div className="tip-icon" style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}>
                <i className="fa fa-check"></i>
              </div>
              <div>
                <p className="fw-bold mb-1">Be Specific</p>
                <small className="text-muted">"React.js" is better than just "Programming"</small>
              </div>
            </div>
            <div className="tip-row">
              <div className="tip-icon" style={{ background: "linear-gradient(135deg, #d97706, #f59e0b)" }}>
                <i className="fa fa-tags"></i>
              </div>
              <div>
                <p className="fw-bold mb-1">Use Tags</p>
                <small className="text-muted">Add relevant tags so learners find your skill easily</small>
              </div>
            </div>
            <div className="tip-row">
              <div className="tip-icon" style={{ background: "linear-gradient(135deg, #dc2626, #ef4444)" }}>
                <i className="fa fa-clock"></i>
              </div>
              <div>
                <p className="fw-bold mb-1">Approval Time</p>
                <small className="text-muted">Skills are reviewed by admins before going live</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MentorCreateSkill;
