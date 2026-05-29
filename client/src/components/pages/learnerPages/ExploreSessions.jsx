import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Apiservices from "../../../../Apiservices";
import { showToast } from "../../../utils/toastUtils";
import { EmptyState, PageHeader, SessionCard, SessionCardSkeleton } from "../../learner/LearnerUI";
import Pagination from "../../Pagination";

const ExploreSessions = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const skillIdParam = searchParams.get("skillId");
  const [sessions, setSessions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [price, setPrice] = useState("all");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");
  const [aiSearch, setAiSearch] = useState(false);
  const [aiKeywords, setAiKeywords] = useState("");
  const [aiSearching, setAiSearching] = useState(false);
  const [savedSessionIds, setSavedSessionIds] = useState(new Set());

  const debounceRef = useRef(null);

  const doSearch = useCallback((term) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setActiveSearch(term);
    setPage(1);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setActiveSearch(query);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleToggleSave = useCallback(async (session) => {
    try {
      const res = await Apiservices.toggleWishlist(session._id);
      if (res.data.saved) {
        setSavedSessionIds((prev) => new Set(prev).add(session._id));
      } else {
        setSavedSessionIds((prev) => { const next = new Set(prev); next.delete(session._id); return next; });
      }
      showToast.success(res.data.message);
    } catch (err) {
      showToast.error(err.response?.data?.message || "Failed to update");
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 6 };
    if (skillIdParam) params.skill = skillIdParam;
    if (category !== "all") params.category = category;
    if (price !== "all") params.price = price === "free" ? "0" : "paid";
    if (type !== "all") params.sessionType = type;
    if (sort !== "latest") params.sort = sort;
    if (aiKeywords) params.search = aiKeywords;
    else if (activeSearch) params.search = activeSearch;

    Promise.all([
      Apiservices.fetchSessions(params),
      Apiservices.getCategories().catch(() => ({ data: { data: [] } })),
    ])
      .then(([sessRes, catRes]) => {
        setSessions(sessRes.data.data || []);
        setTotalPages(sessRes.data.pages || 1);
        setCategories(catRes.data.data || []);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load data");
      })
      .finally(() => setLoading(false));
  }, [page, category, price, type, sort, activeSearch, aiKeywords, skillIdParam]);

  const categoryOptions = useMemo(
    () => categories.filter((c) => c.status === "active"),
    [categories],
  );

  const skillName = useMemo(() => {
    if (!skillIdParam) return null;
    const s = sessions.find((s) => s.skillId?._id === skillIdParam);
    return s?.skillId?.name || null;
  }, [sessions, skillIdParam]);

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
      setPage(1);
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

  return (
    <>
      <PageHeader title="Explore Sessions" subtitle={skillName ? `Sessions for "${skillName}"` : "Search, filter, and book learning sessions from mentors."} />
      {error && <div className="alert alert-danger rounded-4">{error}</div>}

      {skillIdParam && skillName && (
        <div className="d-flex align-items-center gap-2 mb-4">
          <span className="badge rounded-pill px-3 py-2" style={{ background: "rgba(13,110,253,0.1)", color: "#0d6efd", fontWeight: 600, fontSize: "0.88rem" }}>
            <i className="fa fa-tag" style={{ marginRight: 6 }} />{skillName}
          </span>
          <button className="btn btn-sm btn-outline-secondary rounded-pill" onClick={() => navigate("/learner/explore")}>
            Clear
          </button>
        </div>
      )}

      <div className="learner-card p-4 mb-4">
        <div className="row g-3">
          <div className="col-lg-4">
            <div className="d-flex" style={{ gap: 8 }}>
              <div className="position-relative flex-grow-1">
                <input className="form-control rounded-pill" placeholder="Search skills, mentors, sessions..." value={query}
                  onChange={(e) => { setQuery(e.target.value); if (aiSearch) clearAISearch(); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { doSearch(query); if (aiSearch) clearAISearch(); } }} />
              </div>
              <button className="btn btn-outline-primary rounded-pill px-3 fw-semibold" onClick={doAISearch} disabled={aiSearching || !query.trim()}
                title="AI-powered search" style={{ minWidth: 44 }}>
                {aiSearching ? <span className="spinner-border spinner-border-sm" /> : <i className="fa fa-magic" />}
              </button>
              <button className="btn btn-primary rounded-pill px-3 fw-semibold" onClick={() => { doSearch(query); if (aiSearch) clearAISearch(); }} disabled={!query && !aiKeywords}
                style={{ minWidth: 44 }}>
                <i className="fa fa-search" />
              </button>
            </div>
            {aiKeywords && (
              <div className="mt-2 d-flex align-items-center gap-2">
                <span style={{ background: "linear-gradient(135deg, #0d6efd, #0a58ca)", color: "white", padding: "4px 14px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.3px" }}>
                  <i className="fa fa-magic" style={{ marginRight: 6 }} />AI: {aiKeywords}
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
            <select className="form-select rounded-pill" value={price} onChange={(e) => { setPrice(e.target.value); setPage(1); }}>
              <option value="all">Free & Paid</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div className="col-sm-6 col-lg-2">
            <select className="form-select rounded-pill" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
              <option value="all">Online & Offline</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>
          <div className="col-sm-6 col-lg-2">
            <select className="form-select rounded-pill" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
              <option value="latest">Latest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="row g-4">
          {Array.from({ length: 6 }).map((_, i) => <SessionCardSkeleton key={i} />)}
        </div>
      ) : sessions.length ? (
        <>
          <div className="row g-4">
            {sessions.map((session) => (
              <div className="col-md-6 col-xl-4" key={session._id}>
                <SessionCard session={{ ...session, isSaved: savedSessionIds.has(session._id) }} onBook={() => navigate(`/learner/book/${session._id}`)} onToggleSave={handleToggleSave} />
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState title="No sessions found" text="Try changing your search or filters." />
      )}
    </>
  );
};

export default ExploreSessions;
