import React, { useState, useEffect, useCallback } from "react";
import Apiservices from "../../../Apiservices";
import { useAuth } from "../../App";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../utils/toastUtils";

const FollowButton = ({ userId, onToggle, size }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hovering, setHovering] = useState(false);

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
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={`btn rounded-pill fw-semibold ${following ? "btn-outline-danger" : "btn-primary"} ${size === "sm" ? "btn-sm px-3" : "px-4"}`}
      style={size === "sm" ? { minWidth: 90, fontSize: "0.75rem" } : { minWidth: 120 }}
    >
      {loading ? (
        <span className="spinner-border spinner-border-sm" role="status" />
      ) : following && hovering ? (
        <><i className="fa fa-times" style={{ marginRight: 10 }} />Unfollow</>
      ) : following ? (
        <><i className="fa fa-check" style={{ marginRight: 10 }} />Following</>
      ) : (
        <><i className="fa fa-plus" style={{ marginRight: 10 }} />Follow</>
      )}
    </button>
  );
};

export default FollowButton;
