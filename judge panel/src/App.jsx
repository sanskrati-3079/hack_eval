import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./components/Dashboard.jsx";
import EvaluateSubmission from "./components/EvaluateSubmission.jsx";
import MyEvaluations from "./components/MyEvaluations.jsx";
import FinalSubmissionList from "./components/FinalSubmissionList.jsx";
import SignIn from "./components/SignIn.jsx";
import Auth from "./components/Auth.jsx";
import "./App.css";

// Layout to hide sidebar/footer on SignIn page
function Layout({ children }) {
  const location = useLocation();
  const isAuthPage = location.pathname === "/signin";

  return (
    <div className="app">
      {!isAuthPage && <Sidebar />}
      <main className="main-content">
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

          {/* Judge Portal */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/evaluate" element={<EvaluateSubmission />} />
          <Route path="/my-evaluations" element={<MyEvaluations />} />
          <Route path="/final-submissions" element={<FinalSubmissionList />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
