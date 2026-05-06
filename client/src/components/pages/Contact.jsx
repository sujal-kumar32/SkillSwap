import React from "react";

function Contact() {
  return (
    <>
      <>
        {/* Header Start */}
        <div
          className="jumbotron jumbotron-fluid page-header position-relative overlay-bottom"
          style={{ marginBottom: 90 }}
        >
          <div className="container text-center py-5">
            <h1 className="text-white display-1">Contact</h1>
            <div className="d-inline-flex text-white mb-5">
              <p className="m-0 text-uppercase">
                <a className="text-white" href="">
                  Home
                </a>
              </p>
              <i className="fa fa-angle-double-right pt-1 px-3" />
              <p className="m-0 text-uppercase">Contact</p>
            </div>
            <div
              className="mx-auto mb-5"
              style={{ width: "100%", maxWidth: 600 }}
            >
              <div className="input-group">
                <div className="input-group-prepend">
                  <button
                    className="btn btn-outline-light bg-white text-body px-4 dropdown-toggle"
                    type="button"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    Courses
                  </button>
                  <div className="dropdown-menu">
                    <a className="dropdown-item" href="#">
                      Courses 1
                    </a>
                    <a className="dropdown-item" href="#">
                      Courses 2
                    </a>
                    <a className="dropdown-item" href="#">
                      Courses 3
                    </a>
                  </div>
                </div>
                <input
                  type="text"
                  className="form-control border-light"
                  style={{ padding: "30px 25px" }}
                  placeholder="Keyword"
                />
                <div className="input-group-append">
                  <button className="btn btn-secondary px-4 px-lg-5">
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Header End */}
        {/* Contact Start */}
        <div className="container-fluid py-5">
          <div className="container py-5">
            <div className="row align-items-center">
              <div className="col-lg-5 mb-5 mb-lg-0">
                <div
                  className="bg-light d-flex flex-column justify-content-center px-5"
                  style={{ height: 450 }}
                >
                  <div className="d-flex align-items-center mb-5">
                    <div className="btn-icon bg-primary mr-4">
                      <i className="fa fa-2x fa-map-marker-alt text-white" />
                    </div>
                    <div className="mt-n1">
                      <h4>Our Location</h4>
                      <p className="m-0">123 Street, New York, USA</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-5">
                    <div className="btn-icon bg-secondary mr-4">
                      <i className="fa fa-2x fa-phone-alt text-white" />
                    </div>
                    <div className="mt-n1">
                      <h4>Call Us</h4>
                      <p className="m-0">+012 345 6789</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="btn-icon bg-warning mr-4">
                      <i className="fa fa-2x fa-envelope text-white" />
                    </div>
                    <div className="mt-n1">
                      <h4>Email Us</h4>
                      <p className="m-0">info@example.com</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-7">
                <div className="section-title position-relative mb-4">
                  <h6 className="d-inline-block position-relative text-secondary text-uppercase pb-2">
                    Need Help?
                  </h6>
                  <h1 className="display-4">Send Us A Message</h1>
                </div>
                <div className="contact-form">
                  <form>
                    <div className="row">
                      <div className="col-6 form-group">
                        <input
                          type="text"
                          className="form-control border-top-0 border-right-0 border-left-0 p-0"
                          placeholder="Your Name"
                          required="required"
                        />
                      </div>
                      <div className="col-6 form-group">
                        <input
                          type="email"
                          className="form-control border-top-0 border-right-0 border-left-0 p-0"
                          placeholder="Your Email"
                          required="required"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-control border-top-0 border-right-0 border-left-0 p-0"
                        placeholder="Subject"
                        required="required"
                      />
                    </div>
                    <div className="form-group">
                      <textarea
                        className="form-control border-top-0 border-right-0 border-left-0 p-0"
                        rows={5}
                        placeholder="Message"
                        required="required"
                        defaultValue={""}
                      />
                    </div>
                    <div>
                      <button
                        className="btn btn-primary py-3 px-5"
                        type="submit"
                      >
                        Send Message
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Contact End */}
      </>
    </>
  );
}

export default Contact;
