import React, { useState } from 'react';
import { 
  Calculator, 
  Download, 
  Filter, 
  Search, 
  Eye, 
  Edit,
  TrendingUp,
  BarChart3,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ScoreCompiler = () => {
  const [selectedRound, setSelectedRound] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showScorecardModal, setShowScorecardModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const teams = [
    {
      id: 1,
      name: 'Team Alpha',
      category: 'AI/ML',
      round: 'Round 1',
      judge: 'Dr. Sarah Johnson',
      scores: {
        innovation: 9,
        technical: 8,
        presentation: 7,
        feasibility: 8
      },
      totalScore: 8.0,
      averageScore: 8.0,
      qualified: true,
      feedback: 'Excellent technical implementation with innovative approach.'
    },
    {
      id: 2,
      name: 'Team Beta',
      category: 'Web Development',
      round: 'Round 1',
      judge: 'Dr. Emily Davis',
      scores: {
        innovation: 7,
        technical: 9,
        presentation: 8,
        feasibility: 7
      },
      totalScore: 7.75,
      averageScore: 7.75,
      qualified: true,
      feedback: 'Strong technical skills demonstrated.'
    },
    {
      id: 3,
      name: 'Team Gamma',
      category: 'Mobile App',
      round: 'Round 1',
      judge: 'Prof. Robert Chen',
      scores: {
        innovation: 8,
        technical: 7,
        presentation: 9,
        feasibility: 8
      },
      totalScore: 8.0,
      averageScore: 8.0,
      qualified: true,
      feedback: 'Great presentation and user experience design.'
    },
    {
      id: 4,
      name: 'Team Delta',
      category: 'AI/ML',
      round: 'Round 1',
      judge: 'Prof. Michael Wilson',
      scores: {
        innovation: 6,
        technical: 7,
        presentation: 6,
        feasibility: 7
      },
      totalScore: 6.5,
      averageScore: 6.5,
      qualified: false,
      feedback: 'Good concept but needs more technical depth.'
    }
  ];

  const rounds = ['all', 'Round 1', 'Round 2', 'Round 3'];
  const categories = ['all', 'AI/ML', 'Web Development', 'Mobile App', 'IoT', 'Blockchain'];

  const filteredTeams = teams.filter(team => {
    const matchesRound = selectedRound === 'all' || team.round === selectedRound;
    const matchesCategory = selectedCategory === 'all' || team.category === selectedCategory;
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRound && matchesCategory && matchesSearch;
  });

  const getQualificationBadge = (qualified) => {
    return qualified ? 
      <span className="badge badge-success">Qualified</span> : 
      <span className="badge badge-error">Not Qualified</span>;
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'var(--success)';
    if (score >= 6) return 'var(--warning)';
    return 'var(--error)';
  };

  const handleViewScorecard = (team) => {
    setSelectedTeam(team);
    setShowScorecardModal(true);
  };

  const handleExportScores = () => {
    // Export functionality would be implemented here
    console.log('Exporting scores...');
  };

  const calculateStats = () => {
    const qualifiedTeams = teams.filter(t => t.qualified);
    const avgScore = teams.reduce((sum, t) => sum + t.averageScore, 0) / teams.length;
    
    return {
      totalTeams: teams.length,
      qualifiedTeams: qualifiedTeams.length,
      averageScore: avgScore.toFixed(2),
      highestScore: Math.max(...teams.map(t => t.averageScore)),
      lowestScore: Math.min(...teams.map(t => t.averageScore))
    };
  };

  const stats = calculateStats();

  return (
    <div className="score-compiler">
      <div className="page-header">
        <h1 className="page-title">Score Compiler</h1>
        <p className="page-subtitle">View and manage team scorecards and evaluations</p>
      </div>

      {/* Statistics Overview */}
      <div className="stats-overview">
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-icon" style={{ backgroundColor: 'var(--primary-dark)20', color: 'var(--primary-dark)' }}>
                <Calculator size={24} />
              </div>
              <h3>Total Teams</h3>
            </div>
            <div className="card-value">
              <span className="value">{stats.totalTeams}</span>
              <span className="change">Evaluated</span>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-icon" style={{ backgroundColor: 'var(--success)20', color: 'var(--success)' }}>
                <CheckCircle size={24} />
              </div>
              <h3>Qualified Teams</h3>
            </div>
            <div className="card-value">
              <span className="value">{stats.qualifiedTeams}</span>
              <span className="change positive">+{stats.qualifiedTeams}</span>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-icon" style={{ backgroundColor: 'var(--info)20', color: 'var(--info)' }}>
                <TrendingUp size={24} />
              </div>
              <h3>Average Score</h3>
            </div>
            <div className="card-value">
              <span className="value">{stats.averageScore}</span>
              <span className="change">/10</span>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-icon" style={{ backgroundColor: 'var(--warning)20', color: 'var(--warning)' }}>
                <BarChart3 size={24} />
              </div>
              <h3>Score Range</h3>
            </div>
            <div className="card-value">
              <span className="value">{stats.lowestScore}-{stats.highestScore}</span>
              <span className="change">/10</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="action-bar">
        <div className="filters">
          <div className="filter-group">
            <label className="form-label">Round</label>
            <select 
              className="form-select"
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value)}
            >
              {rounds.map(round => (
                <option key={round} value={round}>
                  {round === 'all' ? 'All Rounds' : round}
                </option>
              ))}
            </select>
          </div>

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
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button className="btn btn-primary" onClick={handleExportScores}>
            <Download size={16} />
            Export Scores
          </button>
        </div>
      </div>

      {/* Scorecards Table */}
      <div className="card">
        <div className="card-header">
          <h3>Team Scorecards</h3>
        </div>
        <div className="card-body">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Category</th>
                  <th>Round</th>
                  <th>Judge</th>
                  <th>Innovation</th>
                  <th>Technical</th>
                  <th>Presentation</th>
                  <th>Feasibility</th>
                  <th>Average</th>
                  <th>Status</th>
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
                    <td>{team.round}</td>
                    <td>{team.judge}</td>
                    <td>
                      <span className="score" style={{ color: getScoreColor(team.scores.innovation) }}>
                        {team.scores.innovation}/10
                      </span>
                    </td>
                    <td>
                      <span className="score" style={{ color: getScoreColor(team.scores.technical) }}>
                        {team.scores.technical}/10
                      </span>
                    </td>
                    <td>
                      <span className="score" style={{ color: getScoreColor(team.scores.presentation) }}>
                        {team.scores.presentation}/10
                      </span>
                    </td>
                    <td>
                      <span className="score" style={{ color: getScoreColor(team.scores.feasibility) }}>
                        {team.scores.feasibility}/10
                      </span>
                    </td>
                    <td>
                      <span className="average-score" style={{ color: getScoreColor(team.averageScore) }}>
                        <strong>{team.averageScore}/10</strong>
                      </span>
                    </td>
                    <td>
                      {getQualificationBadge(team.qualified)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleViewScorecard(team)}
                        >
                          <Eye size={14} />
                          View
                        </button>
                        <button className="btn btn-primary btn-sm">
                          <Edit size={14} />
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Scorecard Modal */}
      {showScorecardModal && (
        <ScorecardModal
          team={selectedTeam}
          onClose={() => setShowScorecardModal(false)}
        />
      )}
    </div>
  );
};

