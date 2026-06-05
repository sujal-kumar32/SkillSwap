import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import UserLink from "../../../components/shared/UserLink";
import { showToast } from "../../../utils/toastUtils";
import LoadingButton from "../../../../src/utils/LoadingButton";
import Apiservices from "../../../../Apiservices";
import { EmptyState, LoadingState, PageHeader } from "../../learner/LearnerUI";
import { useAuth } from "../../../App";

const BookSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [insufficientFunds, setInsufficientFunds] = useState(false);
  const [requiredAmount, setRequiredAmount] = useState(0);
  const [error, setError] = useState("");
  const [bookingSource, setBookingSource] = useState("paid");
  const [walletData, setWalletData] = useState(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        setError("");
        const [sessionRes, walletRes] = await Promise.all([
          Apiservices.fetchSessionDetails(id),
          Apiservices.getWallet().catch(() => null),
        ]);
        setSession(sessionRes.data.data);
        if (walletRes?.data?.data) setWalletData(walletRes.data.data);
        const s = sessionRes.data.data;
        if (s?.bookingTypes?.includes("credits") && !s?.bookingTypes?.includes("paid")) {
          setBookingSource("credits");
        }
      } catch (error) {
        console.log(error);
        setSession(null);
        setError(error.response?.data?.message || "Failed to load session");
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [id]);

  const submitBooking = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setInsufficientFunds(false);

      const payload = { sessionId: session._id, bookingSource };
      if (note.trim()) payload.note = note.trim();

      const bookRes = await Apiservices.bookSession(payload);
      const requestId = bookRes.data.data?._id;

      const cancelRequest = async () => {
        try { await Apiservices.updateRequest(requestId, "cancelled"); } catch {}
      };

      if (bookingSource === "credits") {
        showToast.success("Session booked with credits!");
        setSuccess(true);
      } else if (session.price && session.price > 0) {
        try {
          await Apiservices.payWithWallet(requestId);
          showToast.success("Payment successful! Booking confirmed.");
          setSuccess(true);
        } catch (payErr) {
          const msg = payErr.response?.data?.message || "";
          if (msg.includes("Insufficient wallet balance")) {
            setRequiredAmount(payErr.response.data.required || session.price);
            setInsufficientFunds(true);
            showToast.warning("Insufficient wallet balance. Add funds to continue.");
            await cancelRequest();
          } else {
            showToast.error(msg || "Payment failed");
            await cancelRequest();
          }
          setSubmitting(false);
        }
      } else {
        showToast.success("Session booked successfully!");
        setSuccess(true);
      }
    } catch (error) {
      console.log(error);
      showToast.error(error.response?.data?.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Flexible";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  if (loading) return <LoadingState label="Loading booking page..." />;

  if (!session) {
    return (
      <EmptyState
        title="Session unavailable"
        text={error || "This session could not be loaded."}
        actionLabel="Explore Sessions"
        actionTo="/learner/explore"
      />
    );
  }

  if (success) {
    return (
      <div className="learner-card p-5 text-center">
        <div className="learner-empty-icon mx-auto mb-3 text-success bg-success bg-opacity-10">
          <i className="fa fa-check" />
        </div>
        <h3 className="fw-bold">Booking {session.price && bookingSource !== "credits" ? "& Payment" : "Request"} Successful</h3>
        <p className="text-muted mb-4">
          {bookingSource === "credits"
            ? "Your credits have been locked and booking is confirmed."
            : session.price
              ? "Your payment has been processed and booking is confirmed."
              : "You will see this session in My Bookings after confirmation."}
        </p>
        <Link to="/learner/bookings" className="btn btn-primary rounded-pill px-4">Go to My Bookings</Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Book Session" subtitle="Review the session schedule and confirm your booking." />
      <div className="row g-4">
        <div className="col-lg-7">
          <form className="learner-card p-4" onSubmit={submitBooking}>
            <h5 className="fw-bold mb-3">Session Schedule</h5>
            <div className="d-flex align-items-center gap-4 mb-4 p-3 rounded-4" style={{ background: "#f8faff" }}>
              <div style={{ width: 60, height: 60, borderRadius: 16, background: "linear-gradient(135deg, #2878eb15, #2878eb05)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: "1.3rem", fontWeight: 800, color: "#2878eb", lineHeight: 1 }}>{session.date ? new Date(session.date).getDate() : "—"}</span>
                <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#2878eb", textTransform: "uppercase", lineHeight: 1 }}>{session.date ? new Date(session.date).toLocaleString("en", { month: "short" }) : ""}</span>
              </div>
              <div>
                <h6 className="fw-bold mb-1">{formatDate(session.date)}</h6>
                <p className="text-muted mb-0 small">
                  {session.time || "Flexible time"} &middot; {session.duration || 60} min
                </p>
              </div>
            </div>

            {session.bookingTypes?.length > 1 && (
              <div className="mb-4">
                <label className="form-label fw-semibold">Payment Method</label>
                <div className="d-flex gap-2">
                  {session.bookingTypes.includes("paid") && (
                    <button type="button"
                      className={`px-4 py-2 fw-semibold rounded-pill border-0 ${bookingSource === "paid" ? "btn btn-primary" : "btn btn-outline-secondary"}`}
                      style={{ fontSize: "0.85rem", transition: "all 0.2s" }}
                      onClick={() => setBookingSource("paid")}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><i className="fa fa-credit-card" /> Pay with Money</span>
                    </button>
                  )}
                  {session.bookingTypes.includes("credits") && (
                    <button type="button"
                      className={`px-4 py-2 fw-semibold rounded-pill border-0 ${bookingSource === "credits" ? "btn btn-success" : "btn btn-outline-secondary"}`}
                      style={{ fontSize: "0.85rem", transition: "all 0.2s" }}
                      onClick={() => setBookingSource("credits")}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><i className="fa fa-coins" /> Pay with Credits</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="form-label fw-semibold">Add a note (optional)</label>
              <textarea className="form-control rounded-4" rows="3" value={note} onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. I need help with React hooks and API integration."
                style={{ border: "1px solid #eef2f7", padding: "12px 16px", resize: "vertical" }} />
            </div>

            {insufficientFunds ? (
              <div className="alert alert-warning rounded-4 d-flex align-items-center" style={{ gap: 8 }}>
                <i className="fa fa-exclamation-triangle" />
                <div>
                  Insufficient wallet balance. Required: <strong>₹{requiredAmount}</strong>.{" "}
                  <Link to="/learner/wallet" className="alert-link">Add funds to your SkillWallet</Link> to continue.
                </div>
              </div>
            ) : bookingSource === "credits" ? (
              <div className="alert alert-success rounded-4 d-flex align-items-center" style={{ gap: 8 }}>
                <i className="fa fa-coins" />
                <div>
                  Paying with credits. Your balance: <strong>{walletData?.skillCredits || 0} credits</strong>
                  {session.creditCost > 0 && <> &middot; Cost: <strong>{session.creditCost} credits</strong></>}
                </div>
              </div>
            ) : (
              <div className="alert alert-info rounded-4">
                {session.price ? "Payment will be deducted from your SkillWallet balance." : "This is a free session. No payment required."}
              </div>
            )}
            <LoadingButton loading={submitting} className="btn btn-primary rounded-pill px-4" disabled={submitting || success}>
              {bookingSource === "credits" ? `Book with Credits` : session.price ? `Pay ₹${session.price} & Book` : "Confirm Free Booking"}
            </LoadingButton>
          </form>
        </div>
        <div className="col-lg-5">
          <div className="learner-card p-4">
            <h5 className="fw-bold">Booking Summary</h5>
            <img src={session.thumbnail} alt={session.title} className="w-100 rounded-4 my-3" style={{ height: 190, objectFit: "cover" }} />
            <h6 className="fw-bold">{session.title}</h6>
            <p className="text-muted small">                      <UserLink user={session.mentorId} name={session.mentorId?.name || "SkillSwap Mentor"} /></p>
            <div className="list-group list-group-flush">
              <div className="list-group-item px-0 d-flex justify-content-between"><span>Date</span><strong>{formatDate(session.date)}</strong></div>
              <div className="list-group-item px-0 d-flex justify-content-between"><span>Time</span><strong>{session.time || "Flexible"}</strong></div>
              <div className="list-group-item px-0 d-flex justify-content-between"><span>Duration</span><strong>{session.duration || 60} min</strong></div>
              <div className="list-group-item px-0 d-flex justify-content-between"><span>Type</span><strong>{session.sessionType || "online"}</strong></div>
              <div className="list-group-item px-0 d-flex justify-content-between"><span>Price</span><strong>{session.price ? `₹${session.price}` : "Free"}</strong></div>
              {session.bookingTypes?.includes("credits") && (
                <div className="list-group-item px-0 d-flex justify-content-between"><span>Credit Cost</span><strong>{session.creditCost || "—"} credits</strong></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookSession;
