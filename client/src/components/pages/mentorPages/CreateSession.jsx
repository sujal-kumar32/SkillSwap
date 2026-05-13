import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { showToast } from "../../../utils/toastUtils";
import LoadingButton from "../../../../src/utils/LoadingButton";
import Apiservices from "../../../../Apiservices";
import { PageHeader } from "../../learner/LearnerUI";

const CreateSession = () => {
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    title: "",
    skillId: "",
    sessionType: "online",
    description: "",
    date: "",
    time: "",
    duration: "",
    price: "",
    maxLearners: "",
    meetLink: "",
    thumbnail: "",
  });

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoadingSkills(true);
        const response = await Apiservices.getSkills();
        setSkills(response.data.data || []);
      } catch (error) {
        console.log(error);
        showToast.error("Failed to load skills");
      } finally {
        setLoadingSkills(false);
      }
    };

    fetchSkills();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const clearThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setForm((prev) => ({ ...prev, thumbnail: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.skillId) {
      showToast.warning("Session title and skill are required");
      return;
    }

    try {
      setSubmitting(true);
      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("skillId", form.skillId);
      payload.append("sessionType", form.sessionType);
      payload.append("description", form.description);
      payload.append("date", form.date);
      payload.append("time", form.time);
      payload.append("duration", Number(form.duration) || 0);
      payload.append("price", Number(form.price) || 0);
      payload.append("maxLearners", Number(form.maxLearners) || 0);
      payload.append("meetLink", form.meetLink);

      if (thumbnailFile) {
        payload.append("thumbnail", thumbnailFile);
      } else if (form.thumbnail) {
        payload.append("thumbnailUrl", form.thumbnail);
      }

      await Apiservices.createSession(payload);

      showToast.success("Session created successfully");
      navigate("/mentor/my-sessions");
    } catch (error) {
      console.log(error);
      showToast.error(error.response?.data?.message || "Failed to create session");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Create Session"
        subtitle="Set up a new learning session."
      />
      <div className="main-session-wrapper mb-5">
        <div className="container pb-5">
          <div className="row g-5">
            <div className="col-lg-8">
              <div className="session-form-card">
                <div className="session-card-header">
                  <div>
                    <h2 className="fw-bold mb-2">Session Setup</h2>

                    <p className="mb-0 text-light opacity-75">
                      Fill in all details to publish your session successfully.
                    </p>
                  </div>

                  <div className="header-icon">
                    <i className="fa fa-graduation-cap"></i>
                  </div>
                </div>

                <div className="p-5">
                  <form onSubmit={handleSubmit}>
                    <div className="row g-4">
                      <div className="col-12">
                        <label className="form-label fw-bold">
                          Session Title
                        </label>

                        <div className="modern-input-group">
                          <span>
                            <i className="fa fa-heading"></i>
                          </span>

                          <input
                            type="text"
                            name="title"
                            placeholder="Mastering React Hooks"
                            value={form.title}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-bold">
                          Select Skill
                        </label>

                        <select
                          className="modern-select"
                          name="skillId"
                          value={form.skillId}
                          onChange={handleChange}
                          disabled={loadingSkills}
                        >
                          <option value="">
                            {loadingSkills ? "Loading skills..." : "Choose Skill"}
                          </option>
                          {skills.map((skill) => (
                            <option key={skill._id} value={skill._id}>
                              {skill.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-bold">
                          Session Type
                        </label>

                        <select
                          className="modern-select"
                          name="sessionType"
                          value={form.sessionType}
                          onChange={handleChange}
                        >
                          <option value="online">Online</option>
                          <option value="offline">Offline</option>
                        </select>
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-bold">
                          Session Description
                        </label>

                        <textarea
                          rows="5"
                          name="description"
                          className="modern-textarea"
                          placeholder="Describe what learners will learn..."
                          value={form.description}
                          onChange={handleChange}
                        ></textarea>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-bold">
                          Session Date
                        </label>

                        <input
                          type="date"
                          name="date"
                          className="modern-control"
                          value={form.date}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-bold">
                          Session Time
                        </label>

                        <input
                          type="time"
                          name="time"
                          className="modern-control"
                          value={form.time}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-bold">Duration</label>

                        <div className="modern-input-group">
                          <input
                            type="number"
                            name="duration"
                            placeholder="60"
                            min="0"
                            value={form.duration}
                            onChange={handleChange}
                          />

                          <span>Min</span>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-bold">
                          Session Price
                        </label>

                        <div className="modern-input-group">
                          <span>₹</span>

                          <input
                            type="number"
                            name="price"
                            placeholder="500"
                            min="0"
                            value={form.price}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-bold">
                          Max Learners
                        </label>

                        <input
                          type="number"
                          name="maxLearners"
                          className="modern-control"
                          placeholder="30"
                          min="0"
                          value={form.maxLearners}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-bold">
                          Meeting Link
                        </label>

                        <div className="modern-input-group">
                          <span>
                            <i className="fa fa-link"></i>
                          </span>

                          <input
                            type="text"
                            name="meetLink"
                            placeholder="https://meet.google.com/"
                            value={form.meetLink}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-bold">
                          Thumbnail
                        </label>

                        <div
                          className="upload-box"
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={handleDrop}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
                        >
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                          />

                          {thumbnailPreview ? (
                            <div className="position-relative d-inline-block">
                              <img
                                src={thumbnailPreview}
                                alt="Preview"
                                style={{ maxHeight: 180, borderRadius: 16, objectFit: "cover" }}
                                className="w-100"
                              />
                              <button
                                type="button"
                                className="btn btn-sm btn-dark rounded-circle position-absolute"
                                style={{ top: 8, right: 8, width: 32, height: 32 }}
                                onClick={(e) => { e.stopPropagation(); clearThumbnail(); }}
                              >
                                <i className="fa fa-times"></i>
                              </button>
                            </div>
                          ) : form.thumbnail ? (
                            <div className="position-relative d-inline-block w-100">
                              <img
                                src={form.thumbnail}
                                alt="Preview"
                                style={{ maxHeight: 180, borderRadius: 16, objectFit: "cover" }}
                                className="w-100"
                              />
                              <button
                                type="button"
                                className="btn btn-sm btn-dark rounded-circle position-absolute"
                                style={{ top: 8, right: 8, width: 32, height: 32 }}
                                onClick={(e) => { e.stopPropagation(); clearThumbnail(); }}
                              >
                                <i className="fa fa-times"></i>
                              </button>
                            </div>
                          ) : (
                            <>
                              <i className="fa fa-cloud-upload-alt fa-2x mb-3"></i>
                              <h6 className="fw-bold">
                                Click or drag to upload
                              </h6>
                              <small className="text-muted">
                                Supports JPG, PNG, WebP — max 5MB
                              </small>
                            </>
                          )}
                        </div>

                        <div className="mt-2">
                          <small className="text-muted">Or paste a URL:</small>
                          <input
                            type="url"
                            name="thumbnail"
                            className="form-control mt-1"
                            placeholder="https://example.com/session.jpg"
                            value={form.thumbnail}
                            onChange={(e) => { setThumbnailFile(null); setThumbnailPreview(null); handleChange(e); }}
                          />
                        </div>
                      </div>

                      <div className="col-12 mt-4">
                        <div className="d-flex flex-wrap gap-3">
                          <LoadingButton
                            type="submit"
                            className="publish-btn"
                            loading={submitting}
                          >
                            <i className="fa fa-rocket me-2"></i>
                            {submitting ? "Publishing..." : "Publish Session"}
                          </LoadingButton>

                          <button
                            type="button"
                            className="draft-btn"
                            onClick={() => navigate("/mentor/my-sessions")}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="ai-card mb-4">
                <span className="badge bg-light text-primary px-3 py-2 rounded-pill mb-3">
                  AI Powered
                </span>

                <h3 className="fw-bold mb-3">Smart Session Generator</h3>

                <p className="text-light opacity-75 mb-4">
                  Generate better titles, descriptions, and session ideas using
                  SkillSwap AI.
                </p>

                <button className="btn btn-light rounded-pill px-4 fw-semibold">
                  Generate with AI
                </button>
              </div>

              <div className="tips-card">
                <h4 className="fw-bold mb-4">Mentor Tips</h4>

                <div className="tip-row">
                  <div className="tip-icon bg-primary">
                    <i className="fa fa-lightbulb"></i>
                  </div>

                  <div>
                    <h6 className="fw-bold">Clear Descriptions</h6>

                    <small className="text-muted">
                      Mention outcomes and learning goals.
                    </small>
                  </div>
                </div>

                <div className="tip-row">
                  <div className="tip-icon bg-success">
                    <i className="fa fa-users"></i>
                  </div>

                  <div>
                    <h6 className="fw-bold">Interactive Sessions</h6>

                    <small className="text-muted">
                      Encourage learner participation.
                    </small>
                  </div>
                </div>

                <div className="tip-row mb-0">
                  <div className="tip-icon bg-warning">
                    <i className="fa fa-clock"></i>
                  </div>

                  <div>
                    <h6 className="fw-bold">Proper Scheduling</h6>

                    <small className="text-muted">
                      Pick suitable timing for learners.
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          .main-session-wrapper {
            position: relative;
            background:
              radial-gradient(circle at top left, rgba(13,110,253,0.08), transparent 25%),
              radial-gradient(circle at bottom right, rgba(102,16,242,0.08), transparent 25%),
              linear-gradient(to bottom, #f8fbff, #f5f7ff);
            overflow: hidden;
          }

          .main-session-wrapper::before {
            content: "";
            position: absolute;
            width: 350px;
            height: 350px;
            background: rgba(13,110,253,0.08);
            border-radius: 50%;
            top: -120px;
            left: -120px;
            filter: blur(40px);
          }

          .main-session-wrapper::after {
            content: "";
            position: absolute;
            width: 300px;
            height: 300px;
            background: rgba(102,16,242,0.08);
            border-radius: 50%;
            bottom: -100px;
            right: -100px;
            filter: blur(40px);
          }

          .mentor-hero-section {
            background:
              linear-gradient(135deg, rgba(13,110,253,0.95), rgba(102,16,242,0.92)),
              url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop');
            background-size: cover;
            background-position: center;
            border-radius: 0 0 50px 50px;
          }

          .hero-badge {
            background: rgba(255,255,255,0.18);
            padding: 12px 24px;
            border-radius: 50px;
            color: white;
            font-weight: 600;
          }

          .hero-title {
            font-size: 4rem;
            font-weight: 800;
            color: white;
          }

          .hero-subtitle {
            color: rgba(255,255,255,0.8);
            font-size: 1.1rem;
          }

          .hero-stat h4 {
            color: white;
            margin-bottom: 0;
          }

          .hero-stat span {
            color: rgba(255,255,255,0.75);
          }

          .hero-image-card {
            position: relative;
          }

          .floating-card {
            position: absolute;
            bottom: -15px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            padding: 14px 24px;
            border-radius: 50px;
            font-weight: 600;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          }

          .session-form-card {
            background: rgba(255,255,255,0.85);
            backdrop-filter: blur(10px);
            border-radius: 35px;
            overflow: hidden;
            box-shadow: 0 20px 50px rgba(0,0,0,0.08);
          }

          .session-card-header {
            background: linear-gradient(135deg, #0d6efd, #6610f2);
            padding: 35px;
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .header-icon {
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
          }

          .modern-input-group {
            display: flex;
            align-items: center;
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            overflow: hidden;
            background: white;
          }

          .modern-input-group span {
            padding: 16px;
            background: #f8fafc;
          }

          .modern-input-group input {
            border: none;
            width: 100%;
            padding: 16px;
            outline: none;
          }

          .modern-control:focus,
          .modern-select:focus,
          .modern-textarea:focus,
          .modern-input-group:focus-within {
            border-color: #0d6efd;
            box-shadow: 0 0 0 4px rgba(13,110,253,0.12);
          }

          .upload-box {
            border: 2px dashed #cbd5e1;
            border-radius: 24px;
            padding: 40px;
            text-align: center;
            background: #f8fafc;
            transition: 0.3s;
          }

          .upload-box:hover {
            border-color: #0d6efd;
            background: #f1f5ff;
          }

          .publish-btn {
            background: linear-gradient(135deg, #0d6efd, #6610f2);
            border: none;
            color: white;
            padding: 16px 34px;
            border-radius: 50px;
            font-weight: 700;
          }

          .draft-btn {
            border: 1px solid #d1d5db;
            background: white;
            padding: 16px 34px;
            border-radius: 50px;
            font-weight: 600;
          }

          .ai-card {
            background: linear-gradient(135deg, #111827, #1e3a8a);
            padding: 35px;
            border-radius: 30px;
            color: white;
          }

          .tips-card {
            background: rgba(255,255,255,0.9);
            backdrop-filter: blur(10px);
            border-radius: 30px;
            padding: 35px;
            box-shadow: 0 15px 40px rgba(0,0,0,0.06);
          }

          .tip-row {
            display: flex;
            gap: 16px;
            margin-bottom: 28px;
          }

          .tip-icon {
            width: 55px;
            height: 55px;
            border-radius: 18px;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          @media(max-width: 768px) {
            .hero-title {
              font-size: 2.5rem;
            }

            .session-card-header {
              flex-direction: column;
              gap: 20px;
              text-align: center;
            }
          }
        `}
      </style>
    </>
  );
};

export default CreateSession;
