import React, { useState } from 'react';
import { 
  Trophy, 
  TrendingUp, 
  Eye, 
  Globe, 
  Download, 
  Filter,
  BarChart3,
  Award,
  Star,
  Users,
  Calendar
} from 'lucide-react';

const Leaderboard = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRound, setSelectedRound] = useState('all');
  const [viewMode, setViewMode] = useState('overall'); // 'overall', 'category'
  const [isPublished, setIsPublished] = useState(false);

  const teams = [
    {
      id: 1,
      name: 'Team Alpha',
      category: 'AI/ML',
      round: 'Round 1',
      totalScore: 32.0,
      averageScore: 8.0,
      rank: 1,
      previousRank: 2,
      qualified: true,
      members: ['John Doe', 'Jane Smith', 'Mike Johnson'],
      project: 'AI-powered healthcare diagnostics'
    },
    {
      id: 2,
      name: 'Team Gamma',
      category: 'Mobile App',
      round: 'Round 1',
      totalScore: 32.0,
      averageScore: 8.0,
      rank: 2,
      previousRank: 1,
      qualified: true,
      members: ['Carol Davis', 'David Miller', 'Eva Garcia'],
      project: 'Sustainable living tracker'
    },
    {
      id: 3,
      name: 'Team Beta',
      category: 'Web Development',
      round: 'Round 1',
      totalScore: 31.0,
      averageScore: 7.75,
      rank: 3,
      previousRank: 3,
      qualified: true,
      members: ['Alice Brown', 'Bob Wilson'],
      project: 'E-commerce platform for local businesses'
    },
    {
      id: 4,
      name: 'Team Delta',
      category: 'AI/ML',
      round: 'Round 1',
      totalScore: 26.0,
      averageScore: 6.5,
      rank: 4,
      previousRank: 4,
      qualified: false,
      members: ['Frank Lee', 'Grace Taylor'],
      project: 'Smart traffic management system'
    },
    {
      id: 5,
      name: 'Team Echo',
      category: 'IoT',
      round: 'Round 1',
      totalScore: 30.0,
      averageScore: 7.5,
      rank: 5,
      previousRank: 6,
      qualified: true,
      members: ['Henry Adams', 'Ivy Chen'],
      project: 'Smart home automation system'
    }
  ];

  const categories = ['all', 'AI/ML', 'Web Development', 'Mobile App', 'IoT', 'Blockchain'];
  const rounds = ['all', 'Round 1', 'Round 2', 'Round 3'];

  const filteredTeams = teams.filter(team => {
    const matchesCategory = selectedCategory === 'all' || team.category === selectedCategory;
    const matchesRound = selectedRound === 'all' || team.round === selectedRound;
    return matchesCategory && matchesRound;
  }).sort((a, b) => a.rank - b.rank);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy size={20} style={{ color: '#FFD700' }} />;
      case 2:
        return <Award size={20} style={{ color: '#C0C0C0' }} />;
      case 3:
        return <Award size={20} style={{ color: '#CD7F32' }} />;
      default:
        return <span className="rank-number">{rank}</span>;
    }
  };

  const getRankChange = (currentRank, previousRank) => {
    if (currentRank < previousRank) {
      return <span className="rank-change positive">↑ {previousRank - currentRank}</span>;
    } else if (currentRank > previousRank) {
      return <span className="rank-change negative">↓ {currentRank - previousRank}</span>;
    } else {
      return <span className="rank-change neutral">-</span>;
    }
  };

  const handlePublishLeaderboard = () => {
    setIsPublished(true);
    // Publish functionality would be implemented here
    console.log('Publishing leaderboard...');
  };

  const handleExportLeaderboard = () => {
    // Export functionality would be implemented here
    console.log('Exporting leaderboard...');
  };

  const calculateStats = () => {
    const qualifiedTeams = teams.filter(t => t.qualified);
    const avgScore = teams.reduce((sum, t) => sum + t.averageScore, 0) / teams.length;
    
    return {
      totalTeams: teams.length,
      qualifiedTeams: qualifiedTeams.length,
      averageScore: avgScore.toFixed(2),
      topScore: Math.max(...teams.map(t => t.averageScore)),
      categoryCount: new Set(teams.map(t => t.category)).size
    };
  };

  const stats = calculateStats();

  return (
    <div className="leaderboard">
      <div className="page-header">
        <h1 className="page-title">Leaderboard</h1>
        <p className="page-subtitle">Generate and manage hackathon rankings</p>
      </div>

      {/* Statistics Overview */}
      <div className="stats-overview">
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-icon" style={{ backgroundColor: 'var(--primary-dark)20', color: 'var(--primary-dark)' }}>
                <Trophy size={24} />
              </div>
              <h3>Total Teams</h3>
            </div>
            <div className="card-value">
              <span className="value">{stats.totalTeams}</span>
              <span className="change">Ranked</span>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-icon" style={{ backgroundColor: 'var(--success)20', color: 'var(--success)' }}>
                <Star size={24} />
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
                <Users size={24} />
              </div>
              <h3>Categories</h3>
            </div>
            <div className="card-value">
              <span className="value">{stats.categoryCount}</span>
              <span className="change">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls and Actions */}
      <div className="action-bar">
        <div className="view-controls">
          <button 
            className={`btn ${viewMode === 'overall' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('overall')}
          >
            <BarChart3 size={16} />
            Overall Rankings
          </button>
          <button 
            className={`btn ${viewMode === 'category' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('category')}
          >
            <Filter size={16} />
            Category-wise
          </button>
        </div>

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
        </div>

        <div className="action-buttons">
          <button className="btn btn-secondary" onClick={handleExportLeaderboard}>
            <Download size={16} />
            Export
          </button>
          <button 
            className={`btn ${isPublished ? 'btn-success' : 'btn-primary'}`}
            onClick={handlePublishLeaderboard}
            disabled={isPublished}
          >
            <Globe size={16} />
            {isPublished ? 'Published' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="card">
        <div className="card-header">
          <h3>
            {viewMode === 'overall' ? 'Overall Leaderboard' : 'Category-wise Rankings'}
            {isPublished && <span className="published-badge">Published</span>}
          </h3>
        </div>
        <div className="card-body">
          <div className="table-container">
            <table className="table leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Team</th>
                  <th>Category</th>
                  <th>Project</th>
                  <th>Members</th>
                  <th>Total Score</th>
                  <th>Average</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map((team) => (
                  <tr key={team.id} className={team.rank <= 3 ? 'top-team' : ''}>
                    <td>
                      <div className="rank-cell">
                        {getRankIcon(team.rank)}
                        {getRankChange(team.rank, team.previousRank)}
                      </div>
                    </td>
                    <td>
                      <div className="team-info">
                        <strong>{team.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">{team.category}</span>
                    </td>
                    <td>
                      <div className="project-title">
                        {team.project}
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
                      <span className="total-score">{team.totalScore}/40</span>
                    </td>
                    <td>
                      <span className="average-score">{team.averageScore}/10</span>
                    </td>
                    <td>
                      {team.qualified ? 
                        <span className="badge badge-success">Qualified</span> : 
                        <span className="badge badge-error">Not Qualified</span>
                      }
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-secondary btn-sm">
                          <Eye size={14} />
                          View
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

      {/* Category-wise Rankings */}
      {viewMode === 'category' && (
        <div className="category-rankings">
          {categories.filter(cat => cat !== 'all').map(category => {
            const categoryTeams = teams.filter(team => team.category === category);
            if (categoryTeams.length === 0) return null;

            return (
              <div key={category} className="card">
                <div className="card-header">
                  <h3>{category} Rankings</h3>
                </div>
                <div className="card-body">
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Team</th>
                          <th>Project</th>
                          <th>Average Score</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoryTeams
                          .sort((a, b) => a.averageScore - b.averageScore)
                          .reverse()
                          .map((team, index) => (
                            <tr key={team.id}>
                              <td>
                                <div className="rank-cell">
                                  {getRankIcon(index + 1)}
                                </div>
                              </td>
                              <td>
                                <strong>{team.name}</strong>
                              </td>
                              <td>{team.project}</td>
                              <td>
                                <span className="average-score">{team.averageScore}/10</span>
                              </td>
                              <td>
                                {team.qualified ? 
                                  <span className="badge badge-success">Qualified</span> : 
                                  <span className="badge badge-error">Not Qualified</span>
                                }
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Leaderboard; 