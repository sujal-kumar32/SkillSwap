import React, { Children } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

import { Outlet, Navigate } from "react-router-dom";
function Layout() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (token) {
    return role === "admin" ? <Navigate to="/admin" replace /> : <Navigate to="/workspace" replace />;
  }

  return (
    <>
      <Navbar />
      <Outlet/>
      <Footer />
    </>
  );
}

export default Layout;
