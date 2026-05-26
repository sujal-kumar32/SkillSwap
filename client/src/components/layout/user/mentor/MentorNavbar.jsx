import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { showToast } from "../../../../utils/toastUtils";

function MentorNavbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const updateAuth = () => setIsLoggedIn(!!localStorage.getItem("token"));

    updateAuth();
    window.addEventListener("storage", updateAuth);
    window.addEventListener("authChange", updateAuth);

    return () => {
      window.removeEventListener("storage", updateAuth);
      window.removeEventListener("authChange", updateAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    window.dispatchEvent(new Event("authChange"));
    showToast.success("Logged out successfully");
    navigate("/", { replace: true });
  };

  return (
    <>
      {/* Topbar Start */}
      <div className="container-fluid bg-dark">
        <div className="row py-2 px-lg-5">
          <div className="col-lg-6 text-center text-lg-left mb-2 mb-lg-0">
            <div className="d-inline-flex align-items-center text-white">
              <small>
                <i className="fa fa-phone-alt mr-2" />
                +012 345 6789
              </small>
              <small className="px-3">|</small>
              <small>
                <i className="fa fa-envelope mr-2" />
                info@example.com
              </small>
            </div>
          </div>
          <div className="col-lg-6 text-center text-lg-right">
            <div className="d-inline-flex align-items-center">
              <a className="text-white px-2" href="">
                <i className="fab fa-facebook-f" />
              </a>
              <a className="text-white px-2" href="">
                <i className="fab fa-twitter" />
              </a>
              <a className="text-white px-2" href="">
                <i className="fab fa-linkedin-in" />
              </a>
              <a className="text-white px-2" href="">
                <i className="fab fa-instagram" />
              </a>
              <a className="text-white pl-2" href="">
                <i className="fab fa-youtube" />
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* Topbar End */}
      {/* Navbar Start */}
      <div className="container-fluid p-0">
        <nav className="navbar navbar-expand-lg bg-white navbar-light py-3 py-lg-0 px-lg-5">
          <Link to="/" className="navbar-brand ml-lg-3">
            <h1 className="m-0  text-primary">
              <i className="fa fa-book-reader mr-3" />
              SkillSwap
            </h1>
          </Link>
          <button
            type="button"
            className="navbar-toggler"
            data-toggle="collapse"
            data-target="#navbarCollapse"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div
            className="collapse navbar-collapse justify-content-between px-lg-3"
            id="navbarCollapse"
          >
            <div className="navbar-nav mx-auto py-0">
              <NavLink
                to="/mentor"
                className={({ isActive }) => "nav-item nav-link" + (isActive ? " active" : "")}
              >
                MentorDashboard
              </NavLink>

              {isLoggedIn && (
                <NavLink
                  to="/mentor/create-session"
                  className={({ isActive }) => "nav-item nav-link" + (isActive ? " active" : "")}
                >
                  CreateSession
                </NavLink>
              )}
              {isLoggedIn && (
                <NavLink
                  to="/mentor/my-sessions"
                  className={({ isActive }) => "nav-item nav-link" + (isActive ? " active" : "")}
                >
                  MySessions
                </NavLink>
              )}
              {isLoggedIn && (
                <NavLink
                  to="/mentor/bookings"
                  className={({ isActive }) => "nav-item nav-link" + (isActive ? " active" : "")}
                >
                  Bookings
                </NavLink>
              )}
              {isLoggedIn && (
                <NavLink
                  to="/mentor/learners"
                  className={({ isActive }) => "nav-item nav-link" + (isActive ? " active" : "")}
                >
                  Learners
                </NavLink>
              )}
            </div>
            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="nav-item nav-link btn btn-primary py-2 px-4 d-none d-lg-block"
              >
                Logout
              </button>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) => "nav-item nav-link btn btn-primary py-2 px-4 d-none d-lg-block" + (isActive ? " active" : "")}
              >
                Get Started
              </NavLink>
            )}
          </div>
        </nav>
      </div>
      {/* Navbar End */}
    </>
  );
}

export default MentorNavbar;
