import React from "react";
import { ToastContainer } from "react-toastify";
import Home from "./components/pages/Home";
import About from "./components/pages/About";
import Course from "./components/pages/Course";
import Detail from "./components/pages/Detail";
import Team from "./components/pages/Team";
import Feature from "./components/pages/Feature";
import Testimonial from "./components/pages/Testimonial";
import Contact from "./components/pages/Contact";
import Login from "./components/pages/Login";
import Profile from "./components/pages/Profile";
import AddSkill from "./components/adminPages/AddSkill";
import ManageUsers from "./components/adminPages/ManageUsers";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/user/Layout";
import AdminDashboard from "./components/adminPages/AdminDashboard";
import AdminMaster from "./components/layout/admin/AdminMaster";
import SkillApproval from "./components/adminPages/SkillApproval";
import ManagePaidSessions from "./components/adminPages/ManagePaidSessions";
import SessionView from "./components/adminPages/SessionView";
import SessionEdit from "./components/adminPages/SessionEdit";
import ViewRequests from "./components/adminPages/ViewRequests";
import MentorMaster from "./components/layout/user/mentor/MentorMaster";
import MentorDashboard from "./components/pages/mentorPages/MentorDashboard";
import CreateSession from "./components/pages/mentorPages/CreateSession";


const isAdminLoggedIn = () =>
  !!localStorage.getItem("token") && localStorage.getItem("role") === "admin";

function HomeRoute() {
  return isAdminLoggedIn() ? <Navigate to="/admin" replace /> : <Home />;
}

function RequireAdmin({ children }) {
  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" replace />;
  }

  return localStorage.getItem("role") === "admin" ? (
    children
  ) : (
    <Navigate to="/" replace />
  );
}

function RequireUser({ children }) {
  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" replace />;
  }

  return localStorage.getItem("role") === "admin" ? (
    <Navigate to="/admin" replace />
  ) : (
    children
  );
}
function RequireMentor({ children }) {
  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" replace />;
  }

  return localStorage.getItem("role") === "mentor" ? (
    children
  ) : (
    <Navigate to="/mentor" replace />
  );
}

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomeRoute />} />
            <Route path="/about" element={<About />} />
            <Route path="/courses" element={<Course />} />
            <Route path="/detail" element={<Detail />} />
            <Route path="/features" element={<Feature />} />
            <Route path="/team" element={<Team />} />
            <Route path="/testimonial" element={<Testimonial />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/profile"
              element={
                <RequireUser>
                  <Profile />
                </RequireUser>
              }
            />
          </Route>

          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminMaster />
              </RequireAdmin>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="/admin/add-skill" element={<AddSkill />} />
            <Route path="/admin/manage-users" element={<ManageUsers />} />
            <Route path="/admin/skill-approval" element={<SkillApproval />} />
            <Route
              path="/admin/manage-paid-sessions"
              element={<ManagePaidSessions />}
            />
            <Route path="/admin/session/:id" element={<SessionView />} />
            <Route path="/admin/session/:id/edit" element={<SessionEdit />} />
            <Route path="/admin/view-requests" element={<ViewRequests />} />
          </Route>

          <Route
            path="/mentor"
            element={
              <RequireMentor>
                <MentorMaster />
              </RequireMentor>
            }
          >
            <Route index element={<MentorDashboard />} />
            <Route path="/mentor/create-session" element={<CreateSession />} />
          </Route>
        </Routes>

        {/* <Footer /> */}
        <ToastContainer />
      </BrowserRouter>
    </>
  );
}

export default App;
