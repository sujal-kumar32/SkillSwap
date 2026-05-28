import React, { useState, useEffect, useCallback } from "react";
import Apiservices from "../../../Apiservices";
import { useAuth } from "../../App";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../utils/toastUtils";

const FollowButton = ({ userId, onToggle }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || userId === user._id) return;
    let cancelled = false;
    Apiservices.getFollowStatus(userId)
      .then((res) => { if (!cancelled) setFollowing(res.data.data.following); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [userId, user]);

  const handleClick = useCallback(async () => {
    if (!user) { navigate("/login"); return; }
    if (userId === user._id) return;
    setLoading(true);
    try {
      const res = await Apiservices.toggleFollow(userId);
      const nowFollowing = res.data.following;
      setFollowing(nowFollowing);
      showToast.success(nowFollowing ? "Followed" : "Unfollowed");
      onToggle?.(nowFollowing);
    } catch {
      showToast.error("Failed to update follow status");
    } finally {
      setLoading(false);
    }
  }, [userId, user, navigate, onToggle]);

  if (!user || userId === user._id) return null;

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`btn rounded-pill px-4 fw-semibold ${following ? "btn-outline-secondary" : "btn-primary"}`}
      style={{ minWidth: 120 }}
    >
      {loading ? (
        <span className="spinner-border spinner-border-sm" role="status" />
      ) : following ? (
        <><i className="fa fa-check me-2" />Following</>
      ) : (
        <><i className="fa fa-plus me-2" />Follow</>
      )}
    </button>
  );
};

export default FollowButton;
