import React, { useState, useEffect, useContext } from 'react';
import { TeamContext } from '../context/TeamContext';

const Leaderboard = () => {
  const { team } = useContext(TeamContext);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated leaderboard data
    const mockLeaderboard = [
      { rank: 1, teamId: 'TC-2024-003', name: 'Team Alpha', score: 95 },
      { rank: 2, teamId: 'TC-2024-007', name: 'Team Beta', score: 88 },
      { rank: 3, teamId: 'TC-2024-002', name: 'Team Gamma', score: 85 },
      { rank: 4, teamId: 'TC-2024-001', name: 'Team Delta', score: 82 },
      { rank: 5, teamId: 'TC-2024-005', name: 'Team Epsilon', score: 78 },
    ];

    setLeaderboardData(mockLeaderboard);
    setLoading(false);
  }, []);

  return (
    <div className="leaderboard-container">
      <h1>Hackathon Leaderboard</h1>

      {loading ? (
        <p>Loading leaderboard...</p>
      ) : (
        <div className="leaderboard-content">
          <div className="leaderboard-table">
            <div className="table-header">
              <div className="rank-col">Rank</div>
              <div className="team-col">Team</div>
              <div className="score-col">Score</div>
            </div>
            {leaderboardData.map((entry) => (
              <div
                key={entry.teamId}
                className={`table-row ${entry.teamId === team?.teamId ? 'current-team' : ''}`}
              >
                <div className="rank-col">
                  {entry.rank === 1 && '🥇'}
                  {entry.rank === 2 && '🥈'}
                  {entry.rank === 3 && '🥉'}
                  {entry.rank > 3 && entry.rank}
                </div>
                <div className="team-col">
                  <span className="team-name">{entry.name}</span>
                  <span className="team-id">({entry.teamId})</span>
                </div>
                <div className="score-col">{entry.score}</div>
              </div>
            ))}
          </div>

          <div className="leaderboard-info">
            <h2>Scoring Criteria</h2>
            <ul>
              <li>Innovation and Creativity: 30%</li>
              <li>Technical Implementation: 25%</li>
              <li>Impact and Usefulness: 20%</li>
              <li>Presentation Quality: 15%</li>
              <li>Code Quality: 10%</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;