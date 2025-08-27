import React, { useState } from 'react';
import { Search, Eye, Calendar } from 'lucide-react';
import './Assign.css';

const mockAssignedTeams = [
  {
    id: 'T-001',
    teamName: 'Alpha Coders',
    projectName: 'Smart Water Meter',
    submissionDate: '2024-08-25',
    category: 'IoT',
    abstract: `A smart water meter system using IoT sensors to monitor and optimize water usage in real time.`,
    status: 'Pending',
    assignedBy: 'Admin',
  },
  {
    id: 'T-002',
    teamName: 'Beta Builders',
    projectName: 'AI Tutor',
    submissionDate: '2024-08-24',
    category: 'Education',
    abstract: `An AI-powered virtual tutor that adapts to student learning styles and provides personalized feedback.`,
    status: 'Pending',
    assignedBy: 'Admin',
  }
];

const Assign = () => {
  const [search, setSearch] = useState('');

  const filteredTeams = mockAssignedTeams.filter(team =>
    team.teamName.toLowerCase().includes(search.toLowerCase()) ||
    team.projectName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="assign-teams">
      <div className="page-header">
        <h1 className="page-title">Teams Assigned to Me</h1>
        <p className="page-subtitle">Teams assigned by admin for your evaluation.</p>
      </div>

      <div className="assign-filters-section card">
        <div className="assign-filters-row">
          <div className="assign-search-box">
            <Search size={20} className="assign-search-icon" />
            <input
              type="text"
              placeholder="Search by team or project..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="assign-search-input"
            />
          </div>
        </div>
      </div>

      <div className="assign-teams-grid">
        {filteredTeams.map(team => (
          <div key={team.id} className="assign-team-card card">
            <div className="assign-team-header">
              <div className="assign-team-meta">
                <h3>{team.teamName}</h3>
                <p className="assign-project-name">{team.projectName}</p>
                <div className="assign-team-dates">
                  <span className="assign-date-item">
                    <Calendar size={14} /> Submitted: {team.submissionDate}
                  </span>
                  <span className="assign-status-badge assign-status-unassigned">
                    {team.status}
                  </span>
                </div>
              </div>
              <div className="assign-judges">
                <strong>Assigned By:</strong>
                <ul><li>{team.assignedBy}</li></ul>
              </div>
            </div>
            <div className="assign-team-content">
              <div className="assign-abstract">
                <strong>Abstract:</strong>
                <div style={{ whiteSpace: 'pre-line' }}>{team.abstract}</div>
              </div>
              <div>
                <strong>Category:</strong> {team.category}
              </div>
            </div>
            <div className="assign-actions">
              <button className="btn btn-secondary">
                <Eye size={16} /> View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <div className="empty-state">
          <h3>No assigned teams found</h3>
          <p>Try adjusting your search.</p>
        </div>
      )}
    </div>
  );
};

export default Assign;