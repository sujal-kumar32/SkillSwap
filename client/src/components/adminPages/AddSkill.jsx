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

    setSubmitting(true);
    try {
      const res = await Apiservices.AddSkill(data);
      if (res.data.success) {
        showToast.success(res.data.message);
        setname("");
        setdescription("");
        setimg(null);
        setcategoryId("");
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
    <div>
      <div className="mb-4">
        <h1 className="fw-bold mb-1" style={{ color: "#1e293b" }}>Add Skill</h1>
        <p className="text-muted mb-0">Add a new skill to the marketplace.</p>
      </div>

      <div className="admin-card" style={{ maxWidth: 640 }}>
        <div className="p-4">
          <form onSubmit={handleForm}>
            <div className="mb-3">
              <label className="form-label fw-semibold mb-1" style={{ color: "#1e293b" }}>Skill Name</label>
              <input type="text" className="form-control" value={name} onChange={(e) => setname(e.target.value)} required placeholder="e.g. React Development"
                style={{ borderRadius: 10, border: "1px solid #e2e8f0", padding: "10px 14px" }} />
            </div>

            <div className="row mb-3">
              <div className="col-md-6 mb-3 mb-md-0">
                <label className="form-label fw-semibold mb-1" style={{ color: "#1e293b" }}>Category</label>
                <select className="form-select" value={categoryId} onChange={(e) => setcategoryId(e.target.value)} required
                  style={{ borderRadius: 10, border: "1px solid #e2e8f0", padding: "10px 14px" }}>
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold mb-1" style={{ color: "#1e293b" }}>Thumbnail</label>
                <input type="file" className="form-control" onChange={(e) => setimg(e.target.files[0])}
                  style={{ borderRadius: 10, border: "1px solid #e2e8f0", padding: "10px 14px" }} />
                {img && <small className="text-muted mt-1 d-block">Selected: {img.name}</small>}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold mb-1" style={{ color: "#1e293b" }}>Description</label>
              <textarea className="form-control" rows="3" value={description} onChange={(e) => setdescription(e.target.value)} placeholder="Describe what this skill covers..."
                style={{ borderRadius: 10, border: "1px solid #e2e8f0", padding: "10px 14px", resize: "vertical" }} />
            </div>

            <LoadingButton loading={submitting} type="submit" className="btn btn-primary rounded-pill px-4 fw-semibold"
              style={{ padding: "10px 28px" }}>
              <i className="fa fa-plus-circle me-2" />Add Skill
            </LoadingButton>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSkill;
