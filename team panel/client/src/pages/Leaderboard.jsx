import React, { useState, useEffect, useContext } from "react";
import { Search, Trophy, Medal, Award, TrendingUp, Users, Target } from "lucide-react";
import { TeamContext } from "../context/TeamContext";
import { API_BASE_URL } from "../config";
import "./Leaderboard.css";

const Leaderboard = () => {
  const { team } = useContext(TeamContext);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [criteriaDetails, setCriteriaDetails] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use the PPT leaderboard endpoint instead of overall
        const response = await fetch(`${API_BASE_URL}/leaderboard/ppt`);

        if (!response.ok) {
          throw new Error(`Failed to fetch leaderboard: ${response.status}`);
        }

        const data = await response.json();

        // Sort data numerically by rank to ensure proper order
        const sortedData = [...data].sort((a, b) => {
          // Convert ranks to numbers for proper sorting
          return parseInt(a.rank) - parseInt(b.rank);
        });

        setLeaderboardData(sortedData);

        // Extract scoring criteria details from the first entry if available
        if (sortedData.length > 0) {
          const firstEntry = sortedData[0];
          setCriteriaDetails({
            innovation: firstEntry.innovation_uniqueness || 0,
            technical: firstEntry.technical_feasibility || 0,
            impact: firstEntry.potential_impact || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setError(error.message || "Failed to load leaderboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Function to highlight the current team's row
  const isCurrentTeam = (teamName) => {
    return team && (team.teamName === teamName || team.teamId === teamName);
  };

  // Function to get badge for top ranks
  const getRankBadge = (rank) => {
    const rankNum = parseInt(rank);

    switch (rankNum) {
      case 1:
        return (
          <div className="rank-badge gold">
            <Trophy className="w-5 h-5" />
            <span>1st</span>
          </div>
        );
      case 2:
        return (
          <div className="rank-badge silver">
            <Medal className="w-5 h-5" />
            <span>2nd</span>
          </div>
        );
      case 3:
        return (
          <div className="rank-badge bronze">
            <Award className="w-5 h-5" />
            <span>3rd</span>
          </div>
        );
      default:
        return <div className="rank-number">{rankNum}</div>;
    }
  };

  // Filter leaderboard data based on search term
  const filteredData = leaderboardData.filter((entry) =>
    entry.team_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="leaderboard-wrapper">
      {/* Animated background elements */}
      <div className="background-elements">
        <div className="bg-element bg-element-1"></div>
        <div className="bg-element bg-element-2"></div>
      </div>

      <div className="leaderboard-container">
        {/* Header Section */}
        <div className="header-section">
          <div className="live-badge">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            <span className="live-text">Live Rankings</span>
          </div>
          
          <h1 className="main-title">
            Hackathon Leaderboard
          </h1>
          
          <p className="subtitle">
            Current standings based on PPT evaluation round
          </p>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <div className="search-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading leaderboard data...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-message">
            <p>⚠️ {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="retry-button"
            >
              Try Again
            </button>
          </div>
        )}

        {/* No Data State */}
        {!loading && !error && leaderboardData.length === 0 && (
          <div className="no-data-message">
            <p>No leaderboard data available yet. Check back later!</p>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && leaderboardData.length > 0 && (
          <div className="main-content">
            {/* Leaderboard Table */}
            <div className="table-section">
              <div className="table-container">
                {/* Table Header */}
                <div className="table-header">
                  <div className="header-grid">
                    <div className="header-cell rank-header">Rank</div>
                    <div className="header-cell team-header">Team</div>
                    <div className="header-cell score-header">Innovation</div>
                    <div className="header-cell score-header">Technical</div>
                    <div className="header-cell score-header">Impact</div>
                    <div className="header-cell total-header">Total</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="table-body">
                  {filteredData.length > 0 ? (
                    filteredData.map((entry, index) => (
                      <div
                        key={entry.team_name}
                        className={`table-row ${
                          isCurrentTeam(entry.team_name) ? 'current-team-row' : ''
                        } ${index < 3 ? 'top-three' : ''}`}
                      >
                        <div className="row-grid">
                          {/* Rank */}
                          <div className="cell rank-cell">
                            {getRankBadge(entry.rank)}
                          </div>

                          {/* Team Name */}
                          <div className="cell team-cell">
                            <div className="team-info">
                              <span className="team-name">
                                {entry.team_name}
                              </span>
                              {isCurrentTeam(entry.team_name) && (
                                <span className="your-team-badge">
                                  <Users className="w-3 h-3" />
                                  Your Team
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Innovation Score */}
                          <div className="cell score-cell">
                            <div className="score-wrapper">
                              <div className="score-info">
                                <span className="score-value">
                                  {entry.innovation_uniqueness || 0}/10
                                </span>
                              </div>
                              <div className="progress-bar">
                                <div
                                  className="progress-fill innovation-fill"
                                  style={{ width: `${((entry.innovation_uniqueness || 0) / 10) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>

                          {/* Technical Score */}
                          <div className="cell score-cell">
                            <div className="score-wrapper">
                              <div className="score-info">
                                <span className="score-value">
                                  {entry.technical_feasibility || 0}/10
                                </span>
                              </div>
                              <div className="progress-bar">
                                <div
                                  className="progress-fill technical-fill"
                                  style={{ width: `${((entry.technical_feasibility || 0) / 10) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>

                          {/* Impact Score */}
                          <div className="cell score-cell">
                            <div className="score-wrapper">
                              <div className="score-info">
                                <span className="score-value">
                                  {entry.potential_impact || 0}/10
                                </span>
                              </div>
                              <div className="progress-bar">
                                <div
                                  className="progress-fill impact-fill"
                                  style={{ width: `${((entry.potential_impact || 0) / 10) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>

                          {/* Total Score */}
                          <div className="cell total-cell">
                            <div className="total-score-wrapper">
                              <span className="total-score">
                                {entry.total_score}
                              </span>
                              <div className="total-max">/30</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-results">
                      <div className="no-results-text">No teams found matching your search</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="sidebar-section">
              {/* Evaluation Criteria */}
              <div className="criteria-card">
                <h3 className="criteria-title">
                  <Target className="w-5 h-5 text-blue-600" />
                  Evaluation Criteria
                </h3>
                
                <div className="criteria-list">
                  <div className="criteria-item">
                    <div className="criteria-indicator innovation-indicator"></div>
                    <div className="criteria-content">
                      <div className="criteria-name">Innovation & Uniqueness</div>
                      <div className="criteria-description">
                        Evaluates the originality of your solution and how it stands out from existing solutions
                      </div>
                    </div>
                  </div>

                  <div className="criteria-item">
                    <div className="criteria-indicator technical-indicator"></div>
                    <div className="criteria-content">
                      <div className="criteria-name">Technical Feasibility</div>
                      <div className="criteria-description">
                        Measures how realistic and technically sound your proposed implementation is
                      </div>
                    </div>
                  </div>

                  <div className="criteria-item">
                    <div className="criteria-indicator impact-indicator"></div>
                    <div className="criteria-content">
                      <div className="criteria-name">Potential Impact</div>
                      <div className="criteria-description">
                        Assesses the potential reach and positive effect your solution could have if implemented
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Status */}
              {team && leaderboardData.find(entry => isCurrentTeam(entry.team_name)) && (
                <div className="team-status-card">
                  <h3 className="team-status-title">
                    <Users className="w-5 h-5 text-emerald-600" />
                    Your Performance
                  </h3>
                  
                  <div className="team-rank-display">
                    <div className="current-rank">
                      #{leaderboardData.find(entry => isCurrentTeam(entry.team_name)).rank}
                    </div>
                    <div className="rank-context">
                      out of {leaderboardData.length} teams
                    </div>
                  </div>
                </div>
              )}

              {/* Stats Card */}
              <div className="stats-card">
                <h3 className="stats-title">Competition Stats</h3>
                
                <div className="stats-list">
                  <div className="stat-item">
                    <span className="stat-label">Total Teams</span>
                    <span className="stat-value">{leaderboardData.length}</span>
                  </div>
                  
                  <div className="stat-item">
                    <span className="stat-label">Average Score</span>
                    <span className="stat-value">
                      {(leaderboardData.reduce((sum, team) => sum + team.total_score, 0) / leaderboardData.length).toFixed(1)}
                    </span>
                  </div>
                  
                  <div className="stat-item">
                    <span className="stat-label">Highest Score</span>
                    <span className="stat-value">
                      {Math.max(...leaderboardData.map(team => team.total_score))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;