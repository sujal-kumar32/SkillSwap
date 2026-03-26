import React from "react";
import { useEffect } from "react";

function Team() {
  useEffect(() => {
    const destroyCarousel = (selector) => {
      const carousel = window.$(selector);
      if (carousel.hasClass("owl-loaded")) {
        carousel.trigger("destroy.owl.carousel");
        carousel.removeClass("owl-loaded");
        carousel.find(".owl-stage-outer").children().unwrap();
      }
    };

    const initTeamCarousel = () => {
      if (!window.$ || !window.$.fn.owlCarousel) return;

      const carousel = window.$(".team-carousel");
      if (carousel.hasClass("owl-loaded")) {
        carousel.trigger("destroy.owl.carousel");
        carousel.removeClass("owl-loaded");
        carousel.find(".owl-stage-outer").children().unwrap();
      }

      carousel.owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        margin: 30,
        loop: true,
        nav: true,
        navText: [
          '<i class="fa fa-angle-left"></i>',
          '<i class="fa fa-angle-right"></i>',
        ],
        autoHeight: true,
        responsiveRefreshRate: 100,
        responsive: {
          0: { items: 1 },
          576: { items: 1 },
          768: { items: 2 },
          992: { items: 3 },
        },
      });
    };

    const timer = setTimeout(() => {
      initTeamCarousel();
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (window.$ && window.$.fn.owlCarousel) {
        destroyCarousel(".team-carousel");
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
            <h1 className="text-white display-1">Instructors</h1>
            <div className="d-inline-flex text-white mb-5">
              <p className="m-0 text-uppercase">
                <a className="text-white" href="">
                  Home
                </a>
              </p>
              <i className="fa fa-angle-double-right pt-1 px-3" />
              <p className="m-0 text-uppercase">Instructors</p>
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
        {/* Team Start */}
        <div className="container-fluid py-5">
          <div className="container py-5">
            <div className="section-title text-center position-relative mb-5">
              <h6 className="d-inline-block position-relative text-secondary text-uppercase pb-2">
                Instructors
              </h6>
              <h1 className="display-4">Meet Our Instructors</h1>
            </div>
            <div
              className="owl-carousel team-carousel position-relative"
              style={{ padding: "0 30px" }}
            >
              <div className="team-item">
                <img className="img-fluid w-100" src="img/team-1.jpg" alt="" />
                <div className="bg-light text-center p-4">
                  <h5 className="mb-3">Instructor Name</h5>
                  <p className="mb-2">Web Design &amp; Development</p>
                  <div className="d-flex justify-content-center">
                    <a className="mx-1 p-1" href="#">
                      <i className="fab fa-twitter" />
                    </a>
                    <a className="mx-1 p-1" href="#">
                      <i className="fab fa-facebook-f" />
                    </a>
                    <a className="mx-1 p-1" href="#">
                      <i className="fab fa-linkedin-in" />
                    </a>
                    <a className="mx-1 p-1" href="#">
                      <i className="fab fa-instagram" />
                    </a>
                    <a className="mx-1 p-1" href="#">
                      <i className="fab fa-youtube" />
                    </a>
                  </div>
                </div>
              </div>
              <div className="team-item">
                <img className="img-fluid w-100" src="img/team-2.jpg" alt="" />
                <div className="bg-light text-center p-4">
                  <h5 className="mb-3">Instructor Name</h5>
                  <p className="mb-2">Web Design &amp; Development</p>
                  <div className="d-flex justify-content-center">
                    <a className="mx-1 p-1" href="#">
                      <i className="fab fa-twitter" />
                    </a>
                    <a className="mx-1 p-1" href="#">
                      <i className="fab fa-facebook-f" />
                    </a>
                    <a className="mx-1 p-1" href="#">
                      <i className="fab fa-linkedin-in" />
                    </a>
                    <a className="mx-1 p-1" href="#">
                      <i className="fab fa-instagram" />
                    </a>
                    <a className="mx-1 p-1" href="#">
                      <i className="fab fa-youtube" />
                    </a>
                  </div>
                </div>
              </div>
              <div className="team-item">
                <img className="img-fluid w-100" src="img/team-3.jpg" alt="" />
                <div className="bg-light text-center p-4">
                  <h5 className="mb-3">Instructor Name</h5>
                  <p className="mb-2">Web Design &amp; Development</p>
                  <div className="d-flex justify-content-center">
                    <a className="mx-1 p-1" href="#">
                      <i className="fab fa-twitter" />
                    </a>
                    <a className="mx-1 p-1" href="#">
                      <i className="fab fa-facebook-f" />
                    </a>
                    <a className="mx-1 p-1" href="#">
                      <i className="fab fa-linkedin-in" />
                    </a>
                    <a className="mx-1 p-1" href="#">
                      <i className="fab fa-instagram" />
                    </a>
                    <a className="mx-1 p-1" href="#">
                      <i className="fab fa-youtube" />
                    </a>
                  </div>
                </div>
              </div>
              <div className="team-item">
                <img className="img-fluid w-100" src="img/team-4.jpg" alt="" />
                <div className="bg-light text-center p-4">
                  <h5 className="mb-3">Instructor Name</h5>
                  <p className="mb-2">Web Design &amp; Development</p>
                  <div className="d-flex justify-content-center">
                    <a className="mx-1 p-1" href="#">
                      <i className="fab fa-twitter" />
                    </a>
                    <a className="mx-1 p-1" href="#">
                      <i className="fab fa-facebook-f" />
                    </a>
                    <a className="mx-1 p-1" href="#">
                      <i className="fab fa-linkedin-in" />
                    </a>
                    <a className="mx-1 p-1" href="#">
                      <i className="fab fa-instagram" />
                    </a>
                    <a className="mx-1 p-1" href="#">
                      <i className="fab fa-youtube" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Team End */}
      </>
    </>
  );
}

export default Team;
