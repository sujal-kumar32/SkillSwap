import React from "react";
import Home from "./pages/Home";
import About from "./pages/About";
import Course from "./pages/Course";
import Detail from "./pages/Detail";
import Team from "./pages/Team";
import Feature from "./pages/Feature";
import Testimonial from "./pages/Testimonial";
import Contact from "./pages/Contact";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/courses" element={<Course />} />
          <Route path="/detail" element={<Detail />} />
          <Route path="/features" element={<Feature />} />
          <Route path="/team" element={<Team />} />
          <Route path="/testimonial" element={<Testimonial />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>

        <Footer />
      </BrowserRouter>
    </>
  );
}

export default App;
