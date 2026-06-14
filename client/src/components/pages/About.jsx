import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Apiservices from "../../../Apiservices";

function About() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [catSearch, setCatSearch] = useState("");
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState("");
  const [stats, setStats] = useState(null);
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    Promise.all([
      Apiservices.getCategories(),
      Apiservices.getPublicStats(),
    ])
      .then(([catRes, statRes]) => {
        setCategories(catRes.data.data || []);
        setStats(statRes.data.data || null);
      })
      .catch(() => setCatError("Failed to load data"))
      .finally(() => { setCatLoading(false); setDataReady(true); });
  }, []);

  useEffect(() => {
    if (!dataReady) return;

    const timer = setTimeout(() => {

      if (window.$) {
        if (window.$.fn.counterUp) {
          window.$('[data-toggle="counter-up"]').counterUp({
            delay: 10,
            time: 2000,
          });
        }
      }
    }, 100);

    return () => clearTimeout(timer);
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
            <h1 className="text-white display-1">About</h1>
            <div className="d-inline-flex text-white mb-5">
              <p className="m-0 text-uppercase">
                <Link className="text-white" to="/">
                  Home
                </Link>
              </p>
              <i className="fa fa-angle-double-right pt-1 px-3" />
              <p className="m-0 text-uppercase">About</p>
            </div>
            <div
              className="mx-auto mb-5"
              style={{ width: "100%", maxWidth: 600 }}
            >
              <div className="input-group">
                <select style={{ width: 140, padding: "10px", border: "1px solid #dee2e6", borderRadius: "0", background: "#fff" }}
                  value={catSearch} onChange={(e) => setCatSearch(e.target.value)}
                  disabled={catLoading}>
                  <option value="">{catLoading ? "Loading..." : catError ? "Unavailable" : "All Skills"}</option>
                  {categories.filter((c) => c.status !== "inactive").map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                <input id="ab-search" type="text" className="form-control border-light"
                  style={{ padding: "30px 25px" }} placeholder="Search skills, mentors, sessions..."
                  onKeyDown={(e) => { if (e.key === "Enter") navigate(`/courses?q=${encodeURIComponent(document.getElementById("ab-search")?.value || '')}&cat=${catSearch}`); }} />
                <div className="input-group-append">
                  <button className="btn btn-secondary px-4 px-lg-5" onClick={() => navigate(`/courses?q=${encodeURIComponent(document.getElementById("ab-search")?.value || '')}&cat=${catSearch}`)}>
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
              <div className="col-lg-5 mb-5 mb-lg-0" style={{ minHeight: 500 }}>
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
                    Where Skills Meet Opportunity
                  </h1>
                </div>
                <p>
                  SkillSwap is a peer-to-peer mentorship platform built for the modern learner. 
                  We believe everyone has something valuable to teach and something new to learn. 
                  Our platform connects passionate mentors with eager learners through live, 
                  interactive sessions across development, design, music, sports, and more.
                </p>
                <p>
                  Unlike traditional e-learning platforms with pre-recorded courses, SkillSwap emphasizes 
                  real-time interaction, personalized feedback, and community-driven growth. 
                  Our AI-powered recommendation system helps you discover the perfect mentor and session 
                  based on your interests and goals.
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
        <div className="container-fluid bg-image py-5">
          <div className="container py-5">
            <div className="row">
              <div className="col-lg-7 mb-5 mb-lg-0">
                <div className="section-title position-relative mb-4">
                  <h6 className="d-inline-block position-relative text-secondary text-uppercase pb-2">
                    Our Mission
                  </h6>
                  <h1 className="display-4">
                    Empowering Peer-to-Peer Learning
                  </h1>
                </div>
                <p className="mb-4 pb-2">
                  Our mission is to make skill-sharing accessible to everyone. We connect passionate mentors 
                  with eager learners through live sessions, powered by AI guidance, gamified progression, 
                  and a thriving community.
                </p>
                <div className="d-flex mb-3">
                  <div className="btn-icon bg-primary mr-4">
                    <i className="fa fa-2x fa-video text-white" />
                  </div>
                  <div className="mt-n1">
                    <h4>Live Mentorship Sessions</h4>
                    <p>
                      Real-time 1-on-1 or group sessions with vetted mentors. Learn coding, design, music, 
                      public speaking, and more — with instant feedback and personalized attention.
                    </p>
                  </div>
                </div>
                <div className="d-flex mb-3">
                  <div className="btn-icon bg-secondary mr-4">
                    <i className="fa fa-2x fa-robot text-white" />
                  </div>
                  <div className="mt-n1">
                    <h4>SwapMind AI Assistant</h4>
                    <p>
                      An AI guide that helps you discover sessions, creates personalized learning roadmaps, 
                      and answers questions about the platform — available 24/7 from any page.
                    </p>
                  </div>
                </div>
                <div className="d-flex mb-3">
                  <div className="btn-icon bg-success mr-4">
                    <i className="fa fa-2x fa-trophy text-white" />
                  </div>
                  <div className="mt-n1">
                    <h4>Gamified Learning Journey</h4>
                    <p>
                      Earn XP, level up, collect badges, and climb leaderboards. Complete sessions to earn 
                      PDF certificates and Skill Credits for future learning.
                    </p>
                  </div>
                </div>
                <div className="d-flex">
                  <div className="btn-icon bg-warning mr-4">
                    <i className="fa fa-2x fa-wallet text-white" />
                  </div>
                  <div className="mt-n1">
                    <h4>Wallet &amp; Earnings</h4>
                    <p className="m-0">
                      Learners pay via Razorpay or Skill Credits. Mentors earn real money, track analytics, 
                      manage availability with Google Calendar sync, and withdraw earnings seamlessly.
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

export default About;




