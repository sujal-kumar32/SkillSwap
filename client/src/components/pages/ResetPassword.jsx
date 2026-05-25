import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { showToast } from "../../utils/toastUtils";
import Apiservices from "../../../Apiservices";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      showToast.error("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      showToast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      showToast.error("Passwords do not match");
      return;
    }
    try {
      setLoading(true);
      const res = await Apiservices.resetPassword({ token, password });
      setLoading(false);
      if (res.data.success) {
        setDone(true);
        showToast.success(res.data.message);
      }
    } catch (err) {
      setLoading(false);
      showToast.error(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
      background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1a1a2e 100%)",
      position: "relative", overflow: "hidden"
    }}>
      <div style={{
        position: "absolute", top: "-100px", right: "-100px", width: "350px", height: "350px",
        borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.15), transparent 70%)",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute", bottom: "-60px", left: "-60px", width: "250px", height: "250px",
        borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.12), transparent 70%)",
        pointerEvents: "none"
      }} />
      <style>{`
        .reset-card {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(24px);
          border-radius: 32px;
          padding: 48px 40px;
          width: 100%;
          max-width: 440px;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 25px 60px rgba(0,0,0,0.4);
        }
        .reset-card input {
          background: rgba(255,255,255,0.07);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 14px 44px 14px 18px;
          font-size: 0.95rem;
          color: white;
          width: 100%;
          transition: all 0.25s ease;
        }
        .reset-card input::placeholder {
          color: rgba(255,255,255,0.35);
        }
        .reset-card input:focus {
          background: rgba(255,255,255,0.1);
          border-color: rgba(59,130,246,0.5);
          box-shadow: 0 0 0 4px rgba(59,130,246,0.1);
          outline: none;
        }
        .reset-card label {
          color: rgba(255,255,255,0.7);
          font-weight: 600;
          font-size: 0.85rem;
          letter-spacing: 0.3px;
          margin-bottom: 8px;
        }
        .reset-btn {
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
        .reset-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(37,99,235,0.35);
        }
        .reset-btn:disabled {
          opacity: 0.6;
        }
        .eye-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          color: rgba(255,255,255,0.3);
          background: none;
          border: none;
          padding: 4px;
          transition: color 0.2s;
          z-index: 5;
        }
        .eye-btn:hover {
          color: rgba(255,255,255,0.6);
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
        .input-wrap {
          position: relative;
        }
      `}</style>
      <div className="reset-card">
        {done ? (
          <div className="text-center">
            <div className="success-icon">
              <i className="fa fa-check" />
            </div>
            <h4 className="fw-bold text-white mb-2">Password Reset!</h4>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.9rem", lineHeight: 1.7, maxWidth: 300, margin: "0 auto 28px" }}>
              Your password has been updated successfully. You can now log in with your new password.
            </p>
            <Link to="/login" className="btn rounded-pill px-5 py-2 fw-semibold" style={{
              background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "white", border: "none",
              transition: "all 0.25s ease"
            }}
              onMouseEnter={(e) => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 24px rgba(37,99,235,0.3)" }}
              onMouseLeave={(e) => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "none" }}>
              Go to Login
            </Link>
          </div>
        ) : (
          <>
            <div className="icon-ring">
              <i className="fa fa-key" />
            </div>
            <div className="text-center mb-4">
              <h4 className="fw-bold text-white mb-2">Set New Password</h4>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                Must be at least 6 characters.
              </p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label>New Password</label>
                <div className="input-wrap">
                  <input type={showPassword ? "text" : "password"} placeholder="New password" value={password}
                    onChange={(e) => setPassword(e.target.value)} />
                  <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                    <i className={`fa${showPassword ? "s fa-eye-slash" : "r fa-eye"}`} />
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <label>Confirm Password</label>
                <div className="input-wrap">
                  <input type={showConfirm ? "text" : "password"} placeholder="Confirm password" value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)} />
                  <button type="button" className="eye-btn" onClick={() => setShowConfirm(!showConfirm)}>
                    <i className={`fa${showConfirm ? "s fa-eye-slash" : "r fa-eye"}`} />
                  </button>
                </div>
              </div>
              <button type="submit" className="reset-btn" disabled={loading}>
                {loading ? (
                  <span><span className="spinner-border spinner-border-sm me-2" role="status" />Resetting...</span>
                ) : (
                  <span><i className="fa fa-check-circle me-2" />Reset Password</span>
                )}
              </button>
              <div className="text-center mt-4">
                <Link to="/login" style={{ color: "rgba(255,255,255,0.45)", fontWeight: 500, fontSize: "0.9rem", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e) => e.target.style.color = "rgba(255,255,255,0.7)"}
                  onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.45)"}>
                  <i className="fa fa-arrow-left me-2" />Back to Login
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;