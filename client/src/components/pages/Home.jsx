import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Apiservices from "../../../Apiservices";

function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [catSearch, setCatSearch] = useState("");
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [contactSent, setContactSent] = useState(false);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState("");
  const [sessions, setSessions] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [stats, setStats] = useState(null);
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    Promise.all([
      Apiservices.getCategories(),
      Apiservices.fetchSessions({ sort: "latest", limit: 8 }),
      Apiservices.getTopMentors(),
      Apiservices.getPublicReviews(),
      Apiservices.getPublicStats(),
    ])
      .then(([catRes, sessRes, menRes, revRes, statRes]) => {
        setCategories(catRes.data.data || []);
        setSessions(sessRes.data.data || []);
        setMentors(menRes.data.data || []);
        setTestimonials(revRes.data.data || []);
        setStats(statRes.data.data || null);
      })
      .catch(() => setCatError("Failed to load data"))
      .finally(() => { setCatLoading(false); setDataReady(true); });
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
    }, 100);

    return () => {
      clearTimeout(timer);
      if (window.$ && window.$.fn.owlCarousel) {
        destroyCarousel(".courses-carousel");
        destroyCarousel(".team-carousel");
        destroyCarousel(".testimonial-carousel");
      }
    };
  }, [dataReady]);

  return (
    <>
      <>
        {/* Header Start */}
        <div
          className="jumbotron jumbotron-fluid position-relative overlay-bottom home-hero"
          style={{ marginBottom: 90 }}
        >
          <div className="container text-center my-5 py-5">
            <h1 className="text-white mt-4 mb-4" style={{ fontSize: "clamp(1rem, 3vw, 1.5rem)" }}>
              "Learn Skills. Share Knowledge. Grow Together."
            </h1>
            <h1 className="text-white display-1 mb-5" style={{ fontSize: "clamp(1.8rem, 5vw, 4.5rem)" }}>SkillSwap Platform</h1>
            <div
              className="mx-auto mb-5"
              style={{ width: "100%", maxWidth: 600 }}
            >
              <div className="input-group">
                <select style={{ width: "auto", minWidth: 120, maxWidth: "100%", padding: "10px", border: "1px solid #dee2e6", borderRadius: "0", background: "#fff" }}
                  value={catSearch} onChange={(e) => setCatSearch(e.target.value)}
                  disabled={catLoading}>
                  <option value="">{catLoading ? "Loading..." : catError ? "Unavailable" : "All Skills"}</option>
                  {categories.filter((c) => c.status !== "inactive").map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                <input id="h-search" type="text" className="form-control border-light"
                  style={{ padding: "clamp(12px, 2vw, 30px) clamp(12px, 2vw, 25px)" }} placeholder="Search skills, mentors, sessions..."
                  onKeyDown={(e) => { if (e.key === "Enter") navigate(`/courses?q=${encodeURIComponent(document.getElementById("h-search")?.value || "")}&cat=${catSearch}`); }} />
                <div className="input-group-append">
                  <button className="btn btn-secondary px-4 px-lg-5" onClick={() => navigate(`/courses?q=${encodeURIComponent(document.getElementById("h-search")?.value || "")}&cat=${catSearch}`)}>
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Header End */}
        {/* About Start */}
        <div className="container-fluid py-5">
          <div className="container py-5">
            <div className="row">
              <div className="col-lg-5 mb-5 mb-lg-0 home-about-img" style={{ minHeight: "clamp(250px, 40vw, 500px)" }}>
                <div className="position-relative h-100">
                  <img
                    className="position-absolute w-100 h-100"
                    src="img/about.jpg"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>
              <div className="col-lg-7">
                <div className="section-title position-relative mb-4">
                  <h6 className="d-inline-block position-relative text-secondary text-uppercase pb-2">
                    About SkillSwap
                  </h6>
                  <h1 className="display-4">
                    Peer-to-Peer Skill Sharing & Mentorship
                  </h1>
                </div>
                <p>
                  SkillSwap is a community-driven platform where anyone can learn a new skill and teach what they know. 
                  Unlike traditional courses, we connect learners directly with mentors for real-time, 
                  interactive sessions. Whether you want to master React, learn guitar, or improve your public speaking, 
                  there's a mentor ready to help you grow.
                </p>
                <div className="row pt-3 mx-0">
                  <div className="col-3 px-0">
                    <div className="bg-success text-center p-4">
                      <h1 className="text-white" data-toggle="counter-up">
                        {stats?.totalSkills || 0}
                      </h1>
                      <h6 className="text-uppercase text-white">
                        Available<span className="d-block">Skills</span>
                      </h6>
                    </div>
                  </div>
                  <div className="col-3 px-0">
                    <div className="bg-primary text-center p-4">
                      <h1 className="text-white" data-toggle="counter-up">
                        {stats?.totalSessions || 0}
                      </h1>
                      <h6 className="text-uppercase text-white">
                        Live<span className="d-block">Sessions</span>
                      </h6>
                    </div>
                  </div>
                  <div className="col-3 px-0">
                    <div className="bg-secondary text-center p-4">
                      <h1 className="text-white" data-toggle="counter-up">
                        {stats?.totalMentors || 0}
                      </h1>
                      <h6 className="text-uppercase text-white">
                        Expert<span className="d-block">Mentors</span>
                      </h6>
                    </div>
                  </div>
                  <div className="col-3 px-0">
                    <div className="bg-warning text-center p-4">
                      <h1 className="text-white" data-toggle="counter-up">
                        {stats?.totalLearners || 0}
                      </h1>
                      <h6 className="text-uppercase text-white">
                        Happy<span className="d-block">Learners</span>
                      </h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* About End */}
        {/* Feature Start */}
        <div className="container-fluid bg-image" style={{ margin: "90px 0" }}>
          <div className="container">
            <div className="row">
              <div className="col-lg-7 my-5 pt-5 pb-lg-5">
                <div className="section-title position-relative mb-4">
                  <h6 className="d-inline-block position-relative text-secondary text-uppercase pb-2">
                    Why SkillSwap?
                  </h6>
                  <h1 className="display-4">
                    Why Learn Through Peer Mentorship?
                  </h1>
                </div>
                <p className="mb-4 pb-2">
                  SkillSwap makes learning practical, social, and effective. Instead of watching pre-recorded videos, 
                  you get live guidance from skilled mentors who care about your progress.
                </p>
                <div className="d-flex mb-3">
                  <div className="btn-icon bg-primary mr-4">
                    <i className="fa fa-2x fa-users text-white" />
                  </div>
                  <div className="mt-n1">
                    <h4>Expert Mentors</h4>
                    <p>
                      Learn directly from experienced mentors who have real-world skills in development, 
                      design, music, sports, and more. Every mentor is vetted by our community.
                    </p>
                  </div>
                </div>
                <div className="d-flex mb-3">
                  <div className="btn-icon bg-secondary mr-4">
                    <i className="fa fa-2x fa-robot text-white" />
                  </div>
                  <div className="mt-n1">
                    <h4>AI-Powered Recommendations</h4>
                    <p>
                      Our smart recommendation engine suggests the best sessions and mentors based on your 
                      interests, learning history, and career goals.
                    </p>
                  </div>
                </div>
                <div className="d-flex">
                  <div className="btn-icon bg-warning mr-4">
                    <i className="fa fa-2x fa-clock text-white" />
                  </div>
                  <div className="mt-n1">
                    <h4>Flexible Scheduling</h4>
                    <p className="m-0">
                      Book sessions that fit your schedule. Choose from online or offline sessions, 
                      set your own pace, and learn from anywhere in the world.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-lg-5 home-feature-img" style={{ minHeight: "clamp(250px, 40vw, 500px)" }}>
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
        {/* Courses Start */}
        <div className="container-fluid px-0 py-5">
          <div className="row mx-0 justify-content-center pt-5">
            <div className="col-lg-6">
              <div className="section-title text-center position-relative mb-4">
                <h6 className="d-inline-block position-relative text-secondary text-uppercase pb-2">
                  Popular Sessions
                  </h6>
                <h1 className="display-4">
                  Top Skill Sessions This Week
                </h1>
              </div>
            </div>
          </div>
          <div className="owl-carousel courses-carousel">
            {sessions.length === 0 && (
              <div className="text-center py-4 text-muted">No sessions available yet.</div>
            )}
            {sessions.map((s, i) => (
              <div className="courses-item position-relative" key={s._id}>
                <img className="img-fluid" src={`img/courses-${(i % 6) + 1}.jpg`} alt={s.title} />
                <div className="courses-text">
                  <h4 className="text-center text-white px-3">{s.title}</h4>
                  <div className="border-top w-100 mt-3">
                    <div className="d-flex justify-content-between p-4">
                      <span className="text-white">
                        <i className="fa fa-user mr-2" />
                        {s.mentorId?.name || "Mentor"}
                      </span>
                      <span className="text-white">
                        <i className="fa fa-star mr-2" />
                        {s.rating || "—"} {s.reviewCount ? <small>({s.reviewCount})</small> : null}
                      </span>
                    </div>
                  </div>
                  <div className="w-100 bg-white text-center p-4">
                    <Link className="btn btn-primary" to={`/courses/${s._id}`}>
                      Session Detail
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="row justify-content-center bg-image mx-0 mb-5">
            <div className="col-lg-6 py-5">
              <div className="bg-white p-5 my-5">
                <h1 className="text-center mb-4">Become a Mentor Today</h1>
                <form onSubmit={(e) => { e.preventDefault(); navigate("/login"); }}>
                  <div className="form-row">
                    <div className="col-sm-6">
                      <div className="form-group">
                        <input
                          type="text"
                          className="form-control bg-light border-0"
                          placeholder="Your Name"
                          style={{ padding: "30px 20px" }}
                        />
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <input
                          type="email"
                          className="form-control bg-light border-0"
                          placeholder="Your Email"
                          style={{ padding: "30px 20px" }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="col-sm-6">
                      <div className="form-group">
                        <select
                          className="custom-select bg-light border-0 px-3"
                          style={{ height: 60 }}
                        >
                          <option defaultValue="">Select Your Skill</option>
                          {categories.filter((c) => c.status !== "inactive").map((c) => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <button
                        className="btn btn-primary btn-block"
                        type="submit"
                        style={{ height: 60 }}
                      >
                        Join as Mentor
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        {/* Courses End */}
        {/* Team Start */}
        <div className="container-fluid py-5">
          <div className="container py-5">
            <div className="section-title text-center position-relative mb-5">
              <h6 className="d-inline-block position-relative text-secondary text-uppercase pb-2">
                Top Mentors
              </h6>
              <h1 className="display-4">Learn From the Best</h1>
            </div>
            <div
              className="owl-carousel team-carousel position-relative"
              style={{ padding: "0 30px" }}
            >
              {mentors.length === 0 && (
                <div className="text-center py-4 text-muted">No mentors available yet.</div>
              )}
              {mentors.map((m, i) => (
                <div className="team-item" key={m._id}>
                  <img className="img-fluid w-100" src={m.profileImage || `img/team-${(i % 4) + 1}.jpg`} alt={m.name} style={{ height: 200, objectFit: "cover" }} />
                  <div className="bg-light text-center p-4" style={{ minHeight: 160 }}>
                    <h5 className="mb-3">{m.name}</h5>
                    <p className="mb-2 text-truncate">{m.bio ? (m.bio.length > 60 ? m.bio.slice(0, 60) + "..." : m.bio) : "Expert Mentor"}</p>
                    <div className="d-flex justify-content-center" style={{ minHeight: 40 }}>
                      {m.socialLinks?.twitter && (
                        <a className="mx-2 p-2" href={m.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                          <i className="fab fa-twitter" />
                        </a>
                      )}
                      {m.socialLinks?.linkedin && (
                        <a className="mx-2 p-2" href={m.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                          <i className="fab fa-linkedin-in" />
                        </a>
                      )}
                      {m.socialLinks?.youtube && (
                        <a className="mx-2 p-2" href={m.socialLinks.youtube} target="_blank" rel="noopener noreferrer">
                          <i className="fab fa-youtube" />
                        </a>
                      )}
                      {m.socialLinks?.github && (
                        <a className="mx-2 p-2" href={m.socialLinks.github} target="_blank" rel="noopener noreferrer">
                          <i className="fab fa-github" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Team End */}
        {/* Testimonial Start */}
        <div
          className="container-fluid bg-image py-5"
          style={{ margin: "90px 0" }}
        >
          <div className="container py-5">
            <div className="row align-items-center">
              <div className="col-lg-5 mb-5 mb-lg-0">
                <div className="section-title position-relative mb-4">
                  <h6 className="d-inline-block position-relative text-secondary text-uppercase pb-2">
                    Testimonials
                  </h6>
                  <h1 className="display-4">What Our Learners Say</h1>
                </div>
                <p className="m-0">
                  Hear from our community of learners and mentors who have grown together on SkillSwap. 
                  From career changes to new hobbies, every story inspires us to build a better learning ecosystem.
                </p>
              </div>
              <div className="col-lg-7">
                <div className="owl-carousel testimonial-carousel">
                {testimonials.length === 0 && (
                  <div className="bg-white p-5 text-center text-muted">No testimonials yet.</div>
                )}
                {testimonials.map((t) => (
                  <div className="bg-white p-5" key={t._id}>
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
              </div>
            </div>
          </div>
        </div>
        {/* Testimonial Start */}
        {/* Contact Start */}
        <div className="container-fluid py-5">
          <div className="container py-5">
            <div className="row align-items-center">
              <div className="col-lg-5 mb-5 mb-lg-0">
                <div
                  className="bg-light d-flex flex-column justify-content-center px-5 home-contact-box"
                  style={{ minHeight: 300 }}
                >
                  <div className="d-flex align-items-center mb-5">
                    <div className="btn-icon bg-primary mr-4">
                      <i className="fa fa-2x fa-map-marker-alt text-white" />
                    </div>
                    <div className="mt-n1">
                      <h4>Our Location</h4>
                      <p className="m-0">Bangalore, India</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-5">
                    <div className="btn-icon bg-secondary mr-4">
                      <i className="fa fa-2x fa-phone-alt text-white" />
                    </div>
                    <div className="mt-n1">
                      <h4>Call Us</h4>
                      <p className="m-0">+91 98765 43210</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="btn-icon bg-warning mr-4">
                      <i className="fa fa-2x fa-envelope text-white" />
                    </div>
                    <div className="mt-n1">
                      <h4>Email Us</h4>
                      <p className="m-0">hello@skillswap.com</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-7">
                <div className="section-title position-relative mb-4">
                  <h6 className="d-inline-block position-relative text-secondary text-uppercase pb-2">
                    Get In Touch
                  </h6>
                  <h1 className="display-4">Send Us A Message</h1>
                </div>
                <div className="contact-form">
                  {contactSent ? (
                    <div className="alert alert-success">Thank you! We'll get back to you soon.</div>
                  ) : (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await Apiservices.submitContact(contactForm);
                      setContactSent(true);
                    } catch { /* ignore */ }
                  }}>
                    <div className="row">
                      <div className="col-6 form-group">
                        <input
                          type="text"
                          className="form-control border-top-0 border-right-0 border-left-0 p-0"
                          placeholder="Your Name"
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        />
                      </div>
                      <div className="col-6 form-group">
                        <input
                          type="email"
                          className="form-control border-top-0 border-right-0 border-left-0 p-0"
                          placeholder="Your Email"
                          required
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-control border-top-0 border-right-0 border-left-0 p-0"
                        placeholder="Subject"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <textarea
                        className="form-control border-top-0 border-right-0 border-left-0 p-0"
                        rows={5}
                        placeholder="Message"
                        required
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
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
                  )}
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

export default Home;

