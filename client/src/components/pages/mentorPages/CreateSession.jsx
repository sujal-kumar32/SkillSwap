import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { showToast } from "../../../utils/toastUtils";
import LoadingButton from "../../../../src/utils/LoadingButton";
import Apiservices from "../../../../Apiservices";
import { PageHeader } from "../../learner/LearnerUI";

const AiBtn = ({ loading, label, icon, onClick, style }) => (
  <button type="button" className="btn rounded-pill fw-semibold border-0 d-flex align-items-center justify-content-center ai-btn"
    onClick={onClick} disabled={loading}
    style={{ ...style, opacity: loading ? 0.7 : 1, gap: 10 }}>
    {loading ? <span className="spinner-border spinner-border-sm" role="status" /> : <i className={`fa ${icon}`} />}
    {loading ? "Generating..." : label}
  </button>
);

const SidebarAiBtn = ({ loading, label, icon, onClick, colors }) => (
  <AiBtn loading={loading} label={label} icon={icon} onClick={onClick}
    style={{ background: colors, color: "white", padding: "14px 24px" }} />
);

const FormAiBtn = ({ loading, label, onClick }) => (
  <AiBtn loading={loading} label={label} icon="fa-magic" onClick={onClick}
    style={{ background: "linear-gradient(135deg, #0d6efd, #6610f2)", color: "white", padding: "10px 24px", fontSize: "0.85rem", boxShadow: loading ? "none" : "0 4px 14px rgba(102,16,242,0.3)" }} />
);

const ThumbnailPreview = ({ src, onClear }) => (
  <div className="position-relative d-inline-block w-100">
    <img src={src} alt="Preview" style={{ maxHeight: 180, borderRadius: 16, objectFit: "cover" }} className="w-100" />
    <button type="button" className="btn btn-sm btn-dark rounded-circle position-absolute"
      style={{ top: 8, right: 8, width: 32, height: 32 }} onClick={onClear}>
      <i className="fa fa-times" />
    </button>
  </div>
);

const ThumbnailUploader = ({ thumbnailPreview, formThumbnail, fileInputRef, onFileChange, onDrop, onClear }) => (
  <div className="upload-box" onClick={() => fileInputRef.current?.click()}
    onDragOver={(e) => e.preventDefault()} onDrop={onDrop}
    role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}>
    <input type="file" ref={fileInputRef} accept="image/*" style={{ display: "none" }} onChange={onFileChange} />
    {thumbnailPreview ? <ThumbnailPreview src={thumbnailPreview} onClear={onClear} />
      : formThumbnail ? <ThumbnailPreview src={formThumbnail} onClear={onClear} />
        : (
          <>
            <i className="fa fa-cloud-upload-alt fa-2x mb-3" />
            <h6 className="fw-bold">Click or drag to upload</h6>
            <small className="text-muted">Supports JPG, PNG, WebP — max 5MB</small>
          </>
        )}
  </div>
);

const PriceToggle = ({ isFree, onClick }) => (
  <button type="button"
    className={`px-4 py-2 fw-semibold rounded-pill border-0 ${isFree ? "btn btn-success" : "btn btn-outline-secondary"}`}
    style={{ fontSize: "0.9rem", transition: "all 0.2s" }} onClick={onClick}>
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <i className="fa fa-gift" />Free
    </span>
  </button>
);

const CreditToggle = ({ enabled, onToggle }) => (
  <div className="col-12">
    <div className="d-flex align-items-center" style={{ gap: 10 }}>
      <label className="form-label fw-bold mb-0">Accept Credit Payments</label>
      <button type="button"
        className={`px-3 py-1 fw-semibold rounded-pill border-0 ${enabled ? "btn btn-success" : "btn btn-outline-secondary"}`}
        style={{ fontSize: "0.8rem", transition: "all 0.2s" }} onClick={onToggle}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <i className={`fa ${enabled ? "fa-check-circle" : "fa-coins"}`} />
          {enabled ? "Credits Enabled" : "Enable Credits"}
        </span>
      </button>
    </div>
    <small className="text-muted" style={{ fontSize: "0.72rem" }}>Students can pay with skill credits instead of money</small>
  </div>
);

