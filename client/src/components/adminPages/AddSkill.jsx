import React, { useState } from "react";
import { showToast } from "../../utils/toastUtils";
import LoadingButton from "../../utils/LoadingButton";
import Apiservices from "../../../Apiservices";

const AddSkill = () => {
  const [name, setname] = useState("");
  const [description, setdescription] = useState("");
  const [img, setimg] = useState();
  const [categoryId, setcategoryId] = useState("");
  const [categories, setcategories] = useState([]);
  const [level, setLevel] = useState("all");
  const [tagsInput, setTagsInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    Apiservices.getCategories()
      .then((res) => setcategories(res.data.data))
      .catch((err) => {
        console.log(err);
        showToast.error("Failed to load categories");
      });
  }, []);

  const handleForm = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", name);
    data.append("description", description);
    if (img) data.append("thumbnail", img);
    data.append("categoryId", categoryId);
    data.append("level", level);
    if (tagsInput.trim()) data.append("tags", tagsInput);

    setSubmitting(true);
    try {
      const res = await Apiservices.AddSkill(data);
      if (res.data.success) {
        showToast.success(res.data.message);
        setname("");
        setdescription("");
        setimg(null);
        setcategoryId("");
        setLevel("all");
        setTagsInput("");
      } else {
        showToast.warning(res.data.message || "Skill already exists");
      }
    } catch (err) {
      console.log(err);
      const message = err?.response?.data?.message;
      showToast.error(message || "Failed to add skill");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-skill-page">
      <style>{`
        .add-skill-card {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(10px);
          border-radius: 35px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.08);
          max-width: 720px;
        }
        .add-skill-header {
          background: linear-gradient(135deg, #0d6efd, #6610f2);
          padding: 35px;
          color: white;
        }
        .add-skill-header-icon {
          width: 70px;
          height: 70px;
          border-radius: 20px;
          background: rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }
        .modern-control,
        .modern-select,
        .modern-textarea {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 16px;
          transition: 0.3s;
          font-size: 0.95rem;
        }
        .modern-control:focus,
        .modern-select:focus,
        .modern-textarea:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 4px rgba(13,110,253,0.12);
          outline: none;
        }
        .file-upload-box {
          border: 2px dashed #cbd5e1;
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          background: #f8fafc;
          cursor: pointer;
          transition: all 0.3s;
        }
        .file-upload-box:hover {
          border-color: #0d6efd;
          background: rgba(13,110,253,0.04);
        }
      `}</style>

      <div className="add-skill-card">
        <div className="add-skill-header">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-2 text-white">Add New Skill</h2>
              <p className="mb-0 text-white opacity-75">Add a new skill to the marketplace.</p>
            </div>
            <div className="add-skill-header-icon">
              <i className="fa fa-plus-circle"></i>
            </div>
          </div>
        </div>

        <div className="p-5">
          <form onSubmit={handleForm} className="row g-4">
            <div className="col-12">
              <label className="form-label fw-bold">Skill Name</label>
              <input type="text" className="modern-control" value={name} onChange={(e) => setname(e.target.value)}
                required placeholder="e.g. React Development" />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-bold">Category</label>
              <select className="modern-select" value={categoryId} onChange={(e) => setcategoryId(e.target.value)} required>
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label fw-bold">Level</label>
              <select className="modern-select" value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label fw-bold">Thumbnail <small className="text-muted fw-normal">(optional)</small></label>
              <div className="file-upload-box" onClick={() => document.getElementById("skillFileInput")?.click()}>
                {img ? (
                  <div>
                    <i className="fa fa-check-circle text-success fa-2x mb-2"></i>
                    <p className="mb-0 fw-semibold text-success">{img.name}</p>
                    <small className="text-muted">Click to change</small>
                  </div>
                ) : (
                  <div>
                    <i className="fa fa-cloud-upload-alt fa-2x text-primary mb-2"></i>
                    <p className="mb-0 fw-semibold">Click to upload thumbnail</p>
                    <small className="text-muted">PNG, JPG up to 5MB</small>
                  </div>
                )}
              </div>
              <input id="skillFileInput" type="file" className="d-none" accept="image/*" onChange={(e) => setimg(e.target.files[0])} />
            </div>

            <div className="col-12">
              <label className="form-label fw-bold">Description</label>
              <textarea className="modern-textarea" rows="4" value={description} onChange={(e) => setdescription(e.target.value)}
                placeholder="Describe what this skill covers..." style={{ resize: "vertical" }} />
            </div>

            <div className="col-12">
              <label className="form-label fw-bold">Tags <small className="text-muted fw-normal">(comma-separated)</small></label>
              <input type="text" className="modern-control" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. react, frontend, hooks, redux" />
              {tagsInput.trim() && (
                <div className="d-flex flex-wrap gap-1 mt-2">
                  {tagsInput.split(",").map((t, i) => t.trim() ? <span key={i} className="badge bg-light text-dark border rounded-pill px-3 py-2">{t.trim()}</span> : null)}
                </div>
              )}
            </div>

            <div className="col-12 pt-2">
              <LoadingButton loading={submitting} type="submit" className="btn btn-primary rounded-pill px-5 py-3 fw-semibold"
                style={{ fontSize: "1rem" }}>
                <i className="fa fa-plus-circle me-2" />Add Skill
              </LoadingButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSkill;
