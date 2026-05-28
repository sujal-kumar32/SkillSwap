import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Apiservices from "../../../Apiservices";

function Testimonial() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [catSearch, setCatSearch] = useState("");

  useEffect(() => {
    Apiservices.getCategories().then(res => setCategories(res.data.data || [])).catch(() => {});
  }, []);

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
            <h1 className="text-white display-1">Testimonials</h1>
            <div className="d-inline-flex text-white mb-5">
              <p className="m-0 text-uppercase">
                <a className="text-white" href="">
                  Home
                </a>
              </p>
              <i className="fa fa-angle-double-right pt-1 px-3" />
              <p className="m-0 text-uppercase">Testimonials</p>
            </div>
            <div
              className="mx-auto mb-5"
              style={{ width: "100%", maxWidth: 600 }}
            >
              <div className="input-group">
                <select style={{ width: 140, padding: "10px", border: "1px solid #dee2e6", borderRadius: "0", background: "#fff" }}
                  value={catSearch} onChange={(e) => setCatSearch(e.target.value)}>
                  <option value="">All Skills</option>
                  {categories.filter((c) => c.status !== "inactive").map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                <input id="ts-search" type="text" className="form-control border-light"
                  style={{ padding: "30px 25px" }} placeholder="Search skills, mentors, sessions..."
                  onKeyDown={(e) => { if (e.key === "Enter") navigate(`/courses?q=${encodeURIComponent(document.getElementById("ts-search")?.value || '')}&cat=${catSearch}`); }} />
                <div className="input-group-append">
                  <button className="btn btn-secondary px-4 px-lg-5" onClick={() => navigate(`/courses?q=${encodeURIComponent(document.getElementById("ts-search")?.value || '')}&cat=${catSearch}`)}>
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Header End */}
        {/* Testimonial Start */}
        <div className="container-fluid bg-image py-5">
          <div className="container py-5">
            <div className="row align-items-center">
              <div className="col-lg-5 mb-5 mb-lg-0">
                <div className="section-title position-relative mb-4">
                  <h6 className="d-inline-block position-relative text-secondary text-uppercase pb-2">
                    Testimonials
                  </h6>
                  <h1 className="display-4">What Our Community Says</h1>
                </div>
                <p className="m-0">
                  Real stories from real learners and mentors who found value in the SkillSwap experience. 
                  From career transformations to personal growth, hear how peer-to-peer learning changes lives.
                </p>
              </div>
              <div className="col-lg-7">
                <div className="owl-carousel testimonial-carousel">
                  <div className="bg-light p-5">
                    <i className="fa fa-3x fa-quote-left text-primary mb-4" />
                    <p>
                      I joined SkillSwap as a complete beginner in web development. Within two months, 
                      I built my first portfolio website with guidance from my mentor. The live sessions 
                      are far more effective than any pre-recorded course I've tried.
                    </p>
                    <div className="d-flex flex-shrink-0 align-items-center mt-4">
                      <img
                        className="img-fluid mr-4"
                        src="img/testimonial-2.jpg"
                        alt=""
                      />
                      <div>
                        <h5>Ananya Gupta</h5>
                        <span>Web Development Learner</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-light p-5">
                    <i className="fa fa-3x fa-quote-left text-primary mb-4" />
                    <p>
                      As a mentor on SkillSwap, I've been able to share my 8 years of design experience 
                      with eager learners from all over India. The platform makes it effortless to schedule 
                      sessions, share resources, and track progress. Truly rewarding!
                    </p>
                    <div className="d-flex flex-shrink-0 align-items-center mt-4">
                      <img
                        className="img-fluid mr-4"
                        src="img/testimonial-1.jpg"
                        alt=""
                      />
                      <div>
                        <h5>Neha Patel</h5>
                        <span>UI/UX Design Mentor</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-light p-5">
                    <i className="fa fa-3x fa-quote-left text-primary mb-4" />
                    <p>
                      I was struggling with DSA interview preparation until I found Vikram on SkillSwap. 
                      His structured approach and real-world examples made complex topics click. Landed my 
                      dream job at a top tech company thanks to this platform!
                    </p>
                    <div className="d-flex flex-shrink-0 align-items-center mt-4">
                      <img
                        className="img-fluid mr-4"
                        src="img/testimonial-2.jpg"
                        alt=""
                      />
                      <div>
                        <h5>Rohit Mehta</h5>
                        <span>DSA Interview Prep Learner</span>
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




