import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Apiservices from "../../../Apiservices";

function Team() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [catSearch, setCatSearch] = useState("");
  const [mentors, setMentors] = useState([]);
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    Promise.all([
      Apiservices.getCategories(),
      Apiservices.getTopMentors(),
    ])
      .then(([catRes, menRes]) => {
        setCategories(catRes.data.data || []);
        setMentors(menRes.data.data || []);
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
    }, 100);

    return () => {
      clearTimeout(timer);
      if (window.$ && window.$.fn.owlCarousel) {
        destroyCarousel(".team-carousel");
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
            <h1 className="text-white display-1">Top Mentors</h1>
            <div className="d-inline-flex text-white mb-5">
              <p className="m-0 text-uppercase">
                <a className="text-white" href="/">
                  Home
                </a>
              </p>
              <i className="fa fa-angle-double-right pt-1 px-3" />
              <p className="m-0 text-uppercase">Mentors</p>
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
                <input id="tm-search" type="text" className="form-control border-light"
                  style={{ padding: "30px 25px" }} placeholder="Search skills, mentors, sessions..."
                  onKeyDown={(e) => { if (e.key === "Enter") navigate(`/courses?q=${encodeURIComponent(document.getElementById("tm-search")?.value || '')}&cat=${catSearch}`); }} />
                <div className="input-group-append">
                  <button className="btn btn-secondary px-4 px-lg-5" onClick={() => navigate(`/courses?q=${encodeURIComponent(document.getElementById("tm-search")?.value || '')}&cat=${catSearch}`)}>
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Header End */}
        {/* Team Start */}
        <div className="container-fluid bg-image py-5">
          <div className="container py-5">
            <div className="section-title text-center position-relative mb-5">
              <h6 className="d-inline-block position-relative text-secondary text-uppercase pb-2">
                Top Mentors
              </h6>
              <h1 className="display-4">Learn From the Best</h1>
            </div>
            {mentors.length === 0 ? (
              <div className="text-center py-5 text-muted">No mentors available yet.</div>
            ) : (
            <div
              className="owl-carousel team-carousel position-relative"
              style={{ padding: "0 30px" }}
            >
              {mentors.map((m, i) => (
                <div className="team-item" key={m._id}>
                  <img className="img-fluid w-100" src={m.profileImage || `img/team-${(i % 6) + 1}.jpg`} alt={m.name} style={{ height: 200, objectFit: "cover" }} />
                  <div className="bg-light text-center p-4" style={{ minHeight: 140 }}>
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
            )}
          </div>
        </div>
        {/* Team End */}
      </>
    </>
  );
}

export default Team;
