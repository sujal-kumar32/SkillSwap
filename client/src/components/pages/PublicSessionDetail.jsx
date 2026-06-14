import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Apiservices from "../../../Apiservices";

const fallbackImgs = ["img/courses-1.jpg","img/courses-2.jpg","img/courses-3.jpg","img/courses-4.jpg","img/courses-5.jpg","img/courses-6.jpg"];

function PublicSessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [related, setRelated] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [detailRes, catRes] = await Promise.all([
          Apiservices.fetchSessionDetails(id),
          Apiservices.getCategories().catch(() => ({ data: { data: [] } })),
        ]);
        setSession(detailRes.data.data);
        setCategories(catRes.data.data || []);

        const relatedRes = await Apiservices.fetchSessions().catch(() => ({ data: { data: [] } }));
        setRelated((relatedRes.data.data || []).filter((s) => s._id !== id));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load session");
        setSession(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="jumbotron jumbotron-fluid page-header position-relative overlay-bottom" style={{ marginBottom: 90 }}>
        <div className="container text-center py-5">
          <div className="spinner-border text-light mb-3" role="status" style={{ width: "3rem", height: "3rem" }} />
          <p className="text-white">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="jumbotron jumbotron-fluid page-header position-relative overlay-bottom" style={{ marginBottom: 90 }}>
        <div className="container text-center py-5">
          <h1 className="text-white display-1">Session Not Found</h1>
          <p className="text-white mb-4">{error || "This session may no longer be available."}</p>
          <Link to="/courses" className="btn btn-primary py-3 px-5">Browse Sessions</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="jumbotron jumbotron-fluid page-header position-relative overlay-bottom" style={{ marginBottom: 90 }}>
        <div className="container text-center py-5">
          <h1 className="text-white display-1">{session.title}</h1>
          <div className="d-inline-flex text-white mb-5">
            <p className="m-0 text-uppercase"><Link className="text-white" to="/">Home</Link></p>
            <i className="fa fa-angle-double-right pt-1 px-3" />
            <p className="m-0 text-uppercase">Session Detail</p>
          </div>
        </div>
      </div>

      <div className="container-fluid bg-image py-5">
        <div className="container py-5">
          <div className="row">
            <div className="col-lg-8">
              <div className="mb-5">
                {session.thumbnail && (
                  <img className="img-fluid rounded w-100 mb-4" src={session.thumbnail} alt={session.title} style={{ maxHeight: 400, objectFit: "cover" }} />
                )}
                <div className="section-title position-relative mb-4">
                  <h6 className="d-inline-block position-relative text-secondary text-uppercase pb-2">
                    {session.skillId?.categoryId?.name || session.skillId?.name || "Session"} • {session.sessionType || "online"}
                  </h6>
                  <h1 className="display-4">{session.title}</h1>
                </div>
                <p style={{ whiteSpace: "pre-wrap" }}>{session.description || "No description available."}</p>
              </div>

              <h2 className="mb-3">Related Sessions</h2>
              <div className="row">
                {related.slice(0, 3).map((s, i) => (
                  <div className="col-lg-4 col-md-6 pb-4" key={s._id}>
                    <Link className="courses-list-item position-relative d-block overflow-hidden mb-2" to={`/courses/${s._id}`}>
                      <img className="img-fluid" src={s.thumbnail || fallbackImgs[i % 6]} alt={s.title} />
                      <div className="courses-text">
                        <h4 className="text-center text-white px-3">{s.title}</h4>
                        <div className="border-top w-100 mt-3">
                          <div className="d-flex justify-content-between p-4">
                            <span className="text-white"><i className="fa fa-user mr-2" />{s.mentorId?.name || "Mentor"}</span>
                            <span className="text-white"><i className="fa fa-star mr-2" />{s.rating || "—"}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-lg-4 mt-5 mt-lg-0">
              <div className="bg-primary mb-5 py-3">
                <h3 className="text-white py-3 px-4 m-0">Session Details</h3>
                <div className="d-flex justify-content-between border-bottom px-4">
                  <h6 className="text-white my-3">Mentor</h6>
                  <h6 className="text-white my-3">
                    <Link to={`/profile/${session.mentorId?._id}`} className="text-white" style={{ textDecoration: "underline" }}>
                      {session.mentorId?.name || "SkillSwap Mentor"}
                    </Link>
                  </h6>
                </div>
                <div className="d-flex justify-content-between border-bottom px-4">
                  <h6 className="text-white my-3">Rating</h6>
                  <h6 className="text-white my-3">{session.rating ? `${session.rating}` : "—"}</h6>
                </div>
                <div className="d-flex justify-content-between border-bottom px-4">
                  <h6 className="text-white my-3">Duration</h6>
                  <h6 className="text-white my-3">{session.duration || 60} min</h6>
                </div>
                <div className="d-flex justify-content-between border-bottom px-4">
                  <h6 className="text-white my-3">Skill Level</h6>
                  <h6 className="text-white my-3">{session.skillId?.level || "All Levels"}</h6>
                </div>
                <div className="d-flex justify-content-between border-bottom px-4">
                  <h6 className="text-white my-3">Session Type</h6>
                  <h6 className="text-white my-3">{session.sessionType || "online"}</h6>
                </div>
                <div className="d-flex justify-content-between px-4">
                  <h6 className="text-white my-3">Spots</h6>
                  <h6 className="text-white my-3">{session.spotsFilled || 0} / {session.maxLearners || "—"} filled</h6>
                </div>
                <h5 className="text-white py-3 px-4 m-0">
                  {session.price ? `₹${session.price}` : "Free"}
                </h5>
                <div className="py-3 px-4">
                  <button
                    className="btn btn-block btn-secondary py-3 px-5"
                    onClick={() => navigate(`/login?redirect=/courses/${session._id}`)}
                  >
                    Login to Book
                  </button>
                </div>
              </div>

              <div className="mb-5">
                <h2 className="mb-3">Categories</h2>
                <ul className="list-group list-group-flush">
                  {categories.filter((c) => c.status !== "inactive").slice(0, 6).map((c) => (
                    <li className="list-group-item d-flex justify-content-between align-items-center px-0" key={c._id}>
                      <Link to={`/courses?cat=${c._id}`} className="text-decoration-none h6 m-0">{c.name}</Link>
                      <span className="badge badge-primary badge-pill">{c.sessionCount || 0}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PublicSessionDetail;
