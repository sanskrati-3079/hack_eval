import React from 'react';
import { useContext } from 'react';
import { TeamContext } from '../context/TeamContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { team } = useContext(TeamContext);

  // Default data if team is not available
  const defaultTeam = {
    name: 'Team Innovators',
    teamId: 'TC-2024-001',
    track: 'Web Development',
    status: 'Active',
    submissions: [],
    mentorSessions: [],
    rank: 5,
    analytics: {
      commitCount: 156,
      codeReviews: 24,
      testsWritten: 89,
      bugsFixed: 15
    }
  };

  const currentTeam = team || defaultTeam;

  const sampleSubmissions = [
    { id: 1, title: 'Project Proposal', status: 'Approved', date: '2024-02-15' },
    { id: 2, title: 'MVP Demo', status: 'Pending', date: '2024-02-20' },
  ];

  const sampleMentorSessions = [
    { id: 1, mentor: 'John Doe', topic: 'Technical Architecture', date: '2024-02-16 14:00' },
    { id: 2, mentor: 'Jane Smith', topic: 'UI/UX Review', date: '2024-02-18 15:30' },
  ];

  const sampleTeamMembers = [
    { id: 1, name: 'Alice Johnson', role: 'Team Lead' },
    { id: 2, name: 'Bob Wilson', role: 'Frontend Developer' },
    { id: 3, name: 'Carol Martinez', role: 'Backend Developer' },
    { id: 4, name: 'David Brown', role: 'UI/UX Designer' },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Team Dashboard</h1>
        <Link to="/profile" className="profile-link">Profile Settings</Link>
      </div>

      <div className="dashboard-content">
        <div className="team-summary">
          <h2>Team Summary</h2>
          <div className="summary-content">
            <div className="summary-item">
              <span className="label">Team Name:</span>
              <span className="value">{currentTeam.name}</span>
            </div>
            <div className="summary-item">
              <span className="label">Team ID:</span>
              <span className="value">{currentTeam.teamId}</span>
            </div>
            <div className="summary-item">
              <span className="label">Track:</span>
              <span className="value">{currentTeam.track}</span>
            </div>
            <div className="summary-item">
              <span className="label">Status:</span>
              <span className="value status-active">{currentTeam.status}</span>
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
                  <p className="stat-number">{currentTeam.submissions?.length || 2}</p>
                  <span className="stat-label">Total Submissions</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon sessions-icon">👥</div>
                <div className="stat-content">
                  <h3>Mentor Sessions</h3>
                  <p className="stat-number">{currentTeam.mentorSessions?.length || 2}</p>
                  <span className="stat-label">Completed Sessions</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon rank-icon">🏆</div>
                <div className="stat-content">
                  <h3>Current Rank</h3>
                  <p className="stat-number">{currentTeam.rank || 5}</p>
                  <span className="stat-label">of 20 Teams</span>
                </div>
              </div>
            </div>
          </div>

          <div className="recent-activity">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              <div className="activity-section">
                <h3>Latest Submissions</h3>
                {sampleSubmissions.map(submission => (
                  <div key={submission.id} className="activity-item">
                    <div className="activity-content">
                      <h4>{submission.title}</h4>
                      <p>Status: <span className={`status-${submission.status.toLowerCase()}`}>{submission.status}</span></p>
                      <span className="activity-date">{submission.date}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="activity-section">
                <h3>Upcoming Mentor Sessions</h3>
                {sampleMentorSessions.map(session => (
                  <div key={session.id} className="activity-item">
                    <div className="activity-content">
                      <h4>{session.topic}</h4>
                      <p>Mentor: {session.mentor}</p>
                      <span className="activity-date">{session.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="team-members">
            <h2>Team Members</h2>
            <div className="members-list">
              {sampleTeamMembers.map(member => (
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