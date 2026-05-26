import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Apiservices from "../../../../Apiservices";
import { showToast } from "../../../utils/toastUtils";
import { EmptyState, LoadingState, PageHeader, SessionCard } from "../../learner/LearnerUI";

const ExploreSessions = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const skillIdParam = searchParams.get("skillId");
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
  const [aiSearch, setAiSearch] = useState(false);
  const [aiKeywords, setAiKeywords] = useState("");
  const [aiSearching, setAiSearching] = useState(false);

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

  const skillName = useMemo(() => {
    if (!skillIdParam) return null;
    const s = sessions.find((s) => s.skillId?._id === skillIdParam);
    return s?.skillId?.name || null;
  }, [sessions, skillIdParam]);

  const filtered = useMemo(() => {
    const result = sessions.filter((session) => {
      const text = `${session.title} ${session.description} ${session.skillId?.name}`.toLowerCase();
      const searchText = aiKeywords ? aiKeywords : query;
      const matchSearch = !searchText || searchText.split(",").some((kw) => text.includes(kw.trim().toLowerCase()));
      const catMatch = category === "all" || session.categoryId?._id === category || session.categoryId === category || session.skillId?.categoryId?._id === category;
      const matchPrice = price === "all" || (price === "free" ? !session.price : session.price > 0);
      const matchType = type === "all" || session.sessionType === type;
      const matchSkill = !skillIdParam || session.skillId?._id === skillIdParam;
      return matchSearch && catMatch && matchPrice && matchType && matchSkill;
    });

    if (sort === "price-low") return result.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sort === "price-high") return result.sort((a, b) => (b.price || 0) - (a.price || 0));
    if (sort === "rating") return result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [sessions, query, category, price, type, sort, aiKeywords]);

  const doAISearch = async () => {
    if (!query.trim()) {
      showToast.warning("Enter a search query first");
      return;
    }
    setAiSearching(true);
    try {
      const res = await Apiservices.searchSessions({ query: query.trim() });
      const kws = res.data.data.keywords + ", " + res.data.data.skills;
      setAiKeywords(kws);
      setAiSearch(true);
      showToast.success("AI search complete");
    } catch (err) {
      showToast.error(err.response?.data?.message || "AI search failed");
    } finally {
      setAiSearching(false);
    }
  };

  const clearAISearch = () => {
    setAiKeywords("");
    setAiSearch(false);
  };

  const pageSize = 6;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));

  return (
    <>
      <PageHeader title="Explore Sessions" subtitle={skillName ? `Sessions for "${skillName}"` : "Search, filter, and book learning sessions from mentors."} />
      {error && <div className="alert alert-danger rounded-4">{error}</div>}

      {skillIdParam && skillName && (
        <div className="d-flex align-items-center gap-2 mb-4">
          <span className="badge rounded-pill px-3 py-2" style={{ background: "rgba(13,110,253,0.1)", color: "#0d6efd", fontWeight: 600, fontSize: "0.88rem" }}>
            <i className="fa fa-tag me-1" />{skillName}
          </span>
          <button className="btn btn-sm btn-outline-secondary rounded-pill" onClick={() => navigate("/learner/explore")}>
            Clear
          </button>
        </div>
      )}

      <div className="learner-card p-4 mb-4">
        <div className="row g-3">
          <div className="col-lg-4">
            <div className="d-flex gap-2">
              <div className="position-relative flex-grow-1">
                <input className="form-control rounded-pill" placeholder="Search skills, mentors, sessions..." value={query} onChange={(e) => { setQuery(e.target.value); if (aiSearch) clearAISearch(); }} />
              </div>
              <button className="btn btn-outline-primary rounded-pill px-3 fw-semibold" onClick={doAISearch} disabled={aiSearching || !query.trim()}
                title="AI-powered search" style={{ minWidth: 44 }}>
                {aiSearching ? <span className="spinner-border spinner-border-sm" /> : <i className="fa fa-magic" />}
              </button>
              <button className="btn btn-primary rounded-pill px-3 fw-semibold" onClick={() => { setQuery(""); clearAISearch(); }} disabled={!query && !aiKeywords}
                style={{ minWidth: 44 }}>
                <i className="fa fa-search" />
              </button>
            </div>
            {aiKeywords && (
              <div className="mt-2 d-flex align-items-center gap-2">
                <span style={{ background: "linear-gradient(135deg, #0d6efd, #0a58ca)", color: "white", padding: "4px 14px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.3px" }}>
                  <i className="fa fa-magic me-1" />AI: {aiKeywords}
                </span>
                <button className="btn btn-sm btn-outline-secondary rounded-pill" onClick={clearAISearch}>Clear</button>
              </div>
            )}
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
          <div className="col-sm-6 col-lg-2">
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
                {aiSearch ? (
                  <SessionCard session={{ ...session, isAiRecommended: true }} onBook={() => navigate(`/learner/book/${session._id}`)} />
                ) : (
                  <SessionCard session={session} onBook={() => navigate(`/learner/book/${session._id}`)} />
                )}
              </div>
            ))}
          </div>
          <div className="d-flex justify-content-center mt-5">
            <div className="d-flex gap-3">
              <button className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-semibold" disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}><i className="fa fa-chevron-left" style={{ marginRight: 10 }} />Prev</button>
              <button className="btn btn-primary rounded-pill px-4 py-2 fw-semibold">Page {page} / {pages}</button>
              <button className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-semibold" disabled={page === pages} onClick={() => setPage((prev) => prev + 1)}>Next<i className="fa fa-chevron-right ms-2" /></button>
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
