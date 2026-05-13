import React from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

function About() {
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("ALL INIT RUNNING");

      if (window.$) {
        if (window.$.fn.counterUp) {
          window.$('[data-toggle="counter-up"]').counterUp({
            delay: 10,
            time: 2000,
          });
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
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
                        50
                      </h1>
                      <h6 className="text-uppercase text-white">
                        Available<span className="d-block">Skills</span>
                      </h6>
                    </div>
                  </div>
                  <div className="col-3 px-0">
                    <div className="bg-primary text-center p-4">
                      <h1 className="text-white" data-toggle="counter-up">
                        200
                      </h1>
                      <h6 className="text-uppercase text-white">
                        Live<span className="d-block">Sessions</span>
                      </h6>
                    </div>
                  </div>
                  <div className="col-3 px-0">
                    <div className="bg-secondary text-center p-4">
                      <h1 className="text-white" data-toggle="counter-up">
                        80
                      </h1>
                      <h6 className="text-uppercase text-white">
                        Expert<span className="d-block">Mentors</span>
                      </h6>
                    </div>
                  </div>
                  <div className="col-3 px-0">
                    <div className="bg-warning text-center p-4">
                      <h1 className="text-white" data-toggle="counter-up">
                        1000
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
                  Our mission is to democratize skill-sharing by creating a platform where anyone can teach 
                  and anyone can learn. We break down barriers between experts and beginners, making 
                  mentorship accessible, affordable, and effective.
                </p>
                <div className="d-flex mb-3">
                  <div className="btn-icon bg-primary mr-4">
                    <i className="fa fa-2x fa-handshake text-white" />
                  </div>
                  <div className="mt-n1">
                    <h4>Community-Driven</h4>
                    <p>
                      SkillSwap is built by learners, for learners. Our community guidelines ensure 
                      respectful, supportive, and productive interactions between mentors and mentees.
                    </p>
                  </div>
                </div>
                <div className="d-flex mb-3">
                  <div className="btn-icon bg-secondary mr-4">
                    <i className="fa fa-2x fa-brain text-white" />
                  </div>
                  <div className="mt-n1">
                    <h4>AI-Powered Matching</h4>
                    <p>
                      Our smart algorithms analyze your skills, interests, and learning goals to recommend 
                      the most relevant mentors and sessions, saving you time and accelerating your growth.
                    </p>
                  </div>
                </div>
                <div className="d-flex">
                  <div className="btn-icon bg-warning mr-4">
                    <i className="fa fa-2x fa-chart-line text-white" />
                  </div>
                  <div className="mt-n1">
                    <h4>Track Your Progress</h4>
                    <p className="m-0">
                      Monitor your learning journey with detailed progress tracking. See completed sessions, 
                      skills acquired, and milestones achieved as you grow with SkillSwap.
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
