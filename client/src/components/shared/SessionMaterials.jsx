import React, { useCallback, useEffect, useRef, useState } from "react";
import Apiservices from "../../../Apiservices";
import { showToast } from "../../utils/toastUtils";

const typeIcons = {
  pdf: "fa-file-pdf",
  slide: "fa-file-powerpoint",
  document: "fa-file-word",
  spreadsheet: "fa-file-excel",
};

const formatSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const SessionMaterials = ({ sessionId, mode = "view" }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const fetchMaterials = useCallback(async () => {
    try {
      const res = await Apiservices.getSessionMaterials(sessionId);
      setMaterials(res.data.data || []);
    } catch {
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const uploadRes = await Apiservices.uploadSessionMaterial(sessionId, fd);
      showToast.success("Material uploaded");
      await fetchMaterials();
    } catch (err) {
      showToast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async (materialId) => {
    try {
      await Apiservices.deleteSessionMaterial(sessionId, materialId);
      setMaterials((prev) => prev.filter((m) => m._id !== materialId));
    } catch (err) {
      showToast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const handleDownload = (m) => {
    window.open(m.fileUrl, "_blank");
  };

  const isManage = mode === "manage";

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h6 className="fw-bold mb-0 d-flex align-items-center" style={{ gap: 8 }}>
          <i className="fa fa-folder-open text-primary" />
          Resources
          {materials.length > 0 && (
            <span className="badge bg-primary rounded-pill" style={{ fontSize: "0.65rem", padding: "2px 7px" }}>{materials.length}</span>
          )}
        </h6>
        {isManage && (
          <div className="d-flex align-items-center" style={{ gap: 8 }}>
            <input
              type="file"
              ref={fileRef}
              style={{ display: "none" }}
              accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.txt,.zip,.png,.jpg,.jpeg,.webp"
              onChange={handleUpload}
            />
            <button
              className="btn btn-sm btn-primary rounded-pill d-inline-flex align-items-center"
              style={{ gap: 6, padding: "5px 14px", fontSize: "0.78rem" }}
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <><span className="spinner-border spinner-border-sm" role="status" /> Uploading</>
              ) : (
                <><i className="fa fa-upload" /> Upload Resource</>
              )}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm text-primary" role="status" />
        </div>
      ) : materials.length === 0 ? (
        <div className="text-center py-4 rounded-4" style={{ background: "#f8fafc", border: "1px dashed #d1d5db" }}>
          {isManage ? (
            <>
              <i className="fa fa-cloud-upload-alt text-muted" style={{ fontSize: "1.5rem", marginBottom: 8 }} />
              <p className="text-muted small mb-0">Upload PDFs, slides, or documents for your learners</p>
            </>
          ) : (
            <>
              <i className="fa fa-folder-open text-muted" style={{ fontSize: "1.5rem", marginBottom: 8 }} />
              <p className="text-muted small mb-0">No resources available for this session</p>
            </>
          )}
        </div>
      ) : (
        <div className="d-flex flex-column" style={{ gap: 6 }}>
          {materials.map((m) => (
            <div
              key={m._id}
              className="d-flex align-items-center justify-content-between px-3 py-2 rounded-3"
              style={{ background: "#f8fafc", border: "1px solid #e9ecef" }}
            >
              <div className="d-flex align-items-center" style={{ gap: 10, minWidth: 0 }}>
                <span
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #0d6efd, #6610f2)",
                    color: "white",
                    fontSize: "0.85rem",
                    flexShrink: 0,
                  }}
                >
                  <i className={`fa ${typeIcons[m.type] || "fa-file"}`} />
                </span>
                <div style={{ minWidth: 0, maxWidth: 240 }}>
                  <p className="fw-semibold mb-0 text-truncate" style={{ fontSize: "0.82rem" }}>{m.title}</p>
                  <div className="d-flex align-items-center" style={{ gap: 4 }}>
                    <span className="text-muted" style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.3px" }}>{m.type || "file"}</span>
                    {m.fileSize ? <span className="text-muted" style={{ fontSize: "0.7rem" }}>•</span> : null}
                    {m.fileSize ? <span className="text-muted" style={{ fontSize: "0.7rem" }}>{formatSize(m.fileSize)}</span> : null}
                    {m.createdAt ? <span className="text-muted" style={{ fontSize: "0.7rem" }}>•</span> : null}
                    {m.createdAt ? <span className="text-muted" style={{ fontSize: "0.7rem" }}>{formatDate(m.createdAt)}</span> : null}
                    {m.uploadedBy?.name ? <span className="text-muted" style={{ fontSize: "0.7rem" }}>• {m.uploadedBy.name}</span> : null}
                  </div>
                </div>
              </div>
              <div className="d-flex align-items-center" style={{ gap: 4, flexShrink: 0 }}>
                <button
                  className="btn btn-sm btn-outline-primary rounded-pill d-inline-flex align-items-center"
                  style={{ gap: 4, fontSize: "0.75rem", padding: "3px 10px" }}
                  onClick={() => handleDownload(m)}
                >
                  <i className="fa fa-download" style={{ fontSize: "0.65rem" }} /> Download
                </button>
                {isManage && (
                  <button
                    className="btn btn-sm btn-outline-danger rounded-pill d-inline-flex align-items-center"
                    style={{ gap: 4, fontSize: "0.75rem", padding: "3px 10px" }}
                    onClick={() => handleDelete(m._id)}
                  >
                    <i className="fa fa-trash" style={{ fontSize: "0.65rem" }} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionMaterials;
