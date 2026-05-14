import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { showToast } from "../../../utils/toastUtils";
import LoadingButton from "../../../../src/utils/LoadingButton";
import Apiservices from "../../../../Apiservices";
import { EmptyState, LoadingState, PageHeader } from "../../learner/LearnerUI";

const BookSession = () => {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSession = async () => {
      try {
        setError("");
        const response = await Apiservices.fetchSessionDetails(id);
        setSession(response.data.data);
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

  const loadRazorpayScript = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const submitBooking = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);

      const payload = { sessionId: session._id };
      if (note.trim()) payload.note = note.trim();

      const bookRes = await Apiservices.bookSession(payload);
      const requestId = bookRes.data.data?._id;

      const cancelRequest = async () => {
        try { await Apiservices.updateRequest(requestId, "cancelled"); } catch {}
      };

      if (session.price && session.price > 0) {
        const ready = await loadRazorpayScript();
        if (!ready) {
          showToast.error("Payment system unavailable");
          await cancelRequest();
          setSubmitting(false);
          return;
        }

        let orderRes;
        try {
          orderRes = await Apiservices.createOrder({ requestId });
        } catch {
          showToast.error("Failed to initiate payment. Booking cancelled.");
          await cancelRequest();
          setSubmitting(false);
          return;
        }
        const { orderId, amount, currency, keyId } = orderRes.data.data;

        const cancelRequest = async () => {
          try { await Apiservices.updateRequest(requestId, "cancelled"); } catch {}
        };

        const options = {
          key: keyId,
          amount,
          currency,
          name: "SkillSwap",
          description: session.title,
          image: session.thumbnail || undefined,
          order_id: orderId,
          handler: async (response) => {
            try {
              await Apiservices.verifyPayment({
                requestId,
                orderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              showToast.success("Payment successful! Booking confirmed.");
              setSuccess(true);
            } catch {
              showToast.error("Payment verification failed. Contact support.");
              await cancelRequest();
              setSubmitting(false);
            }
          },
          modal: {
            ondismiss: async () => {
              await cancelRequest();
              showToast.warning("Booking cancelled — payment was not completed.");
              setSubmitting(false);
            },
          },
          prefill: {
            name: localStorage.getItem("userName") || "",
            email: localStorage.getItem("userEmail") || "",
            contact: localStorage.getItem("userPhone") || "",
          },
          notes: {
            requestId: requestId,
            sessionTitle: session.title,
          },
          theme: { color: "#2878eb" },
          config: {
            display: {
              sequence: ["block.banks", "block.cards", "block.upi", "block.wallet"],
              preferences: { show_default_blocks: true },
            },
            payments: { method: { upi: true, card: true, netbanking: true, wallet: true } },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", async (response) => {
          const code = response.error?.code || "";
          const desc = response.error?.description || "Payment failed";
          await cancelRequest();
          if (code === "BAD_REQUEST_ERROR" && desc.includes("UPI")) {
            showToast.error("UPI is unavailable in test mode. Try using a test card or netbanking.");
          } else if (code === "CANCELLED") {
            showToast.warning("Payment cancelled");
          } else {
            showToast.error(desc);
          }
          setSubmitting(false);
        });
        rzp.open();
      } else {
        showToast.success("Booking request submitted");
        setSuccess(true);
      }
    } catch (error) {
      showToast.error(error.response?.data?.message || "Failed to book session");
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
        <h3 className="fw-bold">Booking {session.price ? "& Payment" : "Request"} Successful</h3>
        <p className="text-muted mb-4">
          {session.price
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

            <div className="mb-4">
              <label className="form-label fw-semibold">Add a note (optional)</label>
              <textarea className="form-control rounded-4" rows="3" value={note} onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. I need help with React hooks and API integration."
                style={{ border: "1px solid #eef2f7", padding: "12px 16px", resize: "vertical" }} />
            </div>

            <div className="alert alert-info rounded-4">
              {session.price ? "Paid session: you will be redirected to Razorpay for secure payment." : "This is a free session. No payment required."}
            </div>
            <LoadingButton loading={submitting} className="btn btn-primary rounded-pill px-4" disabled={submitting}>
              {session.price ? `Pay ₹${session.price} & Book` : "Confirm Free Booking"}
            </LoadingButton>
          </form>
        </div>
        <div className="col-lg-5">
          <div className="learner-card p-4">
            <h5 className="fw-bold">Booking Summary</h5>
            <img src={session.thumbnail} alt={session.title} className="w-100 rounded-4 my-3" style={{ height: 190, objectFit: "cover" }} />
            <h6 className="fw-bold">{session.title}</h6>
            <p className="text-muted small">{session.mentorId?.name || "SkillSwap Mentor"}</p>
            <div className="list-group list-group-flush">
              <div className="list-group-item px-0 d-flex justify-content-between"><span>Date</span><strong>{formatDate(session.date)}</strong></div>
              <div className="list-group-item px-0 d-flex justify-content-between"><span>Time</span><strong>{session.time || "Flexible"}</strong></div>
              <div className="list-group-item px-0 d-flex justify-content-between"><span>Duration</span><strong>{session.duration || 60} min</strong></div>
              <div className="list-group-item px-0 d-flex justify-content-between"><span>Type</span><strong>{session.sessionType || "online"}</strong></div>
              <div className="list-group-item px-0 d-flex justify-content-between"><span>Total</span><strong>{session.price ? `₹${session.price}` : "Free"}</strong></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookSession;
