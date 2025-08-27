import React, { useState } from 'react';
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
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return Boolean(localStorage.getItem('authUser'));
    } catch {
      return false;
    }
  });

  const handleLogin = (user) => {
    try {
      localStorage.setItem('authUser', JSON.stringify(user));
    } catch {}
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('authUser');
    } catch {}
    setIsAuthenticated(false);
  };

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Router>
      <div className="app">
        {isAuthenticated && (
          <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        )}
        <div className="main-content">
          {isAuthenticated && (
            <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} onLogout={handleLogout} />
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
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
