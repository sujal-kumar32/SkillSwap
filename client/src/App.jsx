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
import AdminCreditHistory from "./components/adminPages/AdminCreditHistory";
import AdminSettings from "./components/adminPages/AdminSettings";
import AdminAuditLogs from "./components/adminPages/AdminAuditLogs";
import AdminCategories from "./components/adminPages/AdminCategories";
import MentorRequests from "./components/adminPages/MentorRequests";
import AdminBroadcast from "./components/adminPages/AdminBroadcast";
import AdminPayments from "./components/adminPages/AdminPayments";
import AdminDisputes from "./components/adminPages/AdminDisputes";
import MentorMaster from "./components/layout/user/mentor/MentorMaster";
import MentorDashboard from "./components/pages/mentorPages/MentorDashboard";
import CreateSession from "./components/pages/mentorPages/CreateSession";
import MySessions from "./components/pages/mentorPages/MySessions";
import Bookings from "./components/pages/mentorPages/Bookings";
import MyLearners from "./components/pages/mentorPages/MyLearners";
import MentorReviews from "./components/pages/mentorPages/MentorReviews";
import MentorCreateSkill from "./components/pages/mentorPages/MentorCreateSkill";
import MentorMySkills from "./components/pages/mentorPages/MentorMySkills";
import MentorAvailability from "./components/pages/mentorPages/MentorAvailability";
import SessionManage from "./components/pages/mentorPages/SessionManage";
import LearnerLeaderboard from "./components/pages/learnerPages/LearnerLeaderboard";
import LeaderboardPage from "./components/pages/LeaderboardPage";
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
import LearnerWallet from "./components/pages/learnerPages/LearnerWallet";
import MentorEarnings from "./components/pages/mentorPages/MentorEarnings";
import MentorAnalytics from "./components/pages/mentorPages/MentorAnalytics";
import Wishlist from "./components/pages/learnerPages/Wishlist";
import LearningRoadmap from "./components/pages/learnerPages/LearningRoadmap";
import LearnerSkills from "./components/pages/learnerPages/LearnerSkills";
import ForgotPassword from "./components/pages/ForgotPassword";
import ResetPassword from "./components/pages/ResetPassword";
import Settings from "./components/pages/Settings";
import VerifyEmail from "./components/pages/VerifyEmail";
import PublicProfile from "./components/pages/PublicProfile";
import Feed from "./components/pages/Feed";
import NotificationPage from "./components/pages/NotificationPage";
import MessagesPage from "./components/pages/MessagesPage";
import { SocketProvider } from "./context/SocketContext";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import { SkeletonInjector } from "./components/ui/Skeleton";
import "./responsive.css";
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
  if (!user.roles?.includes("learner")) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
      <BrowserRouter>
        <SkeletonInjector />
        <Routes>
          <Route path="/" element={<ErrorBoundary><Layout /></ErrorBoundary>}>
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

          <Route path="/profile/:userId" element={<ErrorBoundary><PublicProfile /></ErrorBoundary>} />

          <Route
            path="/notifications"
            element={
              <RequireUser>
                <ErrorBoundary fallbackMessage="Failed to load notifications.">
                  <NotificationPage />
                </ErrorBoundary>
              </RequireUser>
            }
          />

          <Route
            path="/feed"
            element={
              <RequireUser>
                <ErrorBoundary fallbackMessage="Failed to load feed.">
                  <Feed />
                </ErrorBoundary>
              </RequireUser>
            }
          />

          <Route
            path="/messages/:chatId?"
            element={
              <RequireUser>
                <ErrorBoundary fallbackMessage="Failed to load messages.">
                  <MessagesPage />
                </ErrorBoundary>
              </RequireUser>
            }
          />

          <Route
            path="/workspace"
            element={
              <RequireUser>
                <ErrorBoundary fallbackMessage="Failed to load workspace.">
                  <WorkspaceHub />
                </ErrorBoundary>
              </RequireUser>
            }
          />

          <Route
            path="/profile"
            element={
              <RequireUser>
                <ErrorBoundary fallbackMessage="Failed to load profile.">
                  <Profile />
                </ErrorBoundary>
              </RequireUser>
            }
          />

          <Route
            path="/settings"
            element={
              <RequireUser>
                <ErrorBoundary fallbackMessage="Failed to load settings.">
                  <Settings />
                </ErrorBoundary>
              </RequireUser>
            }
          />

          <Route
            path="/leaderboard"
            element={
              <RequireUser>
                <ErrorBoundary fallbackMessage="Failed to load leaderboard.">
                  <LeaderboardPage />
                </ErrorBoundary>
              </RequireUser>
            }
          />

          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <ErrorBoundary fallbackMessage="Admin panel encountered an error.">
                  <AdminMaster />
                </ErrorBoundary>
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
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/credits" element={<AdminCreditHistory />} />
            <Route path="/admin/disputes" element={<AdminDisputes />} />
            <Route path="/admin/broadcast" element={<AdminBroadcast />} />
            <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>

          <Route
            path="/mentor"
            element={
              <RequireMentor>
                <ErrorBoundary fallbackMessage="Mentor panel encountered an error.">
                  <MentorMaster />
                </ErrorBoundary>
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
            <Route path="/mentor/availability" element={<MentorAvailability />} />
            <Route path="/mentor/leaderboard" element={<LearnerLeaderboard />} />
            <Route path="/mentor/sessions/:id" element={<SessionManage />} />
            <Route path="/mentor/earnings" element={<MentorEarnings />} />
            <Route path="/mentor/analytics" element={<MentorAnalytics />} />
          </Route>

          <Route
            path="/learner"
            element={
              <RequireLearner>
                <ErrorBoundary fallbackMessage="Learner panel encountered an error.">
                  <LearnerMaster />
                </ErrorBoundary>
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
            <Route path="/learner/leaderboard" element={<LearnerLeaderboard />} />
            <Route path="/learner/wallet" element={<LearnerWallet />} />
            <Route path="/learner/wishlist" element={<Wishlist />} />
          </Route>
        </Routes>

        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover draggable theme="light" />
      </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
