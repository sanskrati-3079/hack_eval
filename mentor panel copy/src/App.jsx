import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Teams from "./pages/Teams";
import Feedback from "./pages/Feedback";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import MentorLogin from "./components/Login";
import MentorSignup from "./components/SignUp";
import MentorHeader from "./components/MentorHeader";
import "./App.css";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const mentorToken = localStorage.getItem("mentorToken");
  const mentor = localStorage.getItem("mentor");

  if (!mentorToken || !mentor) {
    return <Navigate to="/mentor-login" replace />;
  }

  return children;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const mentorToken = localStorage.getItem("mentorToken");
  const mentor = localStorage.getItem("mentor");

  if (mentorToken && mentor) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Layout Component for authenticated pages
const DashboardLayout = ({ children }) => {
  return (
    <div className="app-shell">
      <header className="app-header">
        <MentorHeader />
      </header>
      <main className="app-content">
        {children}
      </main>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes - Only accessible when NOT logged in */}
          <Route 
            path="/mentor-login" 
            element={
              <PublicRoute>
                <MentorLogin />
              </PublicRoute>
            } 
          />
          <Route 
            path="/mentor-signup" 
            element={
              <PublicRoute>
                <MentorSignup />
              </PublicRoute>
            } 
          />

          {/* Protected Routes - Only accessible when logged in */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teams" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Teams />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/feedback" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Feedback />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Notifications />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          {/* Redirect unknown routes to home */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;