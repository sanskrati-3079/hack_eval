import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx";
import Dashboard from "./components/Dashboard.jsx";
import EvaluateSubmission from "./components/EvaluateSubmission.jsx";
import MyEvaluations from "./components/MyEvaluations.jsx";
// import FinalSubmissionList from "./components/FinalSubmissionList.jsx";
import SignIn from "./components/SignIn.jsx";
import Assign from "./components/Assign.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
// import Auth from "./components/Auth.jsx";
import "./App.css";

// Layout to hide sidebar/footer on SignIn page
function Layout({ children }) {
  const location = useLocation();
  const isAuthPage = location.pathname === "/signin";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app">
      {!isAuthPage && <Header onMenuClick={handleMenuClick} />}
      {!isAuthPage && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      <main className={`main-content ${sidebarOpen ? '' : 'sidebar-hidden'}`}>
        {children}
        {!isAuthPage && (
          <footer className="footer">
            © {new Date().getFullYear()} GLA University | Judge Evaluation Portal
          </footer>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Default route -> SignIn */}
          <Route path="/" element={<Navigate to="/signin" replace />} />

          {/* Auth */}
          <Route path="/signin" element={<SignIn />} />

          {/* Judge Portal - Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/evaluate" element={
            <ProtectedRoute>
              <EvaluateSubmission />
            </ProtectedRoute>
          } />
          <Route path="/my-evaluations" element={
            <ProtectedRoute>
              <MyEvaluations />
            </ProtectedRoute>
          } />
          <Route path="/assign" element={
            <ProtectedRoute>
              <Assign />
            </ProtectedRoute>
          } />
          {/* <Route path="/final-submissions" element={<FinalSubmissionList />} /> */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;