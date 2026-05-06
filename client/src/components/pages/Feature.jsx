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
        {/* Feature Start */}
        <div className="container-fluid py-5">
          <div className="container py-5">
            <div className="row">
              <div className="col-lg-7 mb-5 mb-lg-0">
                <div className="section-title position-relative mb-4">
                  <h6 className="d-inline-block position-relative text-secondary text-uppercase pb-2">
                    Why Choose Us?
                  </h6>
                  <h1 className="display-4">
                    Why You Should Start Learning with Us?
                  </h1>
                </div>
                <p className="mb-4 pb-2">
                  Aliquyam accusam clita nonumy ipsum sit sea clita ipsum clita,
                  ipsum dolores amet voluptua duo dolores et sit ipsum rebum,
                  sadipscing et erat eirmod diam kasd labore clita est. Diam
                  sanctus gubergren sit rebum clita amet.
                </p>
                <div className="d-flex mb-3">
                  <div className="btn-icon bg-primary mr-4">
                    <i className="fa fa-2x fa-graduation-cap text-white" />
                  </div>
                  <div className="mt-n1">
                    <h4>Skilled Instructors</h4>
                    <p>
                      Labore rebum duo est Sit dolore eos sit tempor eos stet,
                      vero vero clita magna kasd no nonumy et eos dolor magna
                      ipsum.
                    </p>
                  </div>
                </div>
                <div className="d-flex mb-3">
                  <div className="btn-icon bg-secondary mr-4">
                    <i className="fa fa-2x fa-certificate text-white" />
                  </div>
                  <div className="mt-n1">
                    <h4>International Certificate</h4>
                    <p>
                      Labore rebum duo est Sit dolore eos sit tempor eos stet,
                      vero vero clita magna kasd no nonumy et eos dolor magna
                      ipsum.
                    </p>
                  </div>
                </div>
                <div className="d-flex">
                  <div className="btn-icon bg-warning mr-4">
                    <i className="fa fa-2x fa-book-reader text-white" />
                  </div>
                  <div className="mt-n1">
                    <h4>Online Classes</h4>
                    <p className="m-0">
                      Labore rebum duo est Sit dolore eos sit tempor eos stet,
                      vero vero clita magna kasd no nonumy et eos dolor magna
                      ipsum.
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
