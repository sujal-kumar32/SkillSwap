import React from "react";
import { Link } from "react-router-dom";

const UserLink = ({ user, name, userId, children, ...props }) => {
  const id = user?._id || userId;
  const displayName = name || user?.name || children;

  if (!id) return <span {...props}>{displayName}</span>;

  return (
    <Link
      to={`/profile/${id}`}
      onClick={(e) => e.stopPropagation()}
      style={{ color: "inherit", textDecoration: "none" }}
      onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
      onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
      {...props}
    >
      {displayName}
    </Link>
  );
};

export default UserLink;
