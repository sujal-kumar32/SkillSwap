import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { showToast } from "../../utils/toastUtils";
import Apiservices from "../../../Apiservices";

function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    Apiservices.verifyEmail(token)
      .then((res) => {
        setStatus("success");
        setMessage(res.data.message || "Email verified successfully!");
        showToast.success("Email verified!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed. The link may have expired.");
        showToast.error("Verification failed");
      });
  }, [token]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa" }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: "48px 40px", maxWidth: 440, width: "90%", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
        {status === "verifying" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>&#x23F3;</div>
            <h3 style={{ margin: "0 0 8px", color: "#333" }}>Verifying your email...</h3>
          </>
        )}

        {status === "success" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>&#x2705;</div>
            <h3 style={{ margin: "0 0 8px", color: "#059669" }}>Email Verified!</h3>
            <p style={{ color: "#6b7280", marginBottom: 24 }}>{message}</p>
            <Link to="/login" style={{ background: "#2563eb", color: "#fff", padding: "12px 32px", borderRadius: 50, textDecoration: "none", display: "inline-block", fontWeight: 600 }}>
              Go to Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>&#x274C;</div>
            <h3 style={{ margin: "0 0 8px", color: "#dc2626" }}>Verification Failed</h3>
            <p style={{ color: "#6b7280", marginBottom: 24 }}>{message}</p>
            <Link to="/login" style={{ background: "#6b7280", color: "#fff", padding: "12px 32px", borderRadius: 50, textDecoration: "none", display: "inline-block", fontWeight: 600 }}>
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;