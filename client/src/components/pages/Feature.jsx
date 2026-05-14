import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Feature() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [catSearch, setCatSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/api/categories").then(r=>r.json()).then(res => setCategories(res.data || [])).catch(()=>{});
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
                <select style={{ width: 140, padding: "10px", border: "1px solid #dee2e6", borderRadius: "0", background: "#fff" }}
                  value={catSearch} onChange={(e) => setCatSearch(e.target.value)}>
                  <option value="">All Skills</option>
                  {categories.filter((c) => c.status !== "inactive").map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                <input id="ft-search" type="text" className="form-control border-light"
                  style={{ padding: "30px 25px" }} placeholder="Search skills, mentors, sessions..."
                  onKeyDown={(e) => { if (e.key === "Enter") navigate(`/courses?q=${encodeURIComponent(document.getElementById("ft-search")?.value || '')}&cat=${catSearch}`); }} />
                <div className="input-group-append">
                  <button className="btn btn-secondary px-4 px-lg-5" onClick={() => navigate(`/courses?q=${encodeURIComponent(document.getElementById("ft-search")?.value || '')}&cat=${catSearch}`)}>
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Header End */}
        {/* Feature Start */}
        <div className="container-fluid bg-image py-5">
          <div className="container py-5">
            <div className="row">
              <div className="col-lg-7 mb-5 mb-lg-0">
                <div className="section-title position-relative mb-4">
                  <h6 className="d-inline-block position-relative text-secondary text-uppercase pb-2">
                    Why SkillSwap?
                  </h6>
                  <h1 className="display-4">
                    Everything You Need to Grow
                  </h1>
                </div>
                <p className="mb-4 pb-2">
                  SkillSwap combines the best of mentorship, technology, and community to create 
                  a learning experience that's personal, practical, and effective. Here's what makes us different.
                </p>
                <div className="d-flex mb-3">
                  <div className="btn-icon bg-primary mr-4">
                    <i className="fa fa-2x fa-users text-white" />
                  </div>
                  <div className="mt-n1">
                    <h4>Skill-Based Learning</h4>
                    <p>
                      Focus on practical skills that matter. Whether it's coding, music, or public speaking, 
                      our sessions are hands-on and project-based.
                    </p>
                  </div>
                </div>
                <div className="d-flex mb-3">
                  <div className="btn-icon bg-secondary mr-4">
                    <i className="fa fa-2x fa-robot text-white" />
                  </div>
                  <div className="mt-n1">
                    <h4>AI Recommendations</h4>
                    <p>
                      Get personalized session and mentor suggestions powered by AI that learns your 
                      preferences, goals, and learning style.
                    </p>
                  </div>
                </div>
                <div className="d-flex mb-3">
                  <div className="btn-icon bg-warning mr-4">
                    <i className="fa fa-2x fa-calendar-check text-white" />
                  </div>
                  <div className="mt-n1">
                    <h4>Real-Time Bookings</h4>
                    <p>
                      Book sessions in real-time with instant confirmation. Choose from available slots 
                      that fit your schedule perfectly.
                    </p>
                  </div>
                </div>
                <div className="d-flex">
                  <div className="btn-icon bg-info mr-4">
                    <i className="fa fa-2x fa-chart-simple text-white" />
                  </div>
                  <div className="mt-n1">
                    <h4>Progress Tracking</h4>
                    <p className="m-0">
                      Track every session you complete, skill you learn, and milestone you achieve. 
                      Your learning journey, visualized.
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