const CreateSession = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
    bookingTypes: ["paid"],
  });

  const [aiLoading, setAiLoading] = useState({ title: false, description: false, outcomes: false, tags: false, mentor: false });
  const [bookedSlots, setBookedSlots] = useState([]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoadingSkills(true);
        const response = await Apiservices.getSkills();
        const list = response.data.data || [];
        setSkills(list);
        const skillId = searchParams.get("skillId");
        if (skillId && list.some((s) => s._id === skillId)) {
          setForm((prev) => ({ ...prev, skillId }));
        }
      } catch (error) {
        console.log(error);
        showToast.error("Failed to load skills");
      } finally {
        setLoadingSkills(false);
      }
    };
    fetchSkills();
  }, []);

  useEffect(() => {
    if (!form.date) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await Apiservices.getBookedSlots({ date: form.date });
        if (!cancelled) setBookedSlots(res.data.data || []);
      } catch {
        if (!cancelled) setBookedSlots([]);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [form.date]);

  const bookedTimes = useMemo(() => {
    return bookedSlots.map((s) => s.time?.slice(0, 5)).filter(Boolean);
  }, [bookedSlots]);

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

  const getSkillName = () => {
    const skill = skills.find((s) => s._id === form.skillId);
    return skill?.name || "";
  };

  const generateAITitle = async () => {
    const skill = getSkillName();
    if (!skill && !form.title.trim()) {
      showToast.warning("Select a skill or type a topic first");
      return;
    }
    setAiLoading((prev) => ({ ...prev, title: true }));
    try {
      const res = await Apiservices.generateTitle({
        skill: skill || form.title,
        topic: form.title || skill,
        level: "all",
      });
      setForm((prev) => ({ ...prev, title: res.data.data.title }));
      showToast.success("AI title generated");
    } catch (err) {
      showToast.error(err.response?.data?.message || "Failed to generate title");
    } finally {
      setAiLoading((prev) => ({ ...prev, title: false }));
    }
  };

  const generateAIDescription = async () => {
    const skill = getSkillName();
    if (!skill && !form.title.trim()) {
      showToast.warning("Enter a session title or select a skill first");
      return;
    }
    setAiLoading((prev) => ({ ...prev, description: true }));
    try {
      const res = await Apiservices.generateDescription({
        skill: skill || form.title,
        sessionType: form.sessionType,
      });
      setForm((prev) => ({ ...prev, description: res.data.data.description }));
      showToast.success("AI description generated");
    } catch (err) {
      showToast.error(err.response?.data?.message || "Failed to generate description");
    } finally {
      setAiLoading((prev) => ({ ...prev, description: false }));
    }
  };

  const generateAIOutcomes = async () => {
    const skill = getSkillName();
    if (!skill && !form.title.trim()) {
      showToast.warning("Enter a session title or select a skill first");
      return;
    }
    setAiLoading((prev) => ({ ...prev, outcomes: true }));
    try {
      const res = await Apiservices.generateOutcomes({
        skill: skill || form.title,
        level: "all",
      });
      const outcomes = res.data.data.outcomes;
      setForm((prev) => ({ ...prev, description: prev.description + "\n\n" + outcomes }));
      showToast.success("AI learning outcomes added to description");
    } catch (err) {
      showToast.error(err.response?.data?.message || "Failed to generate outcomes");
    } finally {
      setAiLoading((prev) => ({ ...prev, outcomes: false }));
    }
  };

  const generateAITags = async () => {
    const skill = getSkillName();
    if (!skill && !form.title.trim()) {
      showToast.warning("Enter a session title or select a skill first");
      return;
    }
    setAiLoading((prev) => ({ ...prev, tags: true }));
    try {
      const res = await Apiservices.generateTags({
        skill: skill || form.title,
      });
      showToast.success(`AI suggested tags: ${res.data.data.tags}`);
    } catch (err) {
      showToast.error(err.response?.data?.message || "Failed to generate tags");
    } finally {
      setAiLoading((prev) => ({ ...prev, tags: false }));
    }
  };

  const getMentorFeedback = async () => {
    if (!form.title.trim() && !form.description.trim()) {
      showToast.warning("Add a title or description first");
      return;
    }
    setAiLoading((prev) => ({ ...prev, mentor: true }));
    try {
      const res = await Apiservices.mentorAssistant({
        title: form.title,
        description: form.description,
      });
      showToast.info(res.data.data.feedback, { autoClose: 8000 });
    } catch (err) {
      showToast.error(err.response?.data?.message || "Failed to get feedback");
    } finally {
      setAiLoading((prev) => ({ ...prev, mentor: false }));
    }
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
      payload.append("bookingTypes", "paid");
      if (form.bookingTypes.includes("credits")) {
        payload.append("bookingTypes", "credits");
      }

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
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <label className="form-label fw-bold mb-0">Session Title</label>
                          <FormAiBtn loading={aiLoading.title} label="Generate with AI" onClick={generateAITitle} />
                        </div>
                        <div className="modern-input-group">
                          <span><i className="fa fa-heading"></i></span>
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

                      <div className="col-md-6" style={{ marginBottom: 10 }}>
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
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <label className="form-label fw-bold mb-0">Session Description</label>
                          <FormAiBtn loading={aiLoading.description} label="Generate with AI" onClick={generateAIDescription} />
                        </div>
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
                        {form.time && bookedTimes.includes(form.time) && (
                          <div className="mt-2 text-danger small fw-semibold">
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><i className="fa fa-exclamation-circle" />This time is already booked</span>
                          </div>
                        )}
                        {bookedTimes.length > 0 && (
                          <div className="mt-2 text-muted small">
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><i className="fa fa-clock" />Booked: {bookedTimes.join(", ")}</span>
                          </div>
                        )}
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
                        <div className="d-flex gap-2 mb-3">
                          <PriceToggle isFree={!form.price || Number(form.price) === 0} onClick={() => setForm((prev) => ({ ...prev, price: "0" }))} />
                          <button type="button"
                            className={`px-4 py-2 fw-semibold rounded-pill border-0 ${Number(form.price) > 0 ? "btn btn-primary" : "btn btn-outline-secondary"}`}
                            style={{ fontSize: "0.9rem", transition: "all 0.2s" }}
                            onClick={() => setForm((prev) => ({ ...prev, price: prev.price > 0 ? prev.price : "99" }))}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><i className="fa fa-credit-card"></i>Paid</span>
                          </button>
                        </div>
                        {Number(form.price) > 0 && (
                          <div className="modern-input-group">
                            <span>₹</span>
                            <input
                              type="number"
                              name="price"
                              placeholder="e.g. 500"
                              min="1"
                              value={form.price}
                              onChange={handleChange}
                            />
                          </div>
                        )}
                      </div>

                      {form.bookingTypes.includes("credits") && (
                        <div className="col-12">
                          <div className="p-3 rounded-4" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                            <div className="d-flex align-items-center" style={{ gap: 8 }}>
                              <i className="fa fa-coins" style={{ color: "#16a34a" }} />
                              <span className="fw-semibold" style={{ fontSize: "0.9rem", color: "#166534" }}>
                                Credit cost: ~{Math.round((Number(form.duration) || 60) / 60 * 10)} credits
                              </span>
                              <small className="text-muted" style={{ fontSize: "0.72rem" }}>
                                (based on your skill level × duration)
                              </small>
                            </div>
                          </div>
                        </div>
                      )}

                      <CreditToggle enabled={form.bookingTypes.includes("credits")}
                        onToggle={() => setForm((prev) => {
                          const has = prev.bookingTypes.includes("credits");
                          return { ...prev, bookingTypes: has ? ["paid"] : ["paid", "credits"] };
                        })} />

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
                        <ThumbnailUploader thumbnailPreview={thumbnailPreview} formThumbnail={form.thumbnail}
                          fileInputRef={fileInputRef} onFileChange={handleFileChange}
                          onDrop={handleDrop} onClear={(e) => { e.stopPropagation(); clearThumbnail(); }} />
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
                        <div className="d-flex flex-wrap" style={{ gap: "10px" }}>
                          <LoadingButton
                            type="submit"
                            className="publish-btn"
                            loading={submitting}
                          >
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><i className="fa fa-rocket"></i>
                            {submitting ? "Publishing..." : "Publish Session"}</span>
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

            <div className="col-lg-4 d-flex flex-column" style={{ gap: "10px" }}>
              <div className="ai-card">
                <div className="d-flex align-items-center mb-4" style={{ gap: 10 }}>
                  <span className="ai-badge">
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><i className="fa fa-microchip" />AI Powered</span>
                  </span>
                </div>

                <h3 className="fw-bold mb-3" style={{ fontSize: "1.4rem" }}>Smart Session Generator</h3>
                <p className="opacity-60 mb-4" style={{ fontSize: "0.9rem", lineHeight: 1.7 }}>
                  Generate better titles, descriptions, and session ideas using SkillSwap AI.
                </p>

                <div className="d-flex flex-column gap-3">
                  <SidebarAiBtn loading={aiLoading.title} label="Generate Title" icon="fa-heading" onClick={generateAITitle} colors="linear-gradient(135deg, #2563eb, #7c3aed)" />
                  <SidebarAiBtn loading={aiLoading.description} label="Generate Description" icon="fa-file-lines" onClick={generateAIDescription} colors="linear-gradient(135deg, #7c3aed, #db2777)" />
                  <SidebarAiBtn loading={aiLoading.outcomes} label="Generate Outcomes" icon="fa-bullseye" onClick={generateAIOutcomes} colors="linear-gradient(135deg, #059669, #10b981)" />
                  <SidebarAiBtn loading={aiLoading.tags} label="Suggest Tags" icon="fa-tags" onClick={generateAITags} colors="linear-gradient(135deg, #d97706, #f59e0b)" />
                  <SidebarAiBtn loading={aiLoading.mentor} label="Improve Content" icon="fa-magic" onClick={getMentorFeedback} colors="linear-gradient(135deg, #dc2626, #f43f5e)" />
                </div>
              </div>

              <div className="tips-card">
                <div className="d-flex align-items-center mb-4" style={{ gap: 10 }}>
                  <div className="tip-header-icon">
                    <i className="fa fa-lightbulb" />
                  </div>
                  <div>
                    <h5 className="fw-bold mb-1">Mentor Tips</h5>
                    <small className="text-muted">Best practices for great sessions</small>
                  </div>
                </div>
                <div className="tip-row">
                  <div className="tip-icon" style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
                    <i className="fa fa-pen-fancy" />
                  </div>
                  <div>
                    <p className="fw-bold mb-1" style={{ fontSize: "0.9rem" }}>Clear Descriptions</p>
                    <small className="text-muted">Mention outcomes, prerequisites, and what learners will gain.</small>
                  </div>
                </div>
                <div className="tip-row">
                  <div className="tip-icon" style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}>
                    <i className="fa fa-people-group" />
                  </div>
                  <div>
                    <p className="fw-bold mb-1" style={{ fontSize: "0.9rem" }}>Interactive Sessions</p>
                    <small className="text-muted">Encourage questions, demos, and hands-on practice.</small>
                  </div>
                </div>
                <div className="tip-row mb-0">
                  <div className="tip-icon" style={{ background: "linear-gradient(135deg, #d97706, #f59e0b)" }}>
                    <i className="fa fa-clock" />
                  </div>
                  <div>
                    <p className="fw-bold mb-1" style={{ fontSize: "0.9rem" }}>Proper Scheduling</p>
                    <small className="text-muted">Choose timing that works for your target audience.</small>
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
            background: linear-gradient(135deg, #0f172a, #1e3a8a);
            padding: 40px;
            border-radius: 30px;
            color: white;
          }
          .ai-badge {
            display: inline-flex;
            align-items: center;
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255,255,255,0.12);
            padding: 7px 18px;
            border-radius: 50px;
            font-size: 0.8rem;
            font-weight: 600;
          }
          .ai-btn {
            transition: all 0.25s ease !important;
            font-size: 0.95rem;
          }
          .ai-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 28px rgba(0,0,0,0.35) !important;
          }
          .tip-header-icon {
            width: 48px;
            height: 48px;
            border-radius: 16px;
            background: linear-gradient(135deg, #d97706, #f59e0b);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.1rem;
            flex-shrink: 0;
          }
          .tips-card {
            background: rgba(255,255,255,0.92);
            backdrop-filter: blur(10px);
            border-radius: 30px;
            padding: 35px;
            box-shadow: 0 15px 40px rgba(0,0,0,0.06);
          }
          .tip-row {
            display: flex;
            gap: 18px;
            margin-bottom: 30px;
          }
          .tip-icon {
            width: 55px;
            height: 55px;
            border-radius: 18px;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .tip-header-icon {
            width: 48px;
            height: 48px;
            border-radius: 16px;
            background: linear-gradient(135deg, #d97706, #f59e0b);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.1rem;
            flex-shrink: 0;
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
