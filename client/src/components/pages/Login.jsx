import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { showToast } from "../../utils/toastUtils";
import illustration from "../../assets/images/image.png";
import Apiservices from "../../../Apiservices";
import { useAuth } from "../../App";

function Login() {
  const navigate = useNavigate();
  const { user, setUser, loading: authLoading } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      if (user.roles?.includes("admin")) {
        navigate("/admin");
      } else {
        navigate("/workspace");
      }
    }
  }, [user, authLoading, navigate]);

  // LOGIN USING AXIOS
  const loginAndRedirect = async (loginEmail, loginPassword) => {
    try {
      const response = await Apiservices.login({
        email: loginEmail,
        password: loginPassword,
      });

      const data = response.data;

      const profileRes = await Apiservices.getProfile();
      if (profileRes.data?.success) {
        setUser(profileRes.data.data);
      }

      return data;
    } catch (error) {
      const msg = error.response?.data?.message || "Login failed";
      if (msg.toLowerCase().includes("verify your email")) {
        setVerificationSent(true);
      } else {
        showToast.error(msg);
      }
      return null;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      showToast.error("Email and password are required.");
      return;
    }

    // SIGNUP FLOW
    if (isSignup) {
      if (!name || !confirmPassword) {
        showToast.error("Please fill all signup fields.");
        return;
      }

      if (!/^\S+@\S+\.\S+$/.test(email)) {
        showToast.error("Please provide a valid email address.");
        return;
      }

      if (password !== confirmPassword) {
        showToast.error("Passwords do not match.");
        return;
      }

      try {
        setSubmitting(true);

        const response = await Apiservices.register({
          name,
          email,
          password,
        });

        setSubmitting(false);

        if (!response.data.success) {
          showToast.error(response.data.message || "Signup failed");
          return;
        }

        showToast.success("Verification email sent! Please check your inbox.");
        setIsSignup(false);
        setVerificationSent(true);
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } catch (error) {
        setSubmitting(false);
        showToast.error(error.response?.data?.message || "Signup error");
      }

      return;
    }

    // LOGIN FLOW
    try {
      setSubmitting(true);

      const userData = await loginAndRedirect(email, password);

      setSubmitting(false);

      if (!userData) return;

      showToast.success("Login successful");

      // ROLE CHECK
      if (userData.data?.roles?.includes("admin")) {
        navigate("/admin");
      } else {
        navigate("/workspace");
      }
    } catch (error) {
      setLoading(false);
      showToast.error(error.message || "Login error");
    }
  };

  return (
    <>
      <>
        {" "}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />{" "}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />{" "}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />{" "}
        <style>{`
html, body {
height: 100%;
margin: 0;
padding: 0;
}


      body {
        font-family: 'Inter', sans-serif;
        background: white;
        background-attachment: fixed;
        min-height: 100vh;
        color: #333;
        overflow-x: hidden;
      }

      .navbar-brand {
        font-weight: 700;
        color: #000 !important;
        font-size: 1.5rem;
      }

      .nav-link {
        color: #000 !important;
        font-weight: 700;
      }

      .btn-signup {
        background: rgba(255, 255, 255, 0.9);
        color: #2a5298;
        font-weight: 600;
        border-radius: 20px;
        padding: 8px 20px;
      }

      .headline {
        font-size: 3.5rem;
        font-weight: 700;
        color: #333;
      }

      .subtext {
        font-size: 1.2rem;
        color: rgba(0, 0, 0, 0.8);
      }

      .feature-item {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 12px;
        padding: 10px 15px;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin-right: 15px;
        margin-bottom: 15px;
      }

      .glass-card {
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(20px);
        border-radius: 24px;
        padding: 3rem;
        color: #333;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.2);
        transition: all 0.3s ease;
      }

      .glass-card:hover {
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.08);
        transform: translateY(-2px);
      }

      .form-control {
        background: #f8f9fa;
        border: 2px solid #e9ecef;
        border-radius: 12px;
        padding: 12px 16px;
        font-size: 1rem;
        transition: all 0.3s ease;
      }

      .form-control:focus {
        background: #ffffff;
        border-color: #4285F4;
        box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
        outline: none;
      }

      .form-label {
        font-weight: 600;
        color: #495057;
        margin-bottom: 8px;
      }

      .btn-primary-custom {
        background: linear-gradient(135deg, #4285F4 0%, #34A853 100%);
        border: none;
        border-radius: 12px;
        width: 100%;
        padding: 14px;
        font-weight: 600;
        font-size: 1.1rem;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
      }

      .btn-primary-custom:hover {
        background: linear-gradient(135deg, #3367D6 0%, #2E7D32 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(66, 133, 244, 0.4);
      }

      .btn-primary-custom:active {
        transform: translateY(0);
      }
    `}</style>
        <nav className="navbar navbar-expand-lg pt-4 px-4">
          <div className="container-fluid"></div>
        </nav>
        <div className="container-fluid bg-image h-100 px-4 py-5">
          <div className="row align-items-center min-vh-75">
            {/* LEFT */}
            <div className="col-lg-7">
              <h1 className="headline">
                Exchange Skills.
                <br />
                Learn Anything.
              </h1>
              <p className="subtext">Join thousands of learners worldwide.</p>

              <img
                src={illustration}
                className="img-fluid"
                style={{ maxWidth: "90%" }}
              />

              <div className="d-flex flex-wrap mt-4">
                <div className="feature-item">
                  <i className="fas fa-graduation-cap" /> Learn new skills
                </div>
                <div className="feature-item">
                  <i className="fas fa-microphone" /> Teach what you know
                </div>
                <div className="feature-item">
                  <i className="fas fa-star" /> Build reputation
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="col-lg-5 px-lg-4">
              <div className="glass-card">
                <div className="text-center mb-4">
                  <h3 className="fw-bold mb-1" style={{ color: "#333", fontSize: "1.8rem" }}>
                    {isSignup ? "Create Account" : "Welcome back"}
                  </h3>
                  <p className="text-muted small" style={{ fontSize: "1rem" }}>
                    {isSignup ? "Sign up to get started" : "Sign in to continue"}
                  </p>
                </div>

                {verificationSent && (
                  <div style={{ background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 12, padding: "12px 16px", marginBottom: 20, fontSize: 14, color: "#856404" }}>
                    <strong>Verify your email!</strong> We sent a verification link to your email. Please check your inbox and click the link to activate your account.
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {isSignup && (
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-muted">Full Name</label>
                      <input type="text" className="form-control" placeholder="Full name" value={name}
                        onChange={(e) => setName(e.target.value)} />
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Email</label>
                    <input type="email" className="form-control" placeholder="example@email.com" value={email}
                      onChange={(e) => setEmail(e.target.value)} />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Password</label>
                    <div style={{ position: "relative" }}>
                      <input type={showPassword ? "text" : "password"} className="form-control"
                        placeholder="Enter password" value={password}
                        onChange={(e) => setPassword(e.target.value)} style={{ paddingRight: "40px" }} />
                      <span onClick={() => setShowPassword(!showPassword)}
                        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#6c757d", zIndex: 5 }}>
                        <i className={`fa${showPassword ? "s fa-eye-slash" : "r fa-eye"}`} />
                      </span>
                    </div>
                  </div>

                  {!isSignup && (
                    <div className="text-end mb-3">
                      <Link to="/forgot-password" className="small" style={{ color: "#4285F4", fontWeight: 500, textDecoration: "none" }}>
                        Forgot Password?
                      </Link>
                    </div>
                  )}

                  {isSignup && (
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-muted">Confirm Password</label>
                      <div style={{ position: "relative" }}>
                        <input type={showConfirm ? "text" : "password"} className="form-control"
                          placeholder="Confirm password" value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)} style={{ paddingRight: "40px" }} />
                        <span onClick={() => setShowConfirm(!showConfirm)}
                          style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#6c757d", zIndex: 5 }}>
                          <i className={`fa${showConfirm ? "s fa-eye-slash" : "r fa-eye"}`} />
                        </span>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary btn-primary-custom text-white" disabled={submitting}>
                    {submitting ? "Please wait..." : isSignup ? "Sign Up" : "Sign In"}
                  </button>

                  <div className="text-center mt-4">
                    <p className="small text-muted">
                      {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
                      <span style={{ cursor: "pointer", color: "#4285F4", fontWeight: "600", textDecoration: "none", transition: "all 0.3s ease" }}
                        onMouseEnter={(e) => (e.target.style.color = "#3367D6")}
                        onMouseLeave={(e) => (e.target.style.color = "#4285F4")}
                        onClick={() => { setVerificationSent(false); setIsSignup(!isSignup); }}>
                        {isSignup ? "Login" : "Sign up"}
                      </span>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </>
    </>
  );
}

export default Login;
