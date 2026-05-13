import React from "react";
import { Link, NavLink } from "react-router-dom";

function AdminNavbar() {
  return (
    <nav className="navbar navbar-expand-lg bg-white navbar-light py-2 px-lg-4 shadow-sm">
      <Link to="/admin" className="navbar-brand">
        <h6 className="mb-0 text-primary fw-bold">
          <i className="fa fa-shield-halved me-2" />
          SkillSwap Admin
        </h6>
      </Link>
    </nav>
  );
}

export default AdminNavbar;
