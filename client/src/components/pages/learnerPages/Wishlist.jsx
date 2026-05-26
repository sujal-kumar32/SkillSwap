import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../../utils/toastUtils";
import Apiservices from "../../../../Apiservices";
import { EmptyState, LoadingState, PageHeader, SessionCard } from "../../learner/LearnerUI";

const Wishlist = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await Apiservices.getWishlist({ limit: 50 });
      setSessions(res.data.data || []);
    } catch (err) {
      showToast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleToggleSave = async (session) => {
    try {
      await Apiservices.toggleWishlist(session._id);
      setSessions((prev) => prev.filter((s) => s._id !== session._id));
      showToast.success("Removed from wishlist");
    } catch (err) {
      showToast.error(err.response?.data?.message || "Failed to update");
    }
  };

  return (
    <>
      <PageHeader title="My Wishlist" subtitle="Sessions you've saved for later." />
      {loading ? (
        <LoadingState />
      ) : sessions.length > 0 ? (
        <div className="row g-4">
          {sessions.map((session) => (
            <div className="col-md-6 col-xl-4" key={session._id}>
              <SessionCard session={{ ...session, isSaved: true }} onBook={() => navigate(`/learner/book/${session._id}`)} onToggleSave={handleToggleSave} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No saved sessions" text="Browse sessions and tap the heart icon to save them for later." actionLabel="Explore Sessions" actionTo="/learner/explore" />
      )}
    </>
  );
};

export default Wishlist;
