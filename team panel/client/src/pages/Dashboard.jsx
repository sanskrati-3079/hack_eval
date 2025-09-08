import React, { useContext, useEffect, useState } from "react";
import { TeamContext } from "../context/TeamContext";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config";
import "./Dashboard.css";

const Dashboard = () => {
  const { team } = useContext(TeamContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const [activeRound, setActiveRound] = useState(null);

  useEffect(() => {
    async function fetchTeam() {
      console.log("DEBUG: Context team:", team);
      console.log("DEBUG: Token:", token);
      const teamFromStorage = localStorage.getItem("team");
      console.log("DEBUG: localStorage team:", teamFromStorage);

      if (!team && token) {
        let teamId = null;
        try {
          teamId = JSON.parse(teamFromStorage)?.team_id;
        } catch (e) {
          console.log("DEBUG: Error parsing team from localStorage:", e);
        }
        console.log("DEBUG: teamId to fetch:", teamId);

        if (teamId) {
          try {
            const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            console.log("DEBUG: Fetched team data from backend:", data);
            setDashboardData(data);
          } catch (err) {
            console.log("DEBUG: Error fetching team from backend:", err);
            setError("Failed to fetch team data from backend.");
            setDashboardData(null);
          }
        } else {
          setError("No teamId found in localStorage.");
          setDashboardData(null);
        }
      } else if (team) {
        console.log("DEBUG: Using context team for dashboardData:", team);
        setDashboardData(team);
      }
      setLoading(false);
    }
    fetchTeam();
  }, [team, token]);

  useEffect(() => {
    console.log("DEBUG: dashboardData after fetch:", dashboardData);
  }, [dashboardData]);

  // Fetch current round and keep it updated
  useEffect(() => {
    let mounted = true;
    let timerId;
    const fetchActive = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/round-state/active`);
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

  if (loading) {
    return <div className="loading-state">Loading Dashboard...</div>;
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <h1>Team Dashboard</h1>
        <p style={{ color: "red" }}>Error: {error}</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="dashboard-container">
        <h1>Team Dashboard</h1>
        <p>
          No team data found. Please <Link to="/signin">sign in</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        {/* <h1>Team Dashboard</h1> */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="current-round" style={{ background: '#E5F5EC', color: '#1B4332', padding: '6px 12px', borderRadius: 8, fontWeight: 600 }}>
            Current Round: {activeRound ? `Round ${activeRound}` : 'None'}
          </div>
          {/* <Link to="/profile" className="profile-link">
            Profile Settings
          </Link> */}
        </div>
      </div>

      <div className="dashboard-content">
        <div className="team-summary animate-slideInUp" style={{ animationDelay: '100ms' }}>
          <h2>Team Summary</h2>
          <div className="summary-content">
            <div className="summary-item">
              <span className="label">Team Name:</span>
              <span className="value">{dashboardData.team_name}</span>
            </div>
            <div className="summary-item">
              <span className="label">Team ID:</span>
              <span className="value">{dashboardData.team_id}</span>
            </div>
            <div className="summary-item">
              <span className="label">Problem Statement ID:</span>
              <span className="value">{dashboardData.problem_statement_id}</span>
            </div>
            <div className="summary-item">
              <span className="label">Category:</span>
              <span className="value">{dashboardData.category || "N/A"}</span>
            </div>
            {dashboardData.subcategory && (
              <div className="summary-item">
                <span className="label">Subcategory:</span>
                <span className="value">{dashboardData.subcategory}</span>
              </div>
            )}
            <div className="summary-item">
              <span className="label">University Roll No:</span>
              <span className="value">{dashboardData.university_roll_no || "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="team-members animate-slideInUp" style={{ animationDelay: '200ms' }}>
            <h2>Team Members</h2>
            <div className="members-list">
              {/* Team Leader */}
              {dashboardData.team_leader && (
                <div className="member-card">
                  <div className="member-avatar">
                    {dashboardData.team_leader.name.charAt(0)}
                  </div>
                  <div className="member-info">
                    <h4>{dashboardData.team_leader.name}</h4>
                    <p>Role: Team Leader</p>
                    {dashboardData.team_leader.roll_no && (
                      <p>Roll No: {dashboardData.team_leader.roll_no}</p>
                    )}
                    <p>Email: {dashboardData.team_leader.email}</p>
                    <p>Contact: {dashboardData.team_leader.contact}</p>
                  </div>
                </div>
              )}
              {/* Team Members */}
              {dashboardData.members && dashboardData.members.length > 0 && (
                <div className="member-list">
                  <h4>Team Members:</h4>
                  <ul>
                    {dashboardData.members.map((member, idx) => (
                      <li key={idx}>{member}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="project-info animate-slideInUp" style={{ animationDelay: '300ms' }}>
            <h2>Problem Statement</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Statement:</label>
                <p>{dashboardData.statement || "No statement provided"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;