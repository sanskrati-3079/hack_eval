import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  Eye,
  Calendar,
  Star
} from 'lucide-react';
import './MyEvaluations.css';

const MyEvaluations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock evaluations data
  const evaluations = [
    {
      id: 'EV-001',
      teamName: 'Team Innovators',
      projectName: 'Smart Waste Management',
      submissionDate: '2024-01-15',
      evaluationDate: '2024-01-16',
      totalScore: 8.5,
      status: 'Approved',
      recommendation: 'Proceed to Next Round',
      feedback: 'Excellent innovation and well-executed solution. Strong technical implementation with clear problem understanding.'
    },
    {
      id: 'EV-002',
      teamName: 'CodeCrafters',
      projectName: 'AI-Powered Education Platform',
      submissionDate: '2024-01-14',
      evaluationDate: '2024-01-15',
      totalScore: 7.2,
      status: 'Needs Improvement',
      recommendation: 'Needs Improvement',
      feedback: 'Good concept but needs better technical implementation. Consider improving the user interface and adding more features.'
    },
    {
      id: 'EV-003',
      teamName: 'TechVision',
      projectName: 'Healthcare Monitoring System',
      submissionDate: '2024-01-13',
      evaluationDate: '2024-01-14',
      totalScore: 9.1,
      status: 'Approved',
      recommendation: 'Proceed to Next Round',
      feedback: 'Outstanding project with excellent technical depth. Very innovative solution with great potential for real-world application.'
    },
    {
      id: 'EV-004',
      teamName: 'DataMasters',
      projectName: 'Predictive Analytics Dashboard',
      submissionDate: '2024-01-12',
      evaluationDate: '2024-01-13',
      totalScore: 6.8,
      status: 'Rejected',
      recommendation: 'Rejected',
      feedback: 'Concept is good but implementation lacks depth. Technical stack could be better chosen for the problem domain.'
    }
  ];

  const filteredEvaluations = evaluations.filter(evaluation => {
    const matchesSearch = evaluation.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evaluation.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || evaluation.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'success';
      case 'needs improvement': return 'warning';
      case 'rejected': return 'error';
      default: return 'info';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    return 'error';
  };

  return (
    <div className="my-evaluations">
      <div className="page-header">
        <h1 className="page-title">My Evaluations</h1>
        <p className="page-subtitle">Review your completed evaluations</p>
      </div>

      {/* Filters and Search */}
      <div className="filters-section card">
        <div className="filters-row">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search by team name or project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-controls">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="needs improvement">Needs Improvement</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Evaluations List */}
      <div className="evaluations-grid">
        {filteredEvaluations.map((evaluation) => (
          <div key={evaluation.id} className="evaluation-card card">
            <div className="evaluation-header">
              <div className="evaluation-meta">
                <h3>{evaluation.teamName}</h3>
                <p className="project-name">{evaluation.projectName}</p>
                <div className="evaluation-dates">
                  <span className="date-item">
                    <Calendar size={14} />
                    Submitted: {evaluation.submissionDate}
                  </span>
                  <span className="date-item">
                    <Calendar size={14} />
                    Evaluated: {evaluation.evaluationDate}
                  </span>
                </div>
              </div>
              <div className="evaluation-score">
                <div className={`score-badge score-${getScoreColor(evaluation.totalScore)}`}>
                  <Star size={16} />
                  {evaluation.totalScore}/10
                </div>
                <div className={`status-badge status-${getStatusColor(evaluation.status)}`}>
                  {evaluation.status}
                </div>
              </div>
            </div>

            <div className="evaluation-content">
              <div className="recommendation">
                <strong>Recommendation:</strong> {evaluation.recommendation}
              </div>
              <div className="feedback">
                <strong>Feedback:</strong>
                <p>{evaluation.feedback}</p>
              </div>
            </div>

            <div className="evaluation-actions">
              <button className="btn btn-secondary">
                <Eye size={16} />
                View Details
              </button>
              <button className="btn btn-secondary">
                <Download size={16} />
                Export
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredEvaluations.length === 0 && (
        <div className="empty-state">
          <h3>No evaluations found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default MyEvaluations;



