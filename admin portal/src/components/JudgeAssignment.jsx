import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Filter, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

const JudgeAssignment = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const teams = [
    {
      id: 1,
      name: 'Team Alpha',
      category: 'AI/ML',
      problemStatement: 'AI-powered healthcare diagnostics',
      members: ['John Doe', 'Jane Smith', 'Mike Johnson'],
      assignedJudge: 'Dr. Sarah Johnson',
      assignmentStatus: 'assigned',
      score: null
    },
    {
      id: 2,
      name: 'Team Beta',
      category: 'Web Development',
      problemStatement: 'E-commerce platform for local businesses',
      members: ['Alice Brown', 'Bob Wilson'],
      assignedJudge: null,
      assignmentStatus: 'unassigned',
      score: null
    },
    {
      id: 3,
      name: 'Team Gamma',
      category: 'Mobile App',
      problemStatement: 'Sustainable living tracker',
      members: ['Carol Davis', 'David Miller', 'Eva Garcia'],
      assignedJudge: 'Prof. Robert Chen',
      assignmentStatus: 'assigned',
      score: 8.5
    },
    {
      id: 4,
      name: 'Team Delta',
      category: 'AI/ML',
      problemStatement: 'Smart traffic management system',
      members: ['Frank Lee', 'Grace Taylor'],
      assignedJudge: null,
      assignmentStatus: 'unassigned',
      score: null
    }
  ];

  const judges = [
    { id: 1, name: 'Dr. Sarah Johnson', expertise: 'AI/ML', availability: 'available' },
    { id: 2, name: 'Prof. Robert Chen', expertise: 'Mobile App', availability: 'available' },
    { id: 3, name: 'Dr. Emily Davis', expertise: 'Web Development', availability: 'busy' },
    { id: 4, name: 'Prof. Michael Wilson', expertise: 'AI/ML', availability: 'available' }
  ];

  const categories = ['all', 'AI/ML', 'Web Development', 'Mobile App', 'IoT', 'Blockchain'];

  const filteredTeams = teams.filter(team => {
    const matchesCategory = selectedCategory === 'all' || team.category === selectedCategory;
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.problemStatement.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getAssignmentStatusBadge = (status) => {
    switch (status) {
      case 'assigned':
        return <span className="badge badge-success">Assigned</span>;
      case 'unassigned':
        return <span className="badge badge-warning">Unassigned</span>;
      case 'in-progress':
        return <span className="badge badge-info">In Progress</span>;
      default:
        return <span className="badge badge-warning">Unassigned</span>;
    }
  };

  const handleAssignJudge = (team) => {
    setSelectedTeam(team);
    setShowAssignmentModal(true);
  };

  return (
    <div className="judge-assignment">
      <div className="page-header">
        <h1 className="page-title">Judge Assignment</h1>
        <p className="page-subtitle">Assign judges to teams and manage evaluations</p>
      </div>

      {/* Filters and Search */}
      <div className="filters">
        <div className="filter-group">
          <label className="form-label">Category</label>
          <select 
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="form-label">Search</label>
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="Search teams or problem statements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-group">
          <label className="form-label">Assignment Status</label>
          <select className="form-select">
            <option value="all">All Status</option>
            <option value="assigned">Assigned</option>
            <option value="unassigned">Unassigned</option>
            <option value="in-progress">In Progress</option>
          </select>
        </div>
      </div>

      {/* Teams Table */}
      <div className="card">
        <div className="card-header">
          <h3>Team Assignments</h3>
          <div className="stats-summary">
            <span>Total Teams: {teams.length}</span>
            <span>Assigned: {teams.filter(t => t.assignmentStatus === 'assigned').length}</span>
            <span>Unassigned: {teams.filter(t => t.assignmentStatus === 'unassigned').length}</span>
          </div>
        </div>
        <div className="card-body">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Category</th>
                  <th>Problem Statement</th>
                  <th>Members</th>
                  <th>Assigned Judge</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map((team) => (
                  <tr key={team.id}>
                    <td>
                      <div className="team-info">
                        <strong>{team.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">{team.category}</span>
                    </td>
                    <td>
                      <div className="problem-statement">
                        {team.problemStatement}
                      </div>
                    </td>
                    <td>
                      <div className="team-members">
                        {team.members.map((member, index) => (
                          <span key={index} className="member-tag">{member}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      {team.assignedJudge ? (
                        <div className="judge-info">
                          <span className="judge-name">{team.assignedJudge}</span>
                        </div>
                      ) : (
                        <span className="no-judge">Not assigned</span>
                      )}
                    </td>
                    <td>
                      {getAssignmentStatusBadge(team.assignmentStatus)}
                    </td>
                    <td>
                      {team.score ? (
                        <span className="score">{team.score}/10</span>
                      ) : (
                        <span className="no-score">-</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        {team.assignmentStatus === 'unassigned' ? (
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => handleAssignJudge(team)}
                          >
                            <UserCheck size={14} />
                            Assign
                          </button>
                        ) : (
                          <>
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleAssignJudge(team)}
                            >
                              <Edit size={14} />
                              Reassign
                            </button>
                            <button className="btn btn-error btn-sm">
                              <XCircle size={14} />
                              Unassign
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Judges Overview */}
      <div className="judges-overview">
        <div className="card">
          <div className="card-header">
            <h3>Available Judges</h3>
          </div>
          <div className="card-body">
            <div className="judges-grid">
              {judges.map((judge) => (
                <div key={judge.id} className="judge-card">
                  <div className="judge-header">
                    <div className="judge-avatar">
                      <span>{judge.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <div className="judge-info">
                      <h4>{judge.name}</h4>
                      <p className="judge-expertise">{judge.expertise}</p>
                    </div>
                    <div className="judge-status">
                      <span className={`status-indicator ${judge.availability}`}>
                        {judge.availability === 'available' ? <CheckCircle size={14} /> : <Clock size={14} />}
                        {judge.availability}
                      </span>
                    </div>
                  </div>
                  <div className="judge-stats">
                    <div className="stat">
                      <span className="stat-label">Assigned Teams:</span>
                      <span className="stat-value">
                        {teams.filter(t => t.assignedJudge === judge.name).length}
                      </span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Evaluations:</span>
                      <span className="stat-value">
                        {teams.filter(t => t.assignedJudge === judge.name && t.score).length}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <AssignmentModal
          team={selectedTeam}
          judges={judges}
          onClose={() => setShowAssignmentModal(false)}
          onAssign={(judgeId) => {
            console.log('Assigning judge', judgeId, 'to team', selectedTeam.id);
            setShowAssignmentModal(false);
          }}
        />
      )}
    </div>
  );
};

// Assignment Modal Component
const AssignmentModal = ({ team, judges, onClose, onAssign }) => {
  const [selectedJudge, setSelectedJudge] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedJudge) {
      onAssign(selectedJudge);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Assign Judge to {team?.name}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="team-details">
              <h4>Team Information</h4>
              <p><strong>Category:</strong> {team?.category}</p>
              <p><strong>Problem Statement:</strong> {team?.problemStatement}</p>
              <p><strong>Members:</strong> {team?.members.join(', ')}</p>
            </div>

            <div className="form-group">
              <label className="form-label">Select Judge</label>
              <select
                className="form-select"
                value={selectedJudge}
                onChange={(e) => setSelectedJudge(e.target.value)}
                required
              >
                <option value="">Choose a judge...</option>
                {judges
                  .filter(judge => judge.availability === 'available')
                  .map(judge => (
                    <option key={judge.id} value={judge.id}>
                      {judge.name} - {judge.expertise}
                    </option>
                  ))
                }
              </select>
            </div>

            <div className="judge-recommendations">
              <h4>Recommended Judges</h4>
              <div className="recommendations-list">
                {judges
                  .filter(judge => judge.expertise === team?.category && judge.availability === 'available')
                  .map(judge => (
                    <div key={judge.id} className="recommendation-item">
                      <div className="judge-info">
                        <strong>{judge.name}</strong>
                        <span className="expertise">{judge.expertise}</span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedJudge(judge.id.toString())}
                      >
                        Select
                      </button>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Assign Judge
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JudgeAssignment; 