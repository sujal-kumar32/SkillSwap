import React, { useCallback, useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { showToast } from "../../../utils/toastUtils";
import Apiservices from "../../../../Apiservices";
import { LoadingState, PageHeader } from "../../learner/LearnerUI";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const defaultSlots = [
  { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: 3, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: 5, startTime: "09:00", endTime: "17:00" },
];

const MentorAvailability = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingBooked, setLoadingBooked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await Apiservices.getMyAvailability();
        if (!cancelled) {
          const data = res.data.data;
          setSlots(data.slots?.length ? data.slots : []);
        }
      } catch {
        if (!cancelled) showToast.error("Failed to load availability");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const fmtDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  useEffect(() => {
    let cancelled = false;
    const loadBooked = async () => {
      setLoadingBooked(true);
      try {
        const res = await Apiservices.getBookedSlots({ date: fmtDate(selectedDate) });
        if (!cancelled) setBookedSlots(res.data.data || []);
      } catch {
        if (!cancelled) setBookedSlots([]);
      } finally {
        if (!cancelled) setLoadingBooked(false);
      }
    };
    loadBooked();
    return () => { cancelled = true; };
  }, [selectedDate]);

  const toggleDay = (dayOfWeek) => {
    setSlots((prev) => {
      const exists = prev.find((s) => s.dayOfWeek === dayOfWeek);
      if (exists) return prev.filter((s) => s.dayOfWeek !== dayOfWeek);
      return [...prev, { dayOfWeek, startTime: "09:00", endTime: "17:00" }];
    });
  };

  const updateSlotTime = (dayOfWeek, field, value) => {
    setSlots((prev) =>
      prev.map((s) => (s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s)),
    );
  };

  const setPreset = (preset) => {
    if (preset === "business") setSlots([...defaultSlots]);
    else if (preset === "full") {
      setSlots(
        Array.from({ length: 7 }, (_, i) => ({
          dayOfWeek: i,
          startTime: "09:00",
          endTime: "17:00",
        })),
      );
    } else setSlots([]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Apiservices.updateMyAvailability({ slots });
      showToast.success("Availability saved");
    } catch {
      showToast.error("Failed to save availability");
    } finally {
      setSaving(false);
    }
  };

  const activeDays = useMemo(() => new Set(slots.map((s) => s.dayOfWeek)), [slots]);

  const tileClassName = useCallback(
    ({ date }) => {
      const dow = date.getDay();
      if (!activeDays.has(dow)) return "unavailable-day";
      return "available-day";
    },
    [activeDays],
  );

  const allDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  if (loading) return <LoadingState label="Loading availability..." />;

  return (
    <>
      <PageHeader title="My Availability" subtitle="Set your weekly schedule and see booked sessions." />

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="learner-card overflow-hidden h-100" style={{ border: "none" }}>
            <div style={{
              background: "linear-gradient(135deg, #0d6efd, #6610f2)",
              padding: "20px 24px",
            }}>
              <h5 className="fw-bold mb-1 text-white">Weekly Schedule</h5>
              <small className="text-white opacity-75">Set your recurring availability</small>
            </div>
            <div className="p-4">
              <div className="d-flex flex-wrap" style={{ gap: "10px", marginBottom: "16px" }}>
                <button className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-semibold" onClick={() => setPreset("business")}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}><i className="fa fa-briefcase" />M-F 9-5</span>
                </button>
                <button className="btn btn-sm btn-outline-success rounded-pill px-3 fw-semibold" onClick={() => setPreset("full")}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}><i className="fa fa-calendar-week" />Full Week</span>
                </button>
                <button className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-semibold" onClick={() => setPreset("clear")}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}><i className="fa fa-eraser" />Clear</span>
                </button>
              </div>

              <div className="d-flex flex-column" style={{ gap: "10px", marginBottom: "20px" }}>
                {DAYS.map((day, i) => {
                  const slot = slots.find((s) => s.dayOfWeek === i);
                  const active = !!slot;
                  return (
                    <div key={i} className="d-flex align-items-center" style={{ gap: "10px" }}>
                      <button
                        className={`btn btn-sm rounded-pill fw-bold ${active ? "btn-primary" : "btn-outline-secondary"}`}
                        style={{ minWidth: 56, padding: "6px 12px", transition: "all 0.15s" }}
                        onClick={() => toggleDay(i)}
                      >
                        {day}
                      </button>
                      {active && (
                        <>
                          <input
                            type="time"
                            className="form-control form-control-sm rounded-pill"
                            style={{ width: 110, padding: "6px 12px" }}
                            value={slot.startTime}
                            onChange={(e) => updateSlotTime(i, "startTime", e.target.value)}
                          />
                          <span className="text-muted fw-semibold">—</span>
                          <input
                            type="time"
                            className="form-control form-control-sm rounded-pill"
                            style={{ width: 110, padding: "6px 12px" }}
                            value={slot.endTime}
                            onChange={(e) => updateSlotTime(i, "endTime", e.target.value)}
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                className="btn btn-primary rounded-pill px-4 fw-bold w-100"
                style={{ padding: "12px 20px" }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}><span className="spinner-border spinner-border-sm" />Saving...</span>
                ) : (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}><i className="fa fa-save" />Save Schedule</span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="learner-card p-4" style={{ marginBottom: "16px" }}>
            <h5 className="fw-bold mb-3" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <i className="fa fa-calendar-alt text-primary" />Calendar
            </h5>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileClassName={tileClassName}
              className="w-100 border-0"
            />
          </div>

          <div className="learner-card p-4">
            <div className="d-flex align-items-center" style={{ gap: "10px", marginBottom: "16px" }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: "linear-gradient(135deg, rgba(13,110,253,0.12), rgba(13,110,253,0.05))",
                display: "grid", placeItems: "center", color: "#0d6efd", flexShrink: 0,
              }}>
                <i className="fa fa-calendar-day" />
              </div>
              <div>
                <h5 className="fw-bold mb-0">
                  {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </h5>
                <small className="text-muted">
                  {allDayNames[selectedDate.getDay()]}, {bookedSlots.length} booking{bookedSlots.length !== 1 ? "s" : ""}
                </small>
              </div>
            </div>

            {loadingBooked ? (
              <div className="text-center py-4">
                <div className="spinner-border spinner-border-sm text-primary" />
              </div>
            ) : bookedSlots.length ? (
              <div className="d-flex flex-column" style={{ gap: "10px" }}>
                {bookedSlots.map((slot, i) => (
                  <div key={i} className="d-flex align-items-center justify-content-between p-3 rounded-4" style={{ background: "#f8fafc", border: "1px solid #eef2f7" }}>
                    <div className="d-flex align-items-center" style={{ gap: "12px" }}>
                      <div className="text-center" style={{ minWidth: 56 }}>
                        <div className="fw-bold text-primary" style={{ fontSize: "1rem", lineHeight: 1.2 }}>{slot.time?.slice(0, 5) || "--:--"}</div>
                        <small className="text-muted" style={{ fontSize: "0.7rem" }}>{slot.duration} min</small>
                      </div>
                      <div style={{
                        width: 1, height: 32, background: "#e2e8f0", flexShrink: 0,
                      }} />
                      <div>
                        <div className="fw-semibold" style={{ fontSize: "0.88rem", lineHeight: 1.3 }}>{slot.title}</div>
                        <small className="text-muted" style={{ fontSize: "0.78rem", display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <i className="fa fa-user" />{slot.learnerName}
                        </small>
                      </div>
                    </div>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: slot.requestStatus === "accepted" ? "linear-gradient(135deg, #16a34a, #15803d)" : slot.requestStatus === "completed" ? "linear-gradient(135deg, #0d6efd, #0a58ca)" : "linear-gradient(135deg, #eab308, #ca8a04)", color: slot.requestStatus === "accepted" || slot.requestStatus === "completed" ? "white" : "#1e293b", padding: "4px 14px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.3px" }}>
                      <i className={`fa ${slot.requestStatus === "accepted" ? "fa-check-circle" : slot.requestStatus === "completed" ? "fa-check" : "fa-clock"}`} />
                      {slot.requestStatus}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5">
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: "linear-gradient(135deg, rgba(13,110,253,0.08), rgba(13,110,253,0.03))",
                  display: "grid", placeItems: "center", color: "#94a3b8", fontSize: "1.3rem",
                  margin: "0 auto 12px",
                }}>
                  <i className="fa fa-calendar-day" />
                </div>
                <p className="text-muted mb-0 fw-semibold" style={{ fontSize: "0.9rem" }}>No bookings on this day</p>
                <small className="text-muted">Booked sessions will appear here</small>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .react-calendar { border: none; font-family: inherit; width: 100%; }
        .react-calendar__navigation { margin-bottom: 8px; }
        .react-calendar__navigation button { font-size: 0.95rem; font-weight: 600; color: #1e293b; min-height: 40px; border-radius: 10px; }
        .react-calendar__navigation button:enabled:hover { background: #eef2ff; }
        .react-calendar__month-view__weekdays { text-transform: uppercase; font-size: 0.7rem; font-weight: 700; color: #94a3b8; padding: 4px 0; }
        .react-calendar__month-view__weekdays__weekday abbr { text-decoration: none; }
        .react-calendar__tile { padding: 10px 6px; border-radius: 10px; font-size: 0.85rem; }
        .react-calendar__tile:enabled:hover { background: #eef2ff; }
        .react-calendar__tile--active:enabled:hover { background: #0d6efd !important; }
        .react-calendar__tile--active { background: #0d6efd !important; color: white !important; border-radius: 10px; }
        .react-calendar__tile--now { background: #fff7ed; border-radius: 10px; }
        .react-calendar__tile--now.react-calendar__tile--active { background: #0d6efd !important; }
        .available-day { color: #0d6efd; font-weight: 700; }
        .unavailable-day { opacity: 0.35; }
        .react-calendar__month-view__days__day--weekend { color: inherit; }
      `}</style>
    </>
  );
};

export default MentorAvailability;
