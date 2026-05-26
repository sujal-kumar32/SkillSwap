import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

import { Outlet } from "react-router-dom";
function Layout() {
  return (
    <div className="bg-image">
      <Navbar />
      <Outlet/>
      <Footer />
    </div>
  );
}

export default Layout;
