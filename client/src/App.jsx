import React, { createContext, useContext, useState, useEffect } from "react";
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
import WorkspaceHub from "./components/pages/WorkspaceHub";
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
import AdminReviews from "./components/adminPages/AdminReviews";
import AdminProgress from "./components/adminPages/AdminProgress";
import AdminBookings from "./components/adminPages/AdminBookings";
import AdminSettings from "./components/adminPages/AdminSettings";
import AdminCategories from "./components/adminPages/AdminCategories";
import MentorRequests from "./components/adminPages/MentorRequests";
import MentorMaster from "./components/layout/user/mentor/MentorMaster";
import MentorDashboard from "./components/pages/mentorPages/MentorDashboard";
import CreateSession from "./components/pages/mentorPages/CreateSession";
import MySessions from "./components/pages/mentorPages/MySessions";
import Bookings from "./components/pages/mentorPages/Bookings";
import MyLearners from "./components/pages/mentorPages/MyLearners";
import MentorReviews from "./components/pages/mentorPages/MentorReviews";
import MentorCreateSkill from "./components/pages/mentorPages/MentorCreateSkill";
import MentorMySkills from "./components/pages/mentorPages/MentorMySkills";
import LearnerMaster from "./components/layout/user/learner/LearnerMaster";
import LearnerDashboard from "./components/pages/learnerPages/LearnerDashboard";
import ExploreSessions from "./components/pages/learnerPages/ExploreSessions";
import SessionDetails from "./components/pages/learnerPages/SessionDetails";
import BookSession from "./components/pages/learnerPages/BookSession";
import LearnerBookings from "./components/pages/learnerPages/MyBookings";
import LearningProgress from "./components/pages/learnerPages/LearningProgress";
import LearnerReviews from "./components/pages/learnerPages/LearnerReviews";
import Profile from "./components/pages/Profile";
import BookingHistory from "./components/pages/learnerPages/BookingHistory";
import AIRecommendations from "./components/pages/learnerPages/AIRecommendations";
import LearningRoadmap from "./components/pages/learnerPages/LearningRoadmap";
import LearnerSkills from "./components/pages/learnerPages/LearnerSkills";
import ForgotPassword from "./components/pages/ForgotPassword";
import ResetPassword from "./components/pages/ResetPassword";
import Settings from "./components/pages/Settings";
import VerifyEmail from "./components/pages/VerifyEmail";
import Apiservices from "../Apiservices";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Apiservices.getProfile()
      .then((res) => {
        if (res.data?.success) {
          setUser(res.data.data);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    try {
      await Apiservices.logout();
    } catch {
      // ignore
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Home />;
  return user.roles?.includes("admin") ? (
    <Navigate to="/admin" replace />
  ) : (
    <Navigate to="/workspace" replace />
  );
}

function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return user.roles?.includes("admin") ? (
    children
  ) : (
    <Navigate to="/" replace />
  );
}

function RequireUser({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return user.roles?.includes("admin") ? (
    <Navigate to="/admin" replace />
  ) : (
    children
  );
}

function RequireMentor({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return user.roles?.includes("mentor") ? (
    children
  ) : (
    <Navigate to="/workspace" replace />
  );
}

function RequireLearner({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return user.roles?.includes("admin") ? (
    <Navigate to="/admin" replace />
  ) : (
    children
  );
}

function App() {
  return (
    <AuthProvider>
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
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
          </Route>

          <Route
            path="/workspace"
            element={
              <RequireUser>
                <WorkspaceHub />
              </RequireUser>
            }
          />

          <Route
            path="/profile"
            element={
              <RequireUser>
                <Profile />
              </RequireUser>
            }
          />

          <Route
            path="/settings"
            element={
              <RequireUser>
                <Settings />
              </RequireUser>
            }
          />

          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminMaster />
              </RequireAdmin>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="/admin/add-skill" element={<MentorCreateSkill />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/manage-users" element={<ManageUsers />} />
            <Route path="/admin/skill-approval" element={<SkillApproval />} />
            <Route
              path="/admin/manage-paid-sessions"
              element={<ManagePaidSessions />}
            />
            <Route path="/admin/session/:id" element={<SessionView />} />
            <Route path="/admin/session/:id/edit" element={<SessionEdit />} />
            <Route path="/admin/view-requests" element={<ViewRequests />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/reviews" element={<AdminReviews />} />
            <Route path="/admin/progress" element={<AdminProgress />} />
            <Route path="/admin/mentor-requests" element={<MentorRequests />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
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
            <Route path="/mentor/my-sessions" element={<MySessions />} />
            <Route path="/mentor/bookings" element={<Bookings />} />
            <Route path="/mentor/learners" element={<MyLearners />} />
            <Route path="/mentor/reviews" element={<MentorReviews />} />
            <Route path="/mentor/create-skill" element={<MentorCreateSkill />} />
            <Route path="/mentor/my-skills" element={<MentorMySkills />} />
          </Route>

          <Route
            path="/learner"
            element={
              <RequireLearner>
                <LearnerMaster />
              </RequireLearner>
            }
          >
            <Route index element={<LearnerDashboard />} />
            <Route path="/learner/skills" element={<LearnerSkills />} />
            <Route path="/learner/explore" element={<ExploreSessions />} />
            <Route path="/learner/sessions/:id" element={<SessionDetails />} />
            <Route path="/learner/book/:id" element={<BookSession />} />
            <Route path="/learner/bookings" element={<LearnerBookings />} />
            <Route path="/learner/progress" element={<LearningProgress />} />
            <Route path="/learner/reviews" element={<LearnerReviews />} />
            <Route path="/learner/history" element={<BookingHistory />} />
            <Route path="/learner/ai" element={<AIRecommendations />} />
            <Route path="/learner/ai-roadmap" element={<LearningRoadmap />} />
          </Route>
        </Routes>

        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover draggable theme="light" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
