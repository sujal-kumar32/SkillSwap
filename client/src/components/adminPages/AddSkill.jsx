import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Apiservices from "../../../Apiservices";

const AddSkill = () => {
  const [name, setname] = useState("");
  const [description, setdescription] = useState("");
  const [img, setimg] = useState();
  const [categoryId, setcategoryId] = useState("");
  const [categories, setcategories] = useState([]);

  useEffect(() => {
    Apiservices.getCategories()
      .then((res) => {
        setcategories(res.data.data);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to load categories");
      });
  }, []);

  const handleForm = (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", name);
    data.append("description", description);
    data.append("thumbnail", img);
    data.append("categoryId", categoryId);

    Apiservices.AddSkill(data)
      .then((res) => {
        console.log(res.data);
        if (res.data.success) {
          toast.success(res.data.message);
          setname("");
          setdescription("");
          setimg(null);
          setcategoryId("");
        } else {
          toast.warning(res.data.message || "Skill already exists");
        }
      })
      .catch((err) => {
        console.log(err);
        const message = err?.response?.data?.message;
        toast.error(message || "Failed to add skill");
      });
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-xl-10">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom-0 px-4 py-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                <div>
                  <h2 className="mb-1">Add Skill</h2>
                  <p className="text-muted mb-0">
                    Add a new skill listing to your marketplace with a category,
                    description, and thumbnail.
                  </p>
                </div>
              </div>
            </div>
            <div className="card-body px-4 pb-4">
              <form onSubmit={handleForm} className="row gx-4 gy-4">
                <div className="col-12">
                  <label htmlFor="name" className="form-label fw-semibold">
                    Skill Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-control shadow-sm"
                    value={name}
                    onChange={(e) => setname(e.target.value)}
                    required
                    placeholder="Enter skill title"
                  />
                </div>

                <div className="col-md-6">
                  <label
                    htmlFor="categoryId"
                    className="form-label fw-semibold"
                  >
                    Category
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    className="form-control shadow-sm"
                    value={categoryId}
                    onChange={(e) => setcategoryId(e.target.value)}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label htmlFor="thumbnail" className="form-label fw-semibold">
                    Thumbnail
                  </label>
                  <div className="input-group shadow-sm">
                    <input
                      type="file"
                      id="thumbnail"
                      name="thumbnail"
                      className="form-control"
                      onChange={(e) => setimg(e.target.files[0])}
                    />
                  </div>
                  {img && (
                    <small className="text-muted d-block mt-2">
                      Selected file: {img.name}
                    </small>
                  )}
                </div>

                <div className="col-12">
                  <label
                    htmlFor="description"
                    className="form-label fw-semibold"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="form-control shadow-sm"
                    rows="5"
                    value={description}
                    onChange={(e) => setdescription(e.target.value)}
                    placeholder="Add a short description for the skill"
                  />
                </div>

                <div className="col-12 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
                  <button type="submit" className="btn btn-primary px-4">
                    Add Skill
                  </button>
                  <small className="text-muted mb-0">
                    Make sure all fields are complete before submitting.
                  </small>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSkill;
