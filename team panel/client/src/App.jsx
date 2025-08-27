import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';

// Components
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TeamInfo from './pages/TeamInfo.jsx';
import Submissions from './pages/Submissions.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Mentors from './pages/Mentors.jsx';
import Analytics from './pages/Analytics.jsx';
import Notifications from './pages/Notifications.jsx';
import SignIn from './pages/Auth/SignIn.jsx';
import ProfileSettings from './pages/Auth/ProfileSettings.jsx';

// Styles
import './pages/styles.css';
import './App.css';

// Context
import { SocketContext } from './context/SocketContext.js';
import { TeamContext } from './context/TeamContext.js';

// API
import { getTeamByTeamId } from './api/teams.jsx';

function App() {
  const [socket, setSocket] = useState(null);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    // Use environment variable or default to localhost:5000
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    
    try {
      const newSocket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        timeout: 5000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
      });

      newSocket.on('connect_error', (error) => {
        console.log('Socket connection error:', error.message);
        // Don't show error to user, just log it
      });

      setSocket(newSocket);

      return () => {
        if (newSocket) {
          newSocket.close();
        }
      };
    } catch (error) {
      console.log('Socket initialization error:', error);
      // Continue without socket connection
    }
  }, []);

  // Global keyboard shortcuts: Ctrl+B or H to toggle sidebar, Esc to close
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ignore when typing in inputs/textareas/contenteditable
      const target = event.target;
      const isTyping = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      );
      if (isTyping) return;

      // Ctrl+B (or Cmd+B on macOS) toggles sidebar
      const isCtrlOrMeta = event.ctrlKey || event.metaKey;
      if (isCtrlOrMeta && (event.key === 'b' || event.key === 'B')) {
        event.preventDefault();
        setSidebarOpen((prev) => !prev);
        return;
      }

      // Standalone H toggles sidebar
      if (!isCtrlOrMeta && (event.key === 'h' || event.key === 'H')) {
        setSidebarOpen((prev) => !prev);
        return;
      }

      // Escape closes sidebar
      if (event.key === 'Escape') {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load team data from localStorage on app start
  useEffect(() => {
    const savedTeam = localStorage.getItem('team');
    if (savedTeam) {
      try {
        const teamData = JSON.parse(savedTeam);
        setTeam(teamData);
        
        // Join team room for real-time updates
        if (socket && socket.connected) {
          socket.emit('join-team', teamData.id);
        }
      } catch (error) {
        console.log('Error parsing team data:', error);
        localStorage.removeItem('team');
      }
    }
    setLoading(false);
  }, [socket]);

  // Listen for real-time updates
  useEffect(() => {
    if (socket && socket.connected) {
      socket.on('team-update', (updatedTeam) => {
        setTeam(updatedTeam);
        toast.success('Team data updated');
      });

      return () => {
        socket.off('team-update');
      };
    }
  }, [socket]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#1B4332'
      }}>
        Loading Hackathon Dashboard...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <SocketContext.Provider value={socket}>
        <TeamContext.Provider value={{ team, setTeam }}>
          <div className="app">
            {team ? (
              <>
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                <div className="app-content">
                  <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                  <main className="main-content">
                    <Routes>
                      <Route path="/" element={
                        <PrivateRoute>
                          <Dashboard />
                        </PrivateRoute>
                      } />
                      <Route path="/team" element={
                        <PrivateRoute>
                          <TeamInfo />
                        </PrivateRoute>
                      } />
                      <Route path="/submissions" element={
                        <PrivateRoute>
                          <Submissions />
                        </PrivateRoute>
                      } />
                      <Route path="/leaderboard" element={
                        <PrivateRoute>
                          <Leaderboard />
                        </PrivateRoute>
                      } />
                      <Route path="/mentors" element={
                        <PrivateRoute>
                          <Mentors />
                        </PrivateRoute>
                      } />
                      <Route path="/analytics" element={
                        <PrivateRoute>
                          <Analytics />
                        </PrivateRoute>
                      } />
                      <Route path="/notifications" element={
                        <PrivateRoute>
                          <Notifications />
                        </PrivateRoute>
                      } />
                      <Route path="/profile" element={
                        <PrivateRoute>
                          <ProfileSettings />
                        </PrivateRoute>
                      } />
                    </Routes>
                  </main>
                </div>
              </>
            ) : (
              <Routes>
                <Route path="/signin" element={<SignIn />} />
                <Route path="*" element={<Navigate to="/signin" replace />} />
              </Routes>
            )}
          </div>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </TeamContext.Provider>
      </SocketContext.Provider>
    </BrowserRouter>
  );
}

export default App;