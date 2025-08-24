from fastapi import APIRouter
from typing import List, Dict, Any

from db.mongo import db
from Schema.user_schema import LeaderboardEntry

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

@router.get("/overall", response_model=List[LeaderboardEntry])
async def get_overall_leaderboard():
    """
    Get the overall leaderboard sorted by total score.
    (Replaces GET /overall from leaderboard.js)
    """
    # In a real scenario, team data would be in a 'teams' collection
    teams_cursor = db.teams.find({"isActive": True}).sort("totalScore", -1).limit(50)
    teams = await teams_cursor.to_list(None)

    leaderboard = []
    for i, team in enumerate(teams):
        leaderboard.append(
            LeaderboardEntry(
                rank=i + 1,
                team_id=team.get("team_id"),
                team_name=team.get("team_name"),
                category=team.get("category"),
                total_score=team.get("totalScore", 0)
            )
        )
    return leaderboard

@router.get("/stats", response_model=Dict[str, Any])
async def get_leaderboard_stats():
    """
    Get aggregate statistics for the leaderboard.
    (Replaces GET /stats from leaderboard.js)
    """
    pipeline = [
        {"$match": {"isActive": True}},
        {"$group": {
            "_id": None,
            "totalTeams": {"$sum": 1},
            "averageScore": {"$avg": "$totalScore"},
            "highestScore": {"$max": "$totalScore"},
            "lowestScore": {"$min": "$totalScore"}
        }}
    ]
    stats_result = await db.teams.aggregate(pipeline).to_list(1)

    if not stats_result:
        return {
            "totalTeams": 0, "averageScore": 0, "highestScore": 0, "lowestScore": 0
        }

    return stats_result[0]
