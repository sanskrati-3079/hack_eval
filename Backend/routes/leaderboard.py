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


@router.get("/ppt", response_model=List[Dict[str, Any]])
async def get_ppt_leaderboard(limit: int = 100):
    """
    Leaderboard based on PPT report marks stored in `ppt_reports` collection.
    Assumes each document structure:
      { sheet_name, data: { team_name, ...criteria numeric fields... }, upload_timestamp }

    We sum all numeric fields in `data` except obvious non-score keys to compute total.
    """
    # Keys inside `data` that are not scores
    non_score_keys = {
        "team_id",
        "team_name",
        "Team Name",
        "category",
        "Category",
        "project",
        "Project",
        "round",
        "Round",
    }

    # Build pipeline to compute total score per team_name
    pipeline = [
        {"$project": {
            "team_name": {
                "$ifNull": ["$data.team_name", {"$ifNull": ["$data.Team Name", "Unknown Team"]}]
            },
            "data": "$data"
        }},
        {"$project": {
            "team_name": 1,
            # Convert key-value pairs to array to filter numeric values
            "pairs": {"$objectToArray": "$data"}
        }},
        {"$project": {
            "team_name": 1,
            "numeric_values": {
                "$map": {
                    "input": {
                        "$filter": {
                            "input": "$pairs",
                            "as": "p",
                            "cond": {
                                "$and": [
                                    {"$not": {"$in": ["$$p.k", list(non_score_keys)]}},
                                    {"$isNumber": {
                                        "$convert": {"input": "$$p.v", "to": "double", "onError": None, "onNull": None}
                                    }}
                                ]
                            }
                        }
                    },
                    "as": "q",
                    "in": {"$convert": {"input": "$$q.v", "to": "double", "onError": 0, "onNull": 0}}
                }
            }
        }},
        {"$project": {
            "team_name": 1,
            "total": {"$sum": "$numeric_values"}
        }},
        {"$group": {
            "_id": "$team_name",
            "team_name": {"$first": "$team_name"},
            "total_score": {"$max": "$total"}
        }},
        {"$sort": {"total_score": -1}},
        {"$limit": limit},
        {"$project": {"_id": 0, "team_name": 1, "total_score": {"$round": ["$total_score", 2]}}}
    ]

    results = await db.ppt_reports.aggregate(pipeline).to_list(None)

    # Add rank field
    for idx, doc in enumerate(results, start=1):
        doc["rank"] = idx

    return results