import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Apiservices from "../../../Apiservices";
import { toast } from "react-toastify";

function Profile() {
  const navigate = useNavigate();

  // CHECK ROLE ON PAGE LOAD
  const [isMentor, setIsMentor] = useState(
    localStorage.getItem("role") === "mentor" ||
      localStorage.getItem("role") === "admin",
  );

  // APPLY FOR MENTOR
  const handleMentor = async () => {
    try {
      // Already mentor in frontend
      if (isMentor) {
        navigate("/mentor");
        return;
      }

      const res = await Apiservices.applyForMentor();

      // SUCCESS
      if (res.data.success) {
        localStorage.setItem("role", "mentor");
        localStorage.setItem("roles", JSON.stringify(["learner", "mentor"]));

        setIsMentor(true);

        toast.success("You are now a mentor!");

        navigate("/mentor");
      }

      // ALREADY MENTOR FROM BACKEND
      else if (res.data.message === "Already a mentor") {
        localStorage.setItem("role", "mentor");

        setIsMentor(true);

        toast.info("You are already a mentor");

        navigate("/mentor");
      }

      // OTHER ERRORS
      else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.log(err);

      toast.error(err?.response?.data?.message || "Error applying for mentor");
    }
  };

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h2 className="fw-bold mb-3">Choose your SkillSwap path</h2>

        <p className="text-muted">
          Continue learning or start teaching your skills
        </p>
      </div>

      <div className="row justify-content-center g-4">
        {/* MENTOR CARD */}
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg h-100 text-center border-0">
            <div className="card-body p-5">
              <div
                className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
                style={{ width: "70px", height: "70px" }}
              >
                <i className="fa fa-chalkboard-teacher fs-4"></i>
              </div>

              <h4 className="fw-bold">Mentor</h4>

              <p className="text-muted">
                Create sessions and teach others your skills
              </p>

              <button
                className={`btn px-4 ${
                  isMentor ? "btn-success" : "btn-primary"
                }`}
                onClick={handleMentor}
              >
                {isMentor ? "Go to Mentor Dashboard" : "Become Mentor"}
              </button>
            </div>
          </div>
        </div>

        {/* LEARNER CARD */}
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg h-100 text-center border-0">
            <div className="card-body p-5">
              <div
                className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
                style={{ width: "70px", height: "70px" }}
              >
                <i className="fa fa-user-graduate fs-4"></i>
              </div>

              <h4 className="fw-bold">Learner</h4>

              <p className="text-muted">
                Explore skills and keep learning new things
              </p>

              <Link to="/" className="btn btn-success px-4">
                Continue Learning
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          .card {
            transition: all 0.3s ease;
            border-radius: 20px;
          }

          .card:hover {
            transform: translateY(-6px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
          }

          .btn {
            border-radius: 12px;
            font-weight: 600;
          }
        `}
      </style>
    </div>
  );
}

export default Profile;
