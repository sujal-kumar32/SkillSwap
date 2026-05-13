import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Apiservices from "../../../../Apiservices";
import { EmptyState, LoadingState, PageHeader, SessionCard } from "../../learner/LearnerUI";

const ExploreSessions = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [price, setPrice] = useState("all");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      Apiservices.fetchSessions({ page: 1, limit: 100 }),
      Apiservices.getCategories().catch(() => ({ data: { data: [] } })),
    ])
      .then(([sessRes, catRes]) => {
        setSessions(sessRes.data.data || []);
        setCategories(catRes.data.data || []);
      })
      .catch((err) => {
        console.log(err);
        setError(err.response?.data?.message || "Failed to load data");
      })
      .finally(() => setLoading(false));
  }, []);

  const categoryOptions = useMemo(
    () => categories.filter((c) => c.status === "active"),
    [categories],
  );

  const filtered = useMemo(() => {
    const result = sessions.filter((session) => {
      const text = `${session.title} ${session.description} ${session.skillId?.name}`.toLowerCase();
      const matchSearch = text.includes(query.toLowerCase());
      const catMatch = category === "all" || session.categoryId?._id === category || session.categoryId === category || session.skillId?.categoryId?._id === category;
      const matchCategory = catMatch;
      const matchPrice = price === "all" || (price === "free" ? !session.price : session.price > 0);
      const matchType = type === "all" || session.sessionType === type;
      return matchSearch && matchCategory && matchPrice && matchType;
    });

    if (sort === "price-low") return result.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sort === "price-high") return result.sort((a, b) => (b.price || 0) - (a.price || 0));
    if (sort === "rating") return result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
          <div className="col-lg-3">
            <input className="form-control rounded-pill" placeholder="Search skills, mentors, sessions..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="col-sm-6 col-lg-2">
            <select className="form-select rounded-pill" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
              <option value="all">All Categories</option>
              {categoryOptions.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
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
          <div className="col-sm-6 col-lg-3">
            <select className="form-select rounded-pill" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="latest">Latest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
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
