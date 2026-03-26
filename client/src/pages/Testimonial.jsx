import React from "react";
import { useEffect } from "react";

function Testimonial() {
  useEffect(() => {
    const destroyCarousel = (selector) => {
      const carousel = window.$(selector);
      if (carousel.hasClass("owl-loaded")) {
        carousel.trigger("destroy.owl.carousel");
        carousel.removeClass("owl-loaded");
        carousel.find(".owl-stage-outer").children().unwrap();
      }
    };

    const initTestimonialCarousel = () => {
      if (!window.$ || !window.$.fn.owlCarousel) return;

      const carousel = window.$(".testimonial-carousel");
      if (carousel.hasClass("owl-loaded")) {
        carousel.trigger("destroy.owl.carousel");
        carousel.removeClass("owl-loaded");
        carousel.find(".owl-stage-outer").children().unwrap();
      }

      carousel.owlCarousel({
        autoplay: true,
        smartSpeed: 1500,
        items: 1,
        loop: true,
        nav: true,
        navText: [
          '<i class="fa fa-angle-left"></i>',
          '<i class="fa fa-angle-right"></i>',
        ],
        autoHeight: true,
        responsiveRefreshRate: 100,
      });
    };

    const timer = setTimeout(() => {
      initTestimonialCarousel();
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (window.$ && window.$.fn.owlCarousel) {
        destroyCarousel(".testimonial-carousel");
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
            <h1 className="text-white display-1">Testimonial</h1>
            <div className="d-inline-flex text-white mb-5">
              <p className="m-0 text-uppercase">
                <a className="text-white" href="">
                  Home
                </a>
              </p>
              <i className="fa fa-angle-double-right pt-1 px-3" />
              <p className="m-0 text-uppercase">Testimonial</p>
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
        {/* Testimonial Start */}
        <div className="container-fluid py-5">
          <div className="container py-5">
            <div className="row align-items-center">
              <div className="col-lg-5 mb-5 mb-lg-0">
                <div className="section-title position-relative mb-4">
                  <h6 className="d-inline-block position-relative text-secondary text-uppercase pb-2">
                    Testimonial
                  </h6>
                  <h1 className="display-4">What Say Our Students</h1>
                </div>
                <p className="m-0">
                  Dolor est dolores et nonumy sit labore dolores est sed rebum
                  amet, justo duo ipsum sanctus dolore magna rebum sit et. Diam
                  lorem ea sea at. Nonumy et at at sed justo est nonumy tempor.
                  Vero sea ea eirmod, elitr ea amet diam ipsum at amet. Erat sed
                  stet eos ipsum diam
                </p>
              </div>
              <div className="col-lg-7">
                <div className="owl-carousel testimonial-carousel">
                  <div className="bg-light p-5">
                    <i className="fa fa-3x fa-quote-left text-primary mb-4" />
                    <p>
                      Sed et elitr ipsum labore dolor diam, ipsum duo vero sed
                      sit est est ipsum eos clita est ipsum. Est nonumy tempor
                      at kasd. Sed at dolor duo ut dolor, et justo erat dolor
                      magna sed stet amet elitr duo lorem
                    </p>
                    <div className="d-flex flex-shrink-0 align-items-center mt-4">
                      <img
                        className="img-fluid mr-4"
                        src="img/testimonial-2.jpg"
                        alt=""
                      />
                      <div>
                        <h5>Student Name</h5>
                        <span>Web Design</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-light p-5">
                    <i className="fa fa-3x fa-quote-left text-primary mb-4" />
                    <p>
                      Sed et elitr ipsum labore dolor diam, ipsum duo vero sed
                      sit est est ipsum eos clita est ipsum. Est nonumy tempor
                      at kasd. Sed at dolor duo ut dolor, et justo erat dolor
                      magna sed stet amet elitr duo lorem
                    </p>
                    <div className="d-flex flex-shrink-0 align-items-center mt-4">
                      <img
                        className="img-fluid mr-4"
                        src="img/testimonial-1.jpg"
                        alt=""
                      />
                      <div>
                        <h5>Student Name</h5>
                        <span>Web Design</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Testimonial Start */}
      </>
    </>
  );
}

export default Testimonial;
