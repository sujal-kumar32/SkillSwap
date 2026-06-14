import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Apiservices from "../../../Apiservices";

function Testimonial() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [catSearch, setCatSearch] = useState("");
  const [testimonials, setTestimonials] = useState([]);
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    Promise.all([
      Apiservices.getCategories(),
      Apiservices.getPublicReviews(),
    ])
      .then(([catRes, revRes]) => {
        setCategories(catRes.data.data || []);
        setTestimonials(revRes.data.data || []);
      })
      .catch(() => {})
      .finally(() => setDataReady(true));
  }, []);

  useEffect(() => {
    if (!dataReady) return;

    const destroyCarousel = (selector) => {
      const carousel = window.$(selector);
      if (carousel && carousel.hasClass("owl-loaded")) {
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
    }, 100);

    return () => {
      clearTimeout(timer);
      if (window.$ && window.$.fn.owlCarousel) {
        destroyCarousel(".testimonial-carousel");
      }
    };
  }, [dataReady]);

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
                <a className="text-white" href="/">
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
                {testimonials.length === 0 ? (
                  <div className="bg-light p-5 text-center text-muted">No testimonials yet.</div>
                ) : (
                <div className="owl-carousel testimonial-carousel">
                  {testimonials.map((t) => (
                    <div className="bg-light p-5" key={t._id}>
                      <i className="fa fa-3x fa-quote-left text-primary mb-4" />
                      <p>{t.comment || "Great experience with SkillSwap!"}</p>
                      <div className="d-flex flex-shrink-0 align-items-center mt-4">
                        <img className="img-fluid mr-4" src={t.image || "img/testimonial-2.jpg"} alt={t.name} />
                        <div>
                          <h5>{t.name}</h5>
                          <span>{t.role}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                )}
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
