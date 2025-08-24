import React, { useState, useEffect, useContext } from "react";
import { TeamContext } from "../context/TeamContext";

const Leaderboard = () => {
  const { team } = useContext(TeamContext);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/leaderboard/overall`);
        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard data");
        }
        const data = await response.json();
        setLeaderboardData(data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        // Optionally set an error state to show in the UI
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
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
                key={entry.team_id}
                className={`table-row ${entry.team_id === team?.teamId ? "current-team" : ""}`}
              >
                <div className="rank-col">
                  {entry.rank === 1 && "🥇"}
                  {entry.rank === 2 && "🥈"}
                  {entry.rank === 3 && "🥉"}
                  {entry.rank > 3 && entry.rank}
                </div>
                <div className="team-col">
                  <span className="team-name">{entry.team_name}</span>
                  <span className="team-id">({entry.team_id})</span>
                </div>
                <div className="score-col">{entry.total_score}</div>
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
