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
  Play,
  RefreshCw
} from 'lucide-react';
import { getJudgeProfile, getAllTeams, getMyEvaluations } from '../utils/api.js';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { API_BASE_URL } from '../config.js';

const Dashboard = () => {
  const [judgeName, setJudgeName] = useState('Judge');
  const [isLoading, setIsLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [judgeProfileError, setJudgeProfileError] = useState(false);
  const [activeRound, setActiveRound] = useState(null);
  const [evaluatedCount, setEvaluatedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(false);
  
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

    const fetchEvaluationStats = async () => {
      try {
        setStatsLoading(true);
        const myEvaluations = await getMyEvaluations();
        setEvaluatedCount(myEvaluations.length);
        
        // Calculate pending count (total teams - evaluated teams)
        const totalTeams = teams.length;
        setPendingCount(Math.max(0, totalTeams - myEvaluations.length));
      } catch (error) {
        console.error('Failed to fetch evaluation stats:', error);
        setEvaluatedCount(0);
        setPendingCount(0);
      } finally {
        setStatsLoading(false);
      }
    };

    // Try to fetch teams first since that's the main requirement
    fetchTeams();
    // Then try to fetch judge profile (this might fail due to schema issues)
    fetchJudgeProfile();
    // Fetch evaluation statistics
    fetchEvaluationStats();
  }, []);

  // Filter teams based on search term and category
  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.team_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.college?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.team_leader?.name?.toLowerCase().includes(searchTerm.toLowerCase());
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

  // Update evaluation stats when teams are loaded
  useEffect(() => {
    if (teams.length > 0) {
      const fetchEvaluationStats = async () => {
        try {
          setStatsLoading(true);
          const myEvaluations = await getMyEvaluations();
          setEvaluatedCount(myEvaluations.length);
          
          // Calculate pending count (total teams - evaluated teams)
          setPendingCount(Math.max(0, teams.length - myEvaluations.length));
        } catch (error) {
          console.error('Failed to fetch evaluation stats:', error);
          setEvaluatedCount(0);
          setPendingCount(0);
        } finally {
          setStatsLoading(false);
        }
      };
      
      fetchEvaluationStats();
    }
  }, [teams]);

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

  // Refresh stats when component becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && teams.length > 0) {
        refreshEvaluationStats();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [teams]);

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

  const refreshEvaluationStats = async () => {
    try {
      setStatsLoading(true);
      const myEvaluations = await getMyEvaluations();
      setEvaluatedCount(myEvaluations.length);
      setPendingCount(Math.max(0, teams.length - myEvaluations.length));
    } catch (error) {
      console.error('Failed to refresh evaluation stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Teams',
      value: teamsLoading ? '...' : teams.length.toString(),
      icon: <Users size={24} />,
      color: 'blue',
      subtitle: 'Available for evaluation'
    },
    {
      title: 'Evaluated',
      value: statsLoading ? '...' : evaluatedCount.toString(),
      icon: <CheckCircle size={24} />,
      color: 'green',
      subtitle: 'Completed evaluations'
    },
    {
      title: 'Pending Review',
      value: statsLoading ? '...' : pendingCount.toString(),
      icon: <Clock size={24} />,
      color: 'orange',
      subtitle: 'Awaiting evaluation'
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={refreshEvaluationStats}
            disabled={statsLoading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px' }}
            title="Refresh evaluation statistics"
          >
            <RefreshCw size={16} className={statsLoading ? 'loading-spinner' : ''} />
            {statsLoading ? 'Refreshing...' : 'Refresh Stats'}
          </button>
          <div className="current-round" style={{ background: '#E5F5EC', color: '#1B4332', padding: '8px 16px', borderRadius: 8, fontWeight: 600, fontSize: '14px' }}>
            Current Round: {activeRound ? `Round ${activeRound}` : 'None'}
          </div>
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
              {stat.subtitle && <p className="stat-subtitle">{stat.subtitle}</p>}
              {stat.change && <p className="stat-change">{stat.change}</p>}
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
                    placeholder="Search teams, colleges, or team leaders..."
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
                      {/* <p className="team-domain">Domain: {team.problem_statement?.domain || 'N/A'}</p> */}
                      <p className="team-leader">Leader: {team.team_leader?.name || 'N/A'}</p>
                    </div>
                    <div className="team-details">
                      <div className="college-badge">{team.college}</div>
                      <div className="team-id-badge">ID: {team.team_id}</div>
                    </div>
                    <div className="team-actions">
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



