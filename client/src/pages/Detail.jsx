import React from "react";

import { useEffect } from "react";
import { Link } from "react-router-dom";

function Detail() {
  useEffect(() => {
    const destroyCarousel = (selector) => {
      const carousel = window.$(selector);
      if (carousel.hasClass("owl-loaded")) {
        carousel.trigger("destroy.owl.carousel");
        carousel.removeClass("owl-loaded");
        carousel.find(".owl-stage-outer").children().unwrap();
      }
    };

    const initRelatedCarousel = () => {
      if (!window.$ || !window.$.fn.owlCarousel) return;

      const carousel = window.$(".related-carousel");
      if (carousel.hasClass("owl-loaded")) {
        carousel.trigger("destroy.owl.carousel");
        carousel.removeClass("owl-loaded");
        carousel.find(".owl-stage-outer").children().unwrap();
      }

      carousel.owlCarousel({
        autoplay: true,
        smartSpeed: 1500,
        loop: true,
        margin: 30,
        dots: false,
        nav: true,
        navText: [
          '<i class="fa fa-angle-left"></i>',
          '<i class="fa fa-angle-right"></i>',
        ],
        autoHeight: true,
        responsiveRefreshRate: 100,
        responsive: {
          0: { items: 1 },
          576: { items: 2 },
          768: { items: 3 },
          992: { items: 4 },
        },
      });
    };

    const timer = setTimeout(() => {
      initRelatedCarousel();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (window.$ && window.$.fn.owlCarousel) {
        destroyCarousel(".related-carousel");
      }
    };
  }, []);
  return (
    <>
      <>
        {/* Header Start */}
        <div
          className="jumbotron jumbotron-fluid page-header position-relative overlay-bottom"
          style={{ marginBottom: 90 }}
        >
          <div className="container text-center py-5">
            <h1 className="text-white display-1">Course Detail</h1>
            <div className="d-inline-flex text-white mb-5">
              <p className="m-0 text-uppercase">
                <Link className="text-white" to="/">
                  Home
                </Link>
              </p>
              <i className="fa fa-angle-double-right pt-1 px-3" />
              <p className="m-0 text-uppercase">Course Detail</p>
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
        {/* Detail Start */}
        <div className="container-fluid py-5">
          <div className="container py-5">
            <div className="row">
              <div className="col-lg-8">
                <div className="mb-5">
                  <div className="section-title position-relative mb-5">
                    <h6 className="d-inline-block position-relative text-secondary text-uppercase pb-2">
                      Course Detail
                    </h6>
                    <h1 className="display-4">
                      Web design &amp; development courses for beginners
                    </h1>
                  </div>
                  <img
                    className="img-fluid rounded w-100 mb-4"
                    src="img/header.jpg"
                    alt="Image"
                  />
                  <p>
                    Tempor erat elitr at rebum at at clita aliquyam consetetur.
                    Diam dolor diam ipsum et, tempor voluptua sit consetetur
                    sit. Aliquyam diam amet diam et eos sadipscing labore. Clita
                    erat ipsum et lorem et sit, sed stet no labore lorem sit.
                    Sanctus clita duo justo et tempor consetetur takimata
                    eirmod, dolores takimata consetetur invidunt magna dolores
                    aliquyam dolores dolore. Amet erat amet et magna
                  </p>
                  <p>
                    Sadipscing labore amet rebum est et justo gubergren. Et
                    eirmod ipsum sit diam ut magna lorem. Nonumy vero labore
                    lorem sanctus rebum et lorem magna kasd, stet amet magna
                    accusam consetetur eirmod. Kasd accusam sit ipsum sadipscing
                    et at at sanctus et. Ipsum sit gubergren dolores et,
                    consetetur justo invidunt at et aliquyam ut et vero clita.
                    Diam sea sea no sed dolores diam nonumy, gubergren sit stet
                    no diam kasd vero.
                  </p>
                </div>
                <h2 className="mb-3">Related Courses</h2>
                <div
                  className="owl-carousel related-carousel position-relative"
                  style={{ padding: "0 30px" }}
                >
                  <Link
                    className="courses-list-item position-relative d-block overflow-hidden mb-2"
                    to="/detail"
                  >
                    <img className="img-fluid" src="img/courses-1.jpg" alt="" />
                    <div className="courses-text">
                      <h4 className="text-center text-white px-3">
                        Web design &amp; development courses for beginners
                      </h4>
                      <div className="border-top w-100 mt-3">
                        <div className="d-flex justify-content-between p-4">
                          <span className="text-white">
                            <i className="fa fa-user mr-2" />
                            Jhon Doe
                          </span>
                          <span className="text-white">
                            <i className="fa fa-star mr-2" />
                            4.5
                            <small>(250)</small>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                  <Link
                    className="courses-list-item position-relative d-block overflow-hidden mb-2"
                    to="/detail"
                  >
                    <img className="img-fluid" src="img/courses-2.jpg" alt="" />
                    <div className="courses-text">
                      <h4 className="text-center text-white px-3">
                        Web design &amp; development courses for beginners
                      </h4>
                      <div className="border-top w-100 mt-3">
                        <div className="d-flex justify-content-between p-4">
                          <span className="text-white">
                            <i className="fa fa-user mr-2" />
                            Jhon Doe
                          </span>
                          <span className="text-white">
                            <i className="fa fa-star mr-2" />
                            4.5
                            <small>(250)</small>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                  <Link
                    className="courses-list-item position-relative d-block overflow-hidden mb-2"
                    to="/detail"
                  >
                    <img className="img-fluid" src="img/courses-3.jpg" alt="" />
                    <div className="courses-text">
                      <h4 className="text-center text-white px-3">
                        Web design &amp; development courses for beginners
                      </h4>
                      <div className="border-top w-100 mt-3">
                        <div className="d-flex justify-content-between p-4">
                          <span className="text-white">
                            <i className="fa fa-user mr-2" />
                            Jhon Doe
                          </span>
                          <span className="text-white">
                            <i className="fa fa-star mr-2" />
                            4.5
                            <small>(250)</small>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
              <div className="col-lg-4 mt-5 mt-lg-0">
                <div className="bg-primary mb-5 py-3">
                  <h3 className="text-white py-3 px-4 m-0">Course Features</h3>
                  <div className="d-flex justify-content-between border-bottom px-4">
                    <h6 className="text-white my-3">Instructor</h6>
                    <h6 className="text-white my-3">John Doe</h6>
                  </div>
                  <div className="d-flex justify-content-between border-bottom px-4">
                    <h6 className="text-white my-3">Rating</h6>
                    <h6 className="text-white my-3">
                      4.5 <small>(250)</small>
                    </h6>
                  </div>
                  <div className="d-flex justify-content-between border-bottom px-4">
                    <h6 className="text-white my-3">Lectures</h6>
                    <h6 className="text-white my-3">15</h6>
                  </div>
                  <div className="d-flex justify-content-between border-bottom px-4">
                    <h6 className="text-white my-3">Duration</h6>
                    <h6 className="text-white my-3">10.00 Hrs</h6>
                  </div>
                  <div className="d-flex justify-content-between border-bottom px-4">
                    <h6 className="text-white my-3">Skill level</h6>
                    <h6 className="text-white my-3">All Level</h6>
                  </div>
                  <div className="d-flex justify-content-between px-4">
                    <h6 className="text-white my-3">Language</h6>
                    <h6 className="text-white my-3">English</h6>
                  </div>
                  <h5 className="text-white py-3 px-4 m-0">
                    Course Price: $199
                  </h5>
                  <div className="py-3 px-4">
                    <a
                      className="btn btn-block btn-secondary py-3 px-5"
                      href=""
                    >
                      Enroll Now
                    </a>
                  </div>
                </div>
                <div className="mb-5">
                  <h2 className="mb-3">Categories</h2>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                      <a href="" className="text-decoration-none h6 m-0">
                        Web Design
                      </a>
                      <span className="badge badge-primary badge-pill">
                        150
                      </span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                      <a href="" className="text-decoration-none h6 m-0">
                        Web Development
                      </a>
                      <span className="badge badge-primary badge-pill">
                        131
                      </span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                      <a href="" className="text-decoration-none h6 m-0">
                        Online Marketing
                      </a>
                      <span className="badge badge-primary badge-pill">78</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                      <a href="" className="text-decoration-none h6 m-0">
                        Keyword Research
                      </a>
                      <span className="badge badge-primary badge-pill">56</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                      <a href="" className="text-decoration-none h6 m-0">
                        Email Marketing
                      </a>
                      <span className="badge badge-primary badge-pill">98</span>
                    </li>
                  </ul>
                </div>
                <div className="mb-5">
                  <h2 className="mb-4">Recent Courses</h2>
                  <a
                    className="d-flex align-items-center text-decoration-none mb-4"
                    href=""
                  >
                    <img
                      className="img-fluid rounded"
                      src="img/courses-80x80.jpg"
                      alt=""
                    />
                    <div className="pl-3">
                      <h6>
                        Web design &amp; development courses for beginners
                      </h6>
                      <div className="d-flex">
                        <small className="text-body mr-3">
                          <i className="fa fa-user text-primary mr-2" />
                          Jhon Doe
                        </small>
                        <small className="text-body">
                          <i className="fa fa-star text-primary mr-2" />
                          4.5 (250)
                        </small>
                      </div>
                    </div>
                  </a>
                  <a
                    className="d-flex align-items-center text-decoration-none mb-4"
                    href=""
                  >
                    <img
                      className="img-fluid rounded"
                      src="img/courses-80x80.jpg"
                      alt=""
                    />
                    <div className="pl-3">
                      <h6>
                        Web design &amp; development courses for beginners
                      </h6>
                      <div className="d-flex">
                        <small className="text-body mr-3">
                          <i className="fa fa-user text-primary mr-2" />
                          Jhon Doe
                        </small>
                        <small className="text-body">
                          <i className="fa fa-star text-primary mr-2" />
                          4.5 (250)
                        </small>
                      </div>
                    </div>
                  </a>
                  <a
                    className="d-flex align-items-center text-decoration-none mb-4"
                    href=""
                  >
                    <img
                      className="img-fluid rounded"
                      src="img/courses-80x80.jpg"
                      alt=""
                    />
                    <div className="pl-3">
                      <h6>
                        Web design &amp; development courses for beginners
                      </h6>
                      <div className="d-flex">
                        <small className="text-body mr-3">
                          <i className="fa fa-user text-primary mr-2" />
                          Jhon Doe
                        </small>
                        <small className="text-body">
                          <i className="fa fa-star text-primary mr-2" />
                          4.5 (250)
                        </small>
                      </div>
                    </div>
                  </a>
                  <a
                    className="d-flex align-items-center text-decoration-none"
                    href=""
                  >
                    <img
                      className="img-fluid rounded"
                      src="img/courses-80x80.jpg"
                      alt=""
                    />
                    <div className="pl-3">
                      <h6>
                        Web design &amp; development courses for beginners
                      </h6>
                      <div className="d-flex">
                        <small className="text-body mr-3">
                          <i className="fa fa-user text-primary mr-2" />
                          Jhon Doe
                        </small>
                        <small className="text-body">
                          <i className="fa fa-star text-primary mr-2" />
                          4.5 (250)
                        </small>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Detail End */}
      </>
    </>
  );
}

export default Detail;
