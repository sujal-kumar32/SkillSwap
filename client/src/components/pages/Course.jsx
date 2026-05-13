import React from "react";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const sessions = [
  { title: "React.js – Build Modern Web Apps", mentor: "Priya Sharma", rating: "4.8", reviews: "320", img: "img/courses-1.jpg" },
  { title: "Guitar Basics – Strum Your First Song", mentor: "Arjun Kapoor", rating: "4.9", reviews: "180", img: "img/courses-2.jpg" },
  { title: "UI/UX Design – Figma for Beginners", mentor: "Neha Patel", rating: "4.7", reviews: "210", img: "img/courses-3.jpg" },
  { title: "Public Speaking – Speak with Confidence", mentor: "Rahul Verma", rating: "4.6", reviews: "150", img: "img/courses-4.jpg" },
  { title: "DSA Interview Prep – Crack the Code", mentor: "Vikram Singh", rating: "4.9", reviews: "420", img: "img/courses-5.jpg" },
  { title: "Cricket Coaching – Batting Techniques", mentor: "Rohit Yadav", rating: "4.8", reviews: "290", img: "img/courses-6.jpg" },
];

function Course() {
  useEffect(() => {
    const destroyCarousel = (selector) => {
      const carousel = window.$(selector);
      if (carousel.hasClass("owl-loaded")) {
        carousel.trigger("destroy.owl.carousel");
        carousel.removeClass("owl-loaded");
        carousel.find(".owl-stage-outer").children().unwrap();
      }
    };

    const initCarousels = () => {
      if (!window.$ || !window.$.fn.owlCarousel) return;

      const setup = (selector, options) => {
        const el = window.$(selector);
        if (el.hasClass("owl-loaded")) {
          el.trigger("destroy.owl.carousel");
          el.removeClass("owl-loaded");
          el.find(".owl-stage-outer").children().unwrap();
        }
        el.owlCarousel(options);
      };

      setup(".courses-carousel", {
        autoplay: true,
        smartSpeed: 1500,
        loop: true,
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

      setup(".team-carousel", {
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

      setup(".testimonial-carousel", {
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

      if (window.$) {
        if (window.$.fn.counterUp) {
          window.$('[data-toggle="counter-up"]').counterUp({
            delay: 10,
            time: 2000,
          });
        }

        initCarousels();
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (window.$ && window.$.fn.owlCarousel) {
        destroyCarousel(".courses-carousel");
        destroyCarousel(".team-carousel");
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
            <h1 className="text-white display-1">Explore Sessions</h1>
            <div className="d-inline-flex text-white mb-5">
              <p className="m-0 text-uppercase">
                <Link className="text-white" to="/">
                  Home
                </Link>
              </p>
              <i className="fa fa-angle-double-right pt-1 px-3" />
              <p className="m-0 text-uppercase">Sessions</p>
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
        {/* Courses Start */}
        <div className="container-fluid bg-image py-5">
          <div className="container py-5">
            <div className="row mx-0 justify-content-center">
              <div className="col-lg-8">
                <div className="section-title text-center position-relative mb-5">
                  <h6 className="d-inline-block position-relative text-secondary text-uppercase pb-2">
                    Mentor Sessions
                  </h6>
                  <h1 className="display-4">
                    Find Your Perfect Skill Session
                  </h1>
                </div>
              </div>
            </div>
            <div className="row">
              {sessions.map((session, index) => (
                <div className="col-lg-4 col-md-6 pb-4" key={index}>
                  <Link
                    className="courses-list-item position-relative d-block overflow-hidden mb-2"
                    to="/detail"
                  >
                    <img className="img-fluid" src={session.img} alt="" />
                    <div className="courses-text">
                      <h4 className="text-center text-white px-3">
                        {session.title}
                      </h4>
                      <div className="border-top w-100 mt-3">
                        <div className="d-flex justify-content-between p-4">
                          <span className="text-white">
                            <i className="fa fa-user mr-2" />
                            {session.mentor}
                          </span>
                          <span className="text-white">
                            <i className="fa fa-star mr-2" />
                            {session.rating}
                            <small>({session.reviews})</small>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Courses End */}
      </>
    </>
  );
}

export default Course;
