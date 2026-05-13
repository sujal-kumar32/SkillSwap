import React from "react";

function Footer() {
  return (
    <>
      {/* Footer Start */}
      <div
        className="container-fluid position-relative overlay-top bg-dark text-white-50 py-5"
        style={{ marginTop: 90 }}
      >
        <div className="container mt-5 pt-5">
          <div className="row">
            <div className="col-md-6 mb-5">
              <a href="index.html" className="navbar-brand">
                <h1 className="mt-n2  text-white">
                  <i className="fa fa-book-reader mr-3" />
                  SkillSwap
                </h1>
              </a>
              <p className="m-0">
                SkillSwap is a peer-to-peer mentorship platform where learners connect with skilled 
                mentors for live, interactive sessions. Learn anything, teach what you know, and 
                grow together with our community.
              </p>
            </div>
            <div className="col-md-6 mb-5">
              <h3 className="text-white mb-4">Newsletter</h3>
              <div className="w-100">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control border-light"
                    style={{ padding: 30 }}
                    placeholder="Your Email Address"
                  />
                  <div className="input-group-append">
                    <button className="btn btn-primary px-4">Subscribe</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-4 mb-5">
              <h3 className="text-white mb-4">Get In Touch</h3>
              <p>
                <i className="fa fa-map-marker-alt mr-2" />
                Bangalore, India
              </p>
              <p>
                <i className="fa fa-phone-alt mr-2" />
                +91 98765 43210
              </p>
              <p>
                <i className="fa fa-envelope mr-2" />
                hello@skillswap.com
              </p>
              <div className="d-flex justify-content-start mt-4">
                <a className="text-white mr-4" href="#">
                  <i className="fab fa-2x fa-twitter" />
                </a>
                <a className="text-white mr-4" href="#">
                  <i className="fab fa-2x fa-facebook-f" />
                </a>
                <a className="text-white mr-4" href="#">
                  <i className="fab fa-2x fa-linkedin-in" />
                </a>
                <a className="text-white" href="#">
                  <i className="fab fa-2x fa-instagram" />
                </a>
              </div>
            </div>
            <div className="col-md-4 mb-5">
              <h3 className="text-white mb-4">Popular Skills</h3>
              <div className="d-flex flex-column justify-content-start">
                <a className="text-white-50 mb-2" href="#">
                  <i className="fa fa-angle-right mr-2" />
                  Web Development
                </a>
                <a className="text-white-50 mb-2" href="#">
                  <i className="fa fa-angle-right mr-2" />
                  UI/UX Design
                </a>
                <a className="text-white-50 mb-2" href="#">
                  <i className="fa fa-angle-right mr-2" />
                  Music & Guitar
                </a>
                <a className="text-white-50 mb-2" href="#">
                  <i className="fa fa-angle-right mr-2" />
                  Public Speaking
                </a>
                <a className="text-white-50" href="#">
                  <i className="fa fa-angle-right mr-2" />
                  DSA & Interview Prep
                </a>
              </div>
            </div>
            <div className="col-md-4 mb-5">
              <h3 className="text-white mb-4">Quick Links</h3>
              <div className="d-flex flex-column justify-content-start">
                <a className="text-white-50 mb-2" href="#">
                  <i className="fa fa-angle-right mr-2" />
                  About Us
                </a>
                <a className="text-white-50 mb-2" href="#">
                  <i className="fa fa-angle-right mr-2" />
                  Become a Mentor
                </a>
                <a className="text-white-50 mb-2" href="#">
                  <i className="fa fa-angle-right mr-2" />
                  Privacy Policy
                </a>
                <a className="text-white-50 mb-2" href="#">
                  <i className="fa fa-angle-right mr-2" />
                  Terms & Conditions
                </a>
                <a className="text-white-50" href="#">
                  <i className="fa fa-angle-right mr-2" />
                  Help & Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="container-fluid bg-dark text-white-50 border-top py-4"
        style={{ borderColor: "rgba(256, 256, 256, .1) !important" }}
      >
        <div className="container">
          <div className="row">
            <div className="col-md-6 text-center text-md-left mb-3 mb-md-0">
              <p className="m-0">
                Copyright &copy;{" "}
                <a className="text-white" href="#">
                  SkillSwap
                </a>
                . All Rights Reserved.
              </p>
            </div>
            <div className="col-md-6 text-center text-md-right">
              <p className="m-0">
                Built with care for the learning community.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Footer End */}
      {/* Back to Top */}
      <a
        href="#"
        className="btn btn-lg btn-primary rounded-0 btn-lg-square back-to-top"
      >
        <i className="fa fa-angle-double-up" />
      </a>
    </>
  );
}

export default Footer;
