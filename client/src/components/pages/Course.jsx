import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Apiservices from "../../../Apiservices";
import UserLink from "../shared/UserLink";

const fallbackImgs = ["img/courses-1.jpg","img/courses-2.jpg","img/courses-3.jpg","img/courses-4.jpg","img/courses-5.jpg","img/courses-6.jpg"];

function Course() {
  const [sessions, setSessions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [params] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") || "");
  const [category, setCategory] = useState(params.get("cat") || "");

  const filtered = sessions.filter((s) => {
    const q = search.toLowerCase();
    const catMatch = !category || (s.skillId?.categoryId?._id || s.categoryId) === category;
    const textMatch = !q || (s.title || "").toLowerCase().includes(q)
      || (s.mentorId?.name || "").toLowerCase().includes(q)
      || (s.skillId?.name || "").toLowerCase().includes(q);
    return catMatch && textMatch;
  });

  useEffect(() => {
    Promise.all([
      Apiservices.fetchSessions({ limit: 50 }).then((res) => setSessions(res.data.data || [])),
      Apiservices.getCategories().then((res) => setCategories(res.data.data || [])),
    ]).catch(() => setError("Failed to load sessions")).finally(() => setLoading(false));
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
                  <select className="btn btn-outline-light bg-white text-body px-4"
                    value={category} onChange={(e) => setCategory(e.target.value)}
                    disabled={loading}
                    style={{ height: "100%", border: "1px solid #dee2e6", borderRadius: "0.25rem 0 0 0.25rem" }}>
                    <option value="">{loading ? "Loading..." : "All Skills"}</option>
                    {categories.filter((c) => c.status !== "inactive").map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  className="form-control border-light"
                  style={{ padding: "30px 25px" }}
                  placeholder="Search skills, mentors, sessions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="input-group-append">
                  <button className="btn btn-secondary px-4 px-lg-5" onClick={() => setSearch("")}>
                    {search ? "Clear" : "Search"}
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
                  {!loading && <p className="text-muted">{filtered.length} session{filtered.length !== 1 ? "s" : ""} found</p>}
                </div>
              </div>
            </div>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }} />
                <p className="text-muted">Loading sessions...</p>
              </div>
            ) : error ? (
              <div className="text-center py-5">
                <i className="fa fa-exclamation-triangle text-danger mb-3" style={{ fontSize: "2.5rem" }} />
                <h4 className="fw-bold">Failed to load sessions</h4>
                <p className="text-muted mb-0">{error}</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-5">
                <i className="fa fa-search text-muted mb-3" style={{ fontSize: "2.5rem" }} />
                <h4 className="fw-bold">No sessions found</h4>
                <p className="text-muted mb-0">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              <div className="row">
                {filtered.map((s, i) => (
                  <div className="col-lg-4 col-md-6 pb-4" key={s._id}>
                    <Link
                      className="courses-list-item position-relative d-block overflow-hidden mb-2"
                      to={`/courses/${s._id}`}
                    >
                      <img className="img-fluid" src={fallbackImgs[i % 6]} alt={s.title} />
                      <div className="courses-text">
                        <h4 className="text-center text-white px-3">
                          {s.title}
                        </h4>
                        <div className="border-top w-100 mt-3">
                          <div className="d-flex justify-content-between p-4">
                            <span className="text-white">
                              <i className="fa fa-user mr-2" />
                              <UserLink user={s.mentorId} name={s.mentorId?.name || "Mentor"} />
                            </span>
                            <span className="text-white">
                              <i className="fa fa-star mr-2" />
                              {s.rating || "4.8"}
                              <small>(—)</small>
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Courses End */}
      </>
    </>
  );
}

export default Course;
