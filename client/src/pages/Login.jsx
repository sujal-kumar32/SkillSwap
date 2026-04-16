import { useState } from "react";
import illustration from "../assets/images/image.png";

function Login() {
const [isSignup, setIsSignup] = useState(false);

return (
<>
<> <link
       href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
       rel="stylesheet"
     /> <link
       rel="stylesheet"
       href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
     /> <link
       href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap"
       rel="stylesheet"
     /> <style>{`
html, body {
height: 100%;
margin: 0;
padding: 0;
}


      body {
        font-family: 'Inter', sans-serif;
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #9b59b6 100%);
        background-attachment: fixed;
        min-height: 100vh;
        color: white;
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
      }

      .subtext {
        font-size: 1.2rem;
        color: rgba(255, 255, 255, 0.8);
      }

      .feature-item {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 10px 15px;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin-right: 15px;
        margin-bottom: 15px;
      }

      .glass-card {
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(15px);
        border-radius: 24px;
        padding: 2.5rem;
        color: #333;
      }

      .form-control {
        background: #f3f4f6;
        border-radius: 8px;
      }

      .btn-primary-custom {
        background: #4285F4;
        border-radius: 8px;
        width: 100%;
      }
    `}</style>

    <nav className="navbar navbar-expand-lg pt-4 px-4">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          <i className="fas fa-layer-group me-2" />
          SkillSwap
        </a>
      </div>
    </nav>

    <div className="container-fluid h-100 px-4 py-5">
      <div className="row align-items-center min-vh-75">

        {/* LEFT */}
        <div className="col-lg-7">
          <h1 className="headline">
            Exchange Skills.<br />Learn Anything.
          </h1>
          <p className="subtext">
            Join thousands of learners worldwide.
          </p>

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
              <h3 className="fw-bold mb-1">
                {isSignup ? "Create Account" : "Welcome back"}
              </h3>
              <p className="text-muted small">
                {isSignup
                  ? "Sign up to get started"
                  : "Sign in to continue"}
              </p>
            </div>

            <form>

              {/* Signup only */}
              {isSignup && (
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="John Doe"
                  />
                </div>
              )}

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">
                  Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="example@email.com"
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">
                  Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                />
              </div>

              {/* Signup only */}
              {isSignup && (
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                  />
                </div>
              )}

              <button
                type="button"
                className="btn btn-primary btn-primary-custom text-white"
              >
                {isSignup ? "Sign Up" : "Sign In"}
              </button>

              <div className="text-center mt-4">
                <p className="small text-muted">
                  {isSignup
                    ? "Already have an account?"
                    : "Don't have an account?"}{" "}
                  <span
                    style={{ cursor: "pointer", color: "#4285F4" }}
                    onClick={() => setIsSignup(!isSignup)}
                  >
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
