import React from "react";
import { Link, NavLink } from "react-router-dom";

function Navbar() {
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
                to="/"
                className="nav-item nav-link"
                activeClassName="active"
              >
                Home
              </NavLink>
              <NavLink
                to="/about"
                className="nav-item nav-link"
                activeClassName="active"
              >
                About
              </NavLink>
              <NavLink
                to="/courses"
                className="nav-item nav-link"
                activeClassName="active"
              >
                Courses
              </NavLink>
              <div className="nav-item dropdown">
                <a
                  href="#"
                  className="nav-link dropdown-toggle"
                  data-toggle="dropdown"
                >
                  Pages
                </a>
                <div className="dropdown-menu m-0">
                  <Link to="/detail" className="dropdown-item">
                    Course Detail
                  </Link>
                  <Link to="/features" className="dropdown-item">
                    Our Features
                  </Link>
                  <Link to="/team" className="dropdown-item">
                    Instructors
                  </Link>
                  <Link to="/testimonial" className="dropdown-item">
                    Testimonial
                  </Link>
                </div>
              </div>
              <NavLink
                to="/contact"
                className="nav-item nav-link"
                activeClassName="active"
              >
                Contact
              </NavLink>
            </div>
            <a href="" className="btn btn-primary py-2 px-4 d-none d-lg-block">
              Join Us
            </a>
          </div>
        </nav>
      </div>
      {/* Navbar End */}
    </>
  );
}

export default Navbar;
