import React, { useEffect, useState } from "react";
import { showToast } from "../../utils/toastUtils";
import { confirmAlert, deleteConfirmAlert } from "../../utils/alertUtils";
import LoadingButton from "../../utils/LoadingButton";
import Apiservices from "../../../Apiservices";
import { LoadingState } from "../learner/LearnerUI";
import Pagination from "../Pagination";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await Apiservices.getCategories({ page, limit: 15 });
      setCategories(res.data.data || []);
      setTotalPages(res.data.pages || 1);
    } catch {
      showToast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [page]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await Apiservices.updateCategory(editingId, { name: name.trim(), description });
        showToast.success("Category updated");
      } else {
        await Apiservices.addCategory({ name: name.trim(), description });
        showToast.success("Category created");
      }
      setName("");
      setDescription("");
      setEditingId(null);
      fetch();
    } catch (err) {
      showToast.error(err?.response?.data?.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id, current) => {
    const action = current === "active" ? "deactivate" : "activate";
    const ok = await confirmAlert(`Are you sure you want to ${action} this category?`);
    if (!ok) return;
    try {
      await Apiservices.toggleCategory(id);
      showToast.success(`Category ${action}d`);
      fetch();
    } catch {
      showToast.error("Failed to toggle status");
    }
  };

  const handleDelete = async (id) => {
    const ok = await deleteConfirmAlert("this category");
    if (!ok) return;
    try {
      await Apiservices.deleteCategory(id);
      showToast.success("Category deleted");
      fetch();
    } catch {
      showToast.error("Failed to delete category");
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat._id);
    setName(cat.name);
    setDescription(cat.description || "");
  };

  return (
    <div>
      <style>{`
        .cat-form-card {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(10px);
          border-radius: 35px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.08);
        }
        .cat-form-header {
          background: linear-gradient(135deg, #0d6efd, #6610f2);
          padding: 25px 30px;
          color: white;
        }
        .cat-control, .cat-textarea {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 14px 16px;
          transition: 0.3s;
          font-size: 0.95rem;
        }
        .cat-control:focus, .cat-textarea:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 4px rgba(13,110,253,0.12);
          outline: none;
        }
      `}</style>

      <div className="admin-page-header mb-4">
        <h1 className="fw-bold mb-1">Categories</h1>
        <p className="text-muted mb-0">Manage platform categories. Categories organize skills and sessions.</p>
      </div>

      <div className="row g-5">
        <div className="col-lg-5">
          <div className="cat-form-card">
            <div className="cat-form-header">
              <h5 className="fw-bold mb-0 text-white">{editingId ? "Edit Category" : "Add Category"}</h5>
            </div>
            <div className="p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Name</label>
                  <input type="text" className="cat-control" value={name} onChange={(e) => setName(e.target.value)}
                    required placeholder="e.g. Programming" />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea className="cat-textarea" rows="3" value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of this category" />
                </div>
                <div className="d-flex gap-3 pt-2">
                  <LoadingButton loading={saving} type="submit" className="btn btn-primary rounded-pill px-4 fw-semibold" style={{ padding: "10px 24px" }}>
                    <i className={`fa ${editingId ? "fa-pen" : "fa-plus"}`} style={{ marginRight: 10 }} />{editingId ? "Update" : "Create"}
                  </LoadingButton>
                  {editingId && (
                    <button type="button" className="btn btn-outline-secondary rounded-pill px-4 fw-semibold" style={{ padding: "10px 24px" }}
                      onClick={() => { setEditingId(null); setName(""); setDescription(""); }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="admin-card">
            <div className="p-4">
              {loading ? (
                <LoadingState />
              ) : categories.length ? (
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr>
                        <th className="fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", borderBottom: "2px solid #eef2f7", paddingBottom: 12 }}>Name</th>
                        <th className="fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", borderBottom: "2px solid #eef2f7", paddingBottom: 12 }}>Slug</th>
                        <th className="fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", borderBottom: "2px solid #eef2f7", paddingBottom: 12 }}>Status</th>
                        <th className="text-end fw-semibold text-uppercase" style={{ color: "#64748b", fontSize: "0.8rem", borderBottom: "2px solid #eef2f7", paddingBottom: 12 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((cat) => (
                        <tr key={cat._id}>
                          <td className="fw-semibold py-3">{cat.name}</td>
                          <td style={{ color: "#64748b" }} className="py-3">{cat.slug}</td>
                          <td className="py-3">
                            <span style={{ background: cat.status === "active" ? "linear-gradient(135deg, #16a34a, #15803d)" : "linear-gradient(135deg, #dc2626, #b91c1c)", color: "white", padding: "4px 14px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.3px" }}>{cat.status}</span>
                          </td>
                          <td className="text-end py-3">
                            <div className="d-flex gap-3 justify-content-end">
                              <button className="btn btn-sm btn-outline-primary rounded-pill fw-semibold px-3 py-2" onClick={() => startEdit(cat)}>
                                <i className="fa fa-pen me-1" />Edit
                              </button>
                              <button className={`btn btn-sm rounded-pill fw-semibold px-3 py-2 ${cat.status === "active" ? "btn-outline-warning" : "btn-outline-success"}`}
                                onClick={() => toggleStatus(cat._id, cat.status)}>
                                <i className={`fa ${cat.status === "active" ? "fa-pause" : "fa-play"} me-1`} />{cat.status === "active" ? "Deactivate" : "Activate"}
                              </button>
                              <button className="btn btn-sm btn-outline-danger rounded-pill fw-semibold px-3 py-2" onClick={() => handleDelete(cat._id)}>
                                <i className="fa fa-trash me-1" />Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-4 text-muted">No categories yet</p>
              )}
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
