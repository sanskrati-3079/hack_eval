import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import Dashboard from './components/Dashboard.jsx';
import RoundScheduler from './components/RoundScheduler.jsx';
import JudgeAssignment from './components/JudgeAssignment.jsx';
import ScoreCompiler from './components/ScoreCompiler.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import MentorManagement from './components/MentorManagement.jsx';
import ExcelUpload from './components/ExcelUpload.jsx';
import Login from './components/Login.jsx';
import FinalSubmissionList from './components/FinalSubmissionList.jsx';
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Always start closed
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return Boolean(localStorage.getItem('authUser'));
    } catch {
      return false;
    }
  });

  // Active round (for Header display)
  const [activeRound, setActiveRound] = useState(null);

  useEffect(() => {
    let timerId;
    let mounted = true;
    const fetchActive = async () => {
      try {
        const res = await fetch('http://localhost:8000/round-state/active');
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setActiveRound(data.round);
      } catch {}
    };
    fetchActive();
    timerId = setInterval(fetchActive, 5000);
    return () => { mounted = false; if (timerId) clearInterval(timerId); };
  }, []);

  const handleLogin = (user) => {
    try {
      localStorage.setItem('authUser', JSON.stringify(user));
    } catch {}
    setIsAuthenticated(true);
    // Keep sidebar closed on login
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('authUser');
    } catch {}
    setIsAuthenticated(false);
    setSidebarOpen(false); // Close sidebar on logout
  };

  // Optional: Auto-open sidebar on desktop screens when user manually opens it
  // Remove this useEffect if you want the sidebar to stay closed until manually opened
  useEffect(() => {
    const onResize = () => {
      // Only auto-close on mobile, don't auto-open on desktop
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
      // Remove the auto-open logic for desktop
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Router>
      <div className={`app ${sidebarOpen ? 'sidebar-opened' : ''}`}>
        {isAuthenticated && (
          <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        )}
        <div className="main-content">
          {isAuthenticated && (
            <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} onLogout={handleLogout} activeRound={activeRound} />
          )}
          <main className="content">
            <Routes>
              <Route
                path="/"
                element={
                  isAuthenticated ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/login"
                element={
                  isAuthenticated ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Login onLogin={handleLogin} />
                  )
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/round-scheduler"
                element={
                  <ProtectedRoute>
                    <RoundScheduler />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/judge-assignment"
                element={
                  <ProtectedRoute>
                    <JudgeAssignment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/score-compiler"
                element={
                  <ProtectedRoute>
                    <ScoreCompiler />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leaderboard"
                element={
                  <ProtectedRoute>
                    <Leaderboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mentor-management"
                element={
                  <ProtectedRoute>
                    <MentorManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/excel-upload"
                element={
                  <ProtectedRoute>
                    <ExcelUpload />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/final-submissions"
                element={
                  <ProtectedRoute>
                    <FinalSubmissionList />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;