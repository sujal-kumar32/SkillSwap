import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Apiservices from "../../../../Apiservices";
import { EmptyState, LoadingState, PageHeader, SessionCard } from "../../learner/LearnerUI";

const ExploreSessions = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [price, setPrice] = useState("all");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("recommended");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await Apiservices.fetchSessions();
        setSessions(response.data.data || []);
      } catch (error) {
        console.log(error);
        setSessions([]);
        setError(error.response?.data?.message || "Failed to load sessions");
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  const categories = useMemo(
    () => ["all", ...new Set(sessions.map((session) => session.skillId?.categoryId?.name || "Learning"))],
    [sessions],
  );

  const filtered = useMemo(() => {
    const result = sessions.filter((session) => {
      const text = `${session.title} ${session.description} ${session.skillId?.name}`.toLowerCase();
      const matchSearch = text.includes(query.toLowerCase());
      const matchCategory = category === "all" || (session.skillId?.categoryId?.name || "Learning") === category;
      const matchPrice = price === "all" || (price === "free" ? !session.price : session.price > 0);
      const matchType = type === "all" || session.sessionType === type;
      return matchSearch && matchCategory && matchPrice && matchType;
    });

    if (sort === "price-low") return result.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sort === "rating") return result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return result.sort((a, b) => Number(b.isAiRecommended) - Number(a.isAiRecommended));
  }, [sessions, query, category, price, type, sort]);

  const pageSize = 6;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));

  return (
    <>
      <PageHeader title="Explore Sessions" subtitle="Search, filter, and book learning sessions from mentors." />
      {error && <div className="alert alert-danger rounded-4">{error}</div>}

      <div className="learner-card p-4 mb-4">
        <div className="row g-3">
          <div className="col-lg-4">
            <input className="form-control rounded-pill" placeholder="Search skills, mentors, sessions..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="col-sm-6 col-lg-2">
            <select className="form-select rounded-pill" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((item) => <option key={item} value={item}>{item === "all" ? "All categories" : item}</option>)}
            </select>
          </div>
          <div className="col-sm-6 col-lg-2">
            <select className="form-select rounded-pill" value={price} onChange={(e) => setPrice(e.target.value)}>
              <option value="all">Free & Paid</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div className="col-sm-6 col-lg-2">
            <select className="form-select rounded-pill" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="all">Online & Offline</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>
          <div className="col-sm-6 col-lg-2">
            <select className="form-select rounded-pill" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="recommended">Recommended</option>
              <option value="rating">Top rated</option>
              <option value="price-low">Price low</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? <LoadingState /> : paginated.length ? (
        <>
          <div className="row g-4">
            {paginated.map((session) => (
              <div className="col-md-6 col-xl-4" key={session._id}>
                <SessionCard session={session} onBook={() => navigate(`/learner/book/${session._id}`)} />
              </div>
            ))}
          </div>
          <div className="d-flex justify-content-center mt-4">
            <div className="btn-group">
              <button className="btn btn-outline-primary" disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}>Prev</button>
              <button className="btn btn-primary">Page {page} / {pages}</button>
              <button className="btn btn-outline-primary" disabled={page === pages} onClick={() => setPage((prev) => prev + 1)}>Next</button>
            </div>
          </div>
        </>
      ) : (
        <EmptyState title="No sessions found" text="Try changing your search or filters." />
      )}
    </>
  );
};

export default ExploreSessions;
