import React, { Children } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Home from "./pages/Home";
function Layout() {
  return (
    <>
      <Navbar />
      {Children}
      <Footer />
    </>
  );
}

export default Layout;