// Scorecard Modal Component
const ScorecardModal = ({ team, onClose }) => {
  const scoreCategories = [
    { key: 'innovation', label: 'Innovation & Creativity', description: 'Originality and creative thinking' },
    { key: 'technical', label: 'Technical Implementation', description: 'Code quality and technical complexity' },
    { key: 'presentation', label: 'Presentation & Demo', description: 'Communication and demonstration skills' },
    { key: 'feasibility', label: 'Feasibility & Impact', description: 'Practical implementation and market potential' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Scorecard - {team?.name}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="scorecard-header">
            <div className="team-details">
              <h3>{team?.name}</h3>
              <p><strong>Category:</strong> {team?.category}</p>
              <p><strong>Round:</strong> {team?.round}</p>
              <p><strong>Judge:</strong> {team?.judge}</p>
            </div>
            <div className="score-summary">
              <div className="final-score">
                <span className="score-label">Final Score</span>
                <span className="score-value">{team?.averageScore}/10</span>
              </div>
              <div className="qualification-status">
                {team?.qualified ? 
                  <span className="badge badge-success">Qualified</span> : 
                  <span className="badge badge-error">Not Qualified</span>
                }
              </div>
            </div>
          </div>

          <div className="score-breakdown">
            <h4>Score Breakdown</h4>
            <div className="score-categories">
              {scoreCategories.map((category) => (
                <div key={category.key} className="score-category">
                  <div className="category-header">
                    <h5>{category.label}</h5>
                    <span className="category-score">{team?.scores[category.key]}/10</span>
                  </div>
                  <p className="category-description">{category.description}</p>
                  <div className="score-bar">
                    <div 
                      className="score-fill" 
                      style={{ 
                        width: `${(team?.scores[category.key] / 10) * 100}%`,
                        backgroundColor: team?.scores[category.key] >= 8 ? 'var(--success)' : 
                                        team?.scores[category.key] >= 6 ? 'var(--warning)' : 'var(--error)'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="judge-feedback">
            <h4>Judge Feedback</h4>
            <div className="feedback-content">
              <p>{team?.feedback}</p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary">
            <Download size={16} />
            Export Scorecard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoreCompiler; 