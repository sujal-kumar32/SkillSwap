import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { showToast } from "../../../utils/toastUtils";
import LoadingButton from "../../../../src/utils/LoadingButton";
import Apiservices from "../../../../Apiservices";
import { EmptyState, LoadingState, PageHeader } from "../../learner/LearnerUI";

const BookSession = () => {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
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
    if (!date || !timeSlot) {
      showToast.error("Please select date and time");
      return;
    }

    try {
      setSubmitting(true);

      const bookRes = await Apiservices.bookSession({ sessionId: session._id, date, timeSlot });
      const requestId = bookRes.data.data?._id;

      if (session.price && session.price > 0) {
        const ready = await loadRazorpayScript();
        if (!ready) {
          showToast.error("Payment system unavailable");
          setSubmitting(false);
          return;
        }

        const orderRes = await Apiservices.createOrder({ requestId });
        const { orderId, amount, currency, keyId } = orderRes.data.data;

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
            }
          },
          modal: {
            ondismiss: () => {
              showToast.warning("Payment cancelled");
              setSubmitting(false);
            },
          },
          prefill: {
            name: localStorage.getItem("userName") || "",
            email: "",
          },
          theme: { color: "#2878eb" },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (response) => {
          showToast.error(response.error.description || "Payment failed");
          setSubmitting(false);
        });
        rzp.open();
      } else {
        showToast.success("Booking request submitted");
        setSuccess(true);
      }
    } catch (error) {
      console.log(error);
      showToast.error(error.response?.data?.message || "Failed to book session");
      setSubmitting(false);
    }
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
      <PageHeader title="Book Session" subtitle="Choose a date and time, then confirm your booking." />
      <div className="row g-4">
        <div className="col-lg-7">
          <form className="learner-card p-4" onSubmit={submitBooking}>
            <h5 className="fw-bold mb-3">Select your slot</h5>
            <div className="mb-3">
              <label className="form-label fw-semibold">Date</label>
              <input type="date" className="form-control rounded-pill" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">Time</label>
              <select className="form-select rounded-pill" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
                <option value="">Choose time</option>
                {["09:00", "11:00", "15:00", "18:00", "20:00"].map((slot) => <option key={slot}>{slot}</option>)}
              </select>
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
