import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Award,
  Users,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Play
} from 'lucide-react';
import { getJudgeProfile, getAllTeams } from '../utils/api.js';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [judgeName, setJudgeName] = useState('Judge');
  const [isLoading, setIsLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [judgeProfileError, setJudgeProfileError] = useState(false);
  const [activeRound, setActiveRound] = useState(null);
  
  // Filtering and pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [teamsPerPage] = useState(6);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchJudgeProfile = async () => {
      try {
        const profile = await getJudgeProfile();
        if (profile && profile.name) {
          setJudgeName(profile.name);
        } else if (profile && profile.username) {
          setJudgeName(profile.username);
        }
      } catch (error) {
        console.error('Failed to fetch judge profile:', error);
        setJudgeProfileError(true);
        // Fallback to username from localStorage if available
        const storedUsername = localStorage.getItem('judgeUsername');
        if (storedUsername) {
          setJudgeName(storedUsername);
        } else {
          setJudgeName('Judge'); // Default fallback
        }
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTeams = async () => {
      try {
        const teamsData = await getAllTeams();
        setTeams(teamsData);
        console.log('Teams fetched successfully:', teamsData);
      } catch (error) {
        console.error('Failed to fetch teams:', error);
        // Set error state to show user-friendly message
        setTeams([]);
      } finally {
        setTeamsLoading(false);
      }
    };

    // Try to fetch teams first since that's the main requirement
    fetchTeams();
    // Then try to fetch judge profile (this might fail due to schema issues)
    fetchJudgeProfile();
  }, []);

  // Filter teams based on search term and category
  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.team_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.college?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           team.problem_statement?.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter dropdown
  const categories = ['all', ...Array.from(new Set(teams.map(team => team.problem_statement?.category).filter(Boolean)))];

  // Pagination logic
  const indexOfLastTeam = currentPage * teamsPerPage;
  const indexOfFirstTeam = indexOfLastTeam - teamsPerPage;
  const currentTeams = filteredTeams.slice(indexOfFirstTeam, indexOfLastTeam);
  const totalPages = Math.ceil(filteredTeams.length / teamsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  // Fetch current round and keep it updated
  useEffect(() => {
    let mounted = true;
    let timerId;
    const fetchActive = async () => {
      try {
        const res = await fetch('http://localhost:8000/round-state/active');
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

  const handleTeamSelect = (team) => {
    // Navigate to evaluation page with complete team data
    navigate('/evaluate', { 
      state: { selectedTeam: team } 
    });
  };

  const handleViewTeam = (team) => {
    // For now, just show team details in console
    console.log('Team details:', team);
    // You can implement a modal or expand the card to show more details
  };

  const stats = [
    {
      title: 'Total Teams',
      value: teamsLoading ? '...' : teams.length.toString(),
      icon: <Users size={24} />,
      color: 'blue',
    },
    {
      title: 'Evaluated',
      value: '18',
      icon: <CheckCircle size={24} />,
      color: 'green',
    },
    {
      title: 'Pending Review',
      value: '6',
      icon: <Clock size={24} />,
      color: 'orange',
    },
    // {
    //   title: 'Average Score',
    //   value: '7.8',
    //   icon: <TrendingUp size={24} />,
    //   color: 'purple',
    //   change: '+0.3 from last round'
    // }
  ];

  // Get first 6 teams for display
  const displayTeams = teams.slice(0, 6);

  const quickActions = [
    {
      title: 'Start New Evaluation',
      description: 'Begin evaluating the next submission',
      action: 'Evaluate',
      icon: <FileText size={20} />
    },
    {
      title: 'View Final Submissions',
      description: 'See all approved submissions',
      action: 'View',
      icon: <Award size={20} />
    },
    {
      title: 'My Evaluations',
      description: 'Review your completed evaluations',
      action: 'Review',
      icon: <CheckCircle size={20} />
    }
  ];

  return (
    <div className="dashboard">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h1 className="page-title">Welcome back, {judgeName}</h1>
          <p className="page-subtitle">Here's your evaluation overview.</p>
          {judgeProfileError && (
            <p className="page-error">Note: Using fallback profile data</p>
          )}
        </div>
        <div className="current-round" style={{ background: '#E5F5EC', color: '#1B4332', padding: '8px 16px', borderRadius: 8, fontWeight: 600, fontSize: '14px' }}>
          Current Round: {activeRound ? `Round ${activeRound}` : 'None'}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card stat-${stat.color}`}>
            <div className="stat-icon">
              {stat.icon}
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-title">{stat.title}</p>
              <p className="stat-change">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        {/* Teams List */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>All Teams</h2>
            <div className="section-actions">
              <div className="search-filter-container">
                {/* Search Bar */}
                <div className="search-container">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search teams or colleges..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
                
                {/* Category Filter */}
                <div className="filter-container">
                  <Filter size={18} className="filter-icon" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="category-filter"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="results-summary">
            <span className="results-count">
              Showing {filteredTeams.length} of {teams.length} teams
            </span>
            {searchTerm && (
              <span className="search-term">
                for "{searchTerm}"
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="category-term">
                in {selectedCategory}
              </span>
            )}
          </div>

          {teamsLoading ? (
            <div className="loading">Loading teams...</div>
          ) : filteredTeams.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No teams found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <>
              <div className="teams-list">
                {currentTeams.map((team, index) => (
                  <div key={index} className="team-item">
                    <div className="team-info">
                      <h4>{team.team_name}</h4>
                      <p className="team-category">Category: {team.problem_statement?.category || 'N/A'}</p>
                      <p className="team-domain">Domain: {team.problem_statement?.domain || 'N/A'}</p>
                    </div>
                    <div className="team-details">
                      <div className="college-badge">{team.college}</div>
                      {/* <div className="difficulty-badge">{team.problem_statement?.difficulty || 'N/A'}</div> */}
                    </div>
                    <div className="team-actions">
                      {/* <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleViewTeam(team)}
                        title="View Team Details"
                      >
                        <Eye size={16} />
                        View
                      </button> */}
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleTeamSelect(team)}
                        title="Evaluate This Team"
                      >
                        <Play size={16} />
                        Evaluate
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  
                  <div className="page-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        className={`page-btn ${page === currentPage ? 'active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;



