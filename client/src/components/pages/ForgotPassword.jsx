import { useState } from "react";
import { Link } from "react-router-dom";
import { showToast } from "../../utils/toastUtils";
import Apiservices from "../../../Apiservices";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast.error("Please enter your email");
      return;
    }
    try {
      setLoading(true);
      const res = await Apiservices.forgotPassword({ email });
      setLoading(false);
      if (res.data.success) {
        setSent(true);
        showToast.success(res.data.message);
      }
    } catch (err) {
      setLoading(false);
      showToast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
      background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1a1a2e 100%)",
      position: "relative", overflow: "hidden"
    }}>
      <div style={{
        position: "absolute", top: "-120px", right: "-120px", width: "400px", height: "400px",
        borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.15), transparent 70%)",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute", bottom: "-80px", left: "-80px", width: "300px", height: "300px",
        borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.12), transparent 70%)",
        pointerEvents: "none"
      }} />
      <style>{`
        .forgot-card {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(24px);
          border-radius: 32px;
          padding: 48px 40px;
          width: 100%;
          max-width: 440px;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 25px 60px rgba(0,0,0,0.4);
        }
        .forgot-card input {
          background: rgba(255,255,255,0.07);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 14px 18px;
          font-size: 0.95rem;
          color: white;
          width: 100%;
          transition: all 0.25s ease;
        }
        .forgot-card input::placeholder {
          color: rgba(255,255,255,0.35);
        }
        .forgot-card input:focus {
          background: rgba(255,255,255,0.1);
          border-color: rgba(59,130,246,0.5);
          box-shadow: 0 0 0 4px rgba(59,130,246,0.1);
          outline: none;
        }
        .forgot-card label {
          color: rgba(255,255,255,0.7);
          font-weight: 600;
          font-size: 0.85rem;
          letter-spacing: 0.3px;
          margin-bottom: 12px;
          display: block;
        }
        .forgot-btn {
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          border: none;
          border-radius: 14px;
          padding: 14px;
          font-weight: 600;
          font-size: 1rem;
          width: 100%;
          color: white;
          transition: all 0.25s ease;
          box-shadow: 0 8px 24px rgba(37,99,235,0.25);
        }
        .forgot-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(37,99,235,0.35);
        }
        .forgot-btn:disabled {
          opacity: 0.6;
        }
        .icon-ring {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(37,99,235,0.2), rgba(124,58,237,0.2));
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          border: 1.5px solid rgba(255,255,255,0.08);
        }
        .icon-ring i {
          font-size: 1.5rem;
          background: linear-gradient(135deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .success-icon {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(5,150,105,0.2), rgba(16,185,129,0.2));
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          border: 1.5px solid rgba(255,255,255,0.08);
        }
        .success-icon i {
          font-size: 1.8rem;
          background: linear-gradient(135deg, #34d399, #10b981);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
      <div className="forgot-card">
        {sent ? (
          <div className="text-center">
            <div className="success-icon">
              <i className="fa fa-check" />
            </div>
            <h4 className="fw-bold text-white mb-2">Check Your Inbox</h4>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.9rem", lineHeight: 1.7, maxWidth: 320, margin: "0 auto 28px" }}>
              We've sent a password reset link to <strong style={{ color: "rgba(255,255,255,0.8)" }}>{email}</strong>. It expires in 1 hour.
            </p>
            <Link to="/login" className="btn rounded-pill px-5 py-2 fw-semibold" style={{
              background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.12)",
              transition: "all 0.25s ease"
            }}
              onMouseEnter={(e) => { e.target.style.background = "rgba(255,255,255,0.16)"; e.target.style.transform = "translateY(-1px)" }}
              onMouseLeave={(e) => { e.target.style.background = "rgba(255,255,255,0.1)"; e.target.style.transform = "translateY(0)" }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <div className="icon-ring">
              <i className="fa fa-lock" />
            </div>
            <div className="text-center mb-4">
              <h4 className="fw-bold text-white mb-2">Forgot Password?</h4>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", lineHeight: 1.6, maxWidth: 300, margin: "0 auto" }}>
                No worries. Enter your email and we'll send you a reset link.
              </p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="text-center w-100">Email Address</label>
                <input type="email" placeholder="you@example.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} />
              </div>
              <button type="submit" className="forgot-btn" disabled={loading}>
                {loading ? (
                  <span><span className="spinner-border spinner-border-sm me-2" role="status" />Sending...</span>
                ) : (
                  <span><i className="fa fa-paper-plane" style={{ marginRight: 10 }} />Send Reset Link</span>
                )}
              </button>
              <div className="text-center mt-4">
                <Link to="/login" style={{ color: "rgba(255,255,255,0.45)", fontWeight: 500, fontSize: "0.9rem", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e) => e.target.style.color = "rgba(255,255,255,0.7)"}
                  onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.45)"}>
                  <i className="fa fa-arrow-left" style={{ marginRight: 10 }} />Back to Login
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;