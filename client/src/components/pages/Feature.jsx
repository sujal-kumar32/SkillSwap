import React from "react";

function Feature() {
  return (
    <>
      <>
        {/* Header Start */}
        <div
          className="jumbotron jumbotron-fluid page-header position-relative overlay-bottom"
          style={{ marginBottom: 90 }}
        >
          <div className="container text-center py-5">
            <h1 className="text-white display-1">Features</h1>
            <div className="d-inline-flex text-white mb-5">
              <p className="m-0 text-uppercase">
                <a className="text-white" href="">
                  Home
                </a>
              </p>
              <i className="fa fa-angle-double-right pt-1 px-3" />
              <p className="m-0 text-uppercase">Features</p>
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
                    Skills
                  </button>
                  <div className="dropdown-menu">
                    <a className="dropdown-item" href="#">
                      Development
                    </a>
                    <a className="dropdown-item" href="#">
                      Creative Arts
                    </a>
                    <a className="dropdown-item" href="#">
                      Sports & Music
                    </a>
                  </div>
                </div>
                <input
                  type="text"
                  className="form-control border-light"
                  style={{ padding: "30px 25px" }}
                  placeholder="Search skills, mentors, sessions..."
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
        {/* Feature Start */}
        <div className="container-fluid bg-image py-5">
          <div className="container py-5">
            <div className="row">
              <div className="col-lg-7 mb-5 mb-lg-0">
                <div className="section-title position-relative mb-4">
                  <h6 className="d-inline-block position-relative text-secondary text-uppercase pb-2">
                    Why SkillSwap?
                  </h6>
                  <h1 className="display-4">
                    Everything You Need to Grow
                  </h1>
                </div>
                <p className="mb-4 pb-2">
                  SkillSwap combines the best of mentorship, technology, and community to create 
                  a learning experience that's personal, practical, and effective. Here's what makes us different.
                </p>
                <div className="d-flex mb-3">
                  <div className="btn-icon bg-primary mr-4">
                    <i className="fa fa-2x fa-users text-white" />
                  </div>
                  <div className="mt-n1">
                    <h4>Skill-Based Learning</h4>
                    <p>
                      Focus on practical skills that matter. Whether it's coding, music, or public speaking, 
                      our sessions are hands-on and project-based.
                    </p>
                  </div>
                </div>
                <div className="d-flex mb-3">
                  <div className="btn-icon bg-secondary mr-4">
                    <i className="fa fa-2x fa-robot text-white" />
                  </div>
                  <div className="mt-n1">
                    <h4>AI Recommendations</h4>
                    <p>
                      Get personalized session and mentor suggestions powered by AI that learns your 
                      preferences, goals, and learning style.
                    </p>
                  </div>
                </div>
                <div className="d-flex mb-3">
                  <div className="btn-icon bg-warning mr-4">
                    <i className="fa fa-2x fa-calendar-check text-white" />
                  </div>
                  <div className="mt-n1">
                    <h4>Real-Time Bookings</h4>
                    <p>
                      Book sessions in real-time with instant confirmation. Choose from available slots 
                      that fit your schedule perfectly.
                    </p>
                  </div>
                </div>
                <div className="d-flex">
                  <div className="btn-icon bg-info mr-4">
                    <i className="fa fa-2x fa-chart-simple text-white" />
                  </div>
                  <div className="mt-n1">
                    <h4>Progress Tracking</h4>
                    <p className="m-0">
                      Track every session you complete, skill you learn, and milestone you achieve. 
                      Your learning journey, visualized.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-lg-5" style={{ minHeight: 500 }}>
                <div className="position-relative h-100">
                  <img
                    className="position-absolute w-100 h-100"
                    src="img/feature.jpg"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Feature Start */}
      </>
    </>
  );
}

export default Feature;
