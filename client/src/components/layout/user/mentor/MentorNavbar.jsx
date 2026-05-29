import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { showToast } from "../../../../utils/toastUtils";

function MentorNavbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* Topbar Start */}
      <div className="container-fluid bg-dark d-none d-lg-block">
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
              <a className="text-white px-2" href="/">
                <i className="fab fa-facebook-f" />
              </a>
              <a className="text-white px-2" href="/">
                <i className="fab fa-twitter" />
              </a>
              <a className="text-white px-2" href="/">
                <i className="fab fa-linkedin-in" />
              </a>
              <a className="text-white px-2" href="/">
                <i className="fab fa-instagram" />
              </a>
              <a className="text-white pl-2" href="/">
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
          <Link to="/" className="navbar-brand ml-lg-3" onClick={closeMenu}>
            <h1 className="m-0  text-primary">
              <i className="fa fa-book-reader mr-3" />
              SkillSwap
            </h1>
          </Link>
          <button
            type="button"
            className="navbar-toggler"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div
            className={`collapse navbar-collapse justify-content-between px-lg-3${menuOpen ? " show" : ""}`}
          >
            <div className="navbar-nav mx-auto py-0">
              <NavLink
                to="/mentor"
                end
                className={({ isActive }) => "nav-item nav-link" + (isActive ? " active" : "")}
                onClick={closeMenu}
              >
                Dashboard
              </NavLink>

              {isLoggedIn && (
                <NavLink
                  to="/mentor/create-session"
                  className={({ isActive }) => "nav-item nav-link" + (isActive ? " active" : "")}
                  onClick={closeMenu}
                >
                  Create Session
                </NavLink>
              )}
              {isLoggedIn && (
                <NavLink
                  to="/mentor/my-sessions"
                  className={({ isActive }) => "nav-item nav-link" + (isActive ? " active" : "")}
                  onClick={closeMenu}
                >
                  My Sessions
                </NavLink>
              )}
              {isLoggedIn && (
                <NavLink
                  to="/mentor/bookings"
                  className={({ isActive }) => "nav-item nav-link" + (isActive ? " active" : "")}
                  onClick={closeMenu}
                >
                  Bookings
                </NavLink>
              )}
              {isLoggedIn && (
                <NavLink
                  to="/mentor/learners"
                  className={({ isActive }) => "nav-item nav-link" + (isActive ? " active" : "")}
                  onClick={closeMenu}
                >
                  Learners
                </NavLink>
              )}
            </div>
            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => { handleLogout(); closeMenu(); }}
                className="nav-item nav-link btn btn-primary py-2 px-4 d-none d-lg-inline-block"
              >
                Logout
              </button>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) => "nav-item nav-link btn btn-primary py-2 px-4 d-none d-lg-inline-block" + (isActive ? " active" : "")}
                onClick={closeMenu}
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
