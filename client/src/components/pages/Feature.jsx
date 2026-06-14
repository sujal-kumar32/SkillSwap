import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Apiservices from "../../../Apiservices";

function Feature() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [catSearch, setCatSearch] = useState("");

  useEffect(() => {
    Apiservices.getCategories().then(res => setCategories(res.data.data || [])).catch(() => {});
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
                <a className="text-white" href="/">
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
                  SkillSwap combines live mentorship, gamified progression, and AI-powered guidance to create 
                  a learning experience that's personal, practical, and effective. Here's what makes us different.
                </p>
                <div className="d-flex mb-3">
                  <div className="btn-icon bg-primary mr-4">
                    <i className="fa fa-2x fa-video text-white" />
                  </div>
                  <div className="mt-n1">
                    <h4>Live Peer-to-Peer Sessions</h4>
                    <p>
                      Learn directly from skilled mentors through live 1-on-1 or group sessions. 
                      Real-time interaction, personalized feedback, and hands-on practice — not pre-recorded videos.
                    </p>
                  </div>
                </div>
                <div className="d-flex mb-3">
                  <div className="btn-icon bg-secondary mr-4">
                    <i className="fa fa-2x fa-robot text-white" />
                  </div>
                  <div className="mt-n1">
                    <h4>SwapMind AI Guide</h4>
                    <p>
                      Meet your AI onboarding assistant. SwapMind greets new users, recommends sessions, 
                      creates personalized learning roadmaps, and answers platform questions in real-time.
                    </p>
                  </div>
                </div>
                <div className="d-flex mb-3">
                  <div className="btn-icon bg-success mr-4">
                    <i className="fa fa-2x fa-wallet text-white" />
                  </div>
                  <div className="mt-n1">
                    <h4>Wallet &amp; Skill Credits</h4>
                    <p>
                      Pay for sessions via Razorpay or earn Skill Credits — a virtual currency. 
                      Mentors set credit costs based on expertise, and learners track all transactions in their wallet.
                    </p>
                  </div>
                </div>
                <div className="d-flex mb-3">
                  <div className="btn-icon bg-warning mr-4">
                    <i className="fa fa-2x fa-trophy text-white" />
                  </div>
                  <div className="mt-n1">
                    <h4>XP, Levels &amp; Badges</h4>
                    <p>
                      Earn XP by completing sessions and writing reviews. Level up, unlock achievement badges, 
                      and climb the mentor or learner leaderboard to showcase your progress.
                    </p>
                  </div>
                </div>
                <div className="d-flex mb-3">
                  <div className="btn-icon bg-info mr-4">
                    <i className="fa fa-2x fa-comments text-white" />
                  </div>
                  <div className="mt-n1">
                    <h4>Real-Time Chat &amp; Messaging</h4>
                    <p className="m-0">
                      Stay connected with built-in real-time chat. Send DMs, share files, use emoji reactions, 
                      and get read receipts — all within your session workspace.
                    </p>
                  </div>
                </div>
                <div className="d-flex">
                  <div className="btn-icon bg-danger mr-4">
                    <i className="fa fa-2x fa-certificate text-white" />
                  </div>
                  <div className="mt-n1">
                    <h4>Certificates &amp; Reviews</h4>
                    <p className="m-0">
                      Auto-generated PDF certificates after completing a skill session. Leave 5-star reviews 
                      for mentors and build your reputation with trust scores and ratings.
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




