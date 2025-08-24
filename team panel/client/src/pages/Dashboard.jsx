import React, { useContext, useEffect, useState } from "react";
import { TeamContext } from "../context/TeamContext";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { team } = useContext(TeamContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Use the team context as the source of truth, no need for separate API call if context is populated on login.
  // The data displayed is now directly from the context set during SignIn.
  useEffect(() => {
    if (team) {
      setDashboardData(team);
      setLoading(false);
    } else {
      // Handle case where user lands here without being logged in
      setLoading(false);
    }
  }, [team]);

  if (loading) {
    return <div className="loading-state">Loading Dashboard...</div>;
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
      <div className="dashboard-header">
        <h1>Team Dashboard</h1>
        <Link to="/profile" className="profile-link">
          Profile Settings
        </Link>
      </div>

      <div className="dashboard-content">
        <div className="team-summary">
          <h2>Team Summary</h2>
          <div className="summary-content">
            <div className="summary-item">
              <span className="label">Team Name:</span>
              <span className="value">{dashboardData.name}</span>
            </div>
            <div className="summary-item">
              <span className="label">Team ID:</span>
              <span className="value">{dashboardData.teamId}</span>
            </div>
            <div className="summary-item">
              <span className="label">Track:</span>
              <span className="value">{dashboardData.track}</span>
            </div>
            <div className="summary-item">
              <span className="label">Status:</span>
              <span className="value status-active">
                {dashboardData.status}
              </span>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="quick-stats">
            <h2>Quick Stats</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon submissions-icon">📝</div>
                <div className="stat-content">
                  <h3>Submissions</h3>
                  <p className="stat-number">
                    {dashboardData.submissions?.length || 0}
                  </p>
                  <span className="stat-label">Total Submissions</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon sessions-icon">👥</div>
                <div className="stat-content">
                  <h3>Mentor Sessions</h3>
                  <p className="stat-number">
                    {dashboardData.mentorSessions?.length || 0}
                  </p>
                  <span className="stat-label">Completed Sessions</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon rank-icon">🏆</div>
                <div className="stat-content">
                  <h3>Current Rank</h3>
                  <p className="stat-number">
                    {dashboardData.currentRank || "N/A"}
                  </p>
                  <span className="stat-label">of 20 Teams</span>
                </div>
              </div>
            </div>
          </div>

          <div className="team-members">
            <h2>Team Members</h2>
            <div className="members-list">
              {dashboardData.members.map((member) => (
                <div key={member.id} className="member-card">
                  <div className="member-avatar">{member.name.charAt(0)}</div>
                  <div className="member-info">
                    <h4>{member.name}</h4>
                    <p>{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
