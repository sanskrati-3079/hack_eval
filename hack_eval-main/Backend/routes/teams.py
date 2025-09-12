from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any

from db.mongo import db
from auth.auth_routes import get_current_user
from Schema.user_schema import TeamInfo # Assuming a more detailed schema might be needed
from pydantic import BaseModel, Field

# A more detailed Team model for responses, including nested data
class ActivityDataItem(BaseModel):
    name: str
    value: int

class ProgressDataItem(BaseModel):
    name: str
    completed: int

class PerformanceDataItem(BaseModel):
    day: str
    score: int

class KeyMetrics(BaseModel):
    commitCount: int
    codeReviews: int
    testsWritten: int
    bugsFixed: int
    score: int
class MemberContribution(BaseModel):
    name: str
    role: str
    totalHours: float
    contributionsCount: int
    lastContribution: str | None = None

class TeamAnalytics(BaseModel):
    activityData: List[ActivityDataItem]
    progressData: List[ProgressDataItem]
    performanceData: List[PerformanceDataItem]
    keyMetrics: KeyMetrics
    keyInsights: List[str]

router = APIRouter(prefix="/teams", tags=["Teams"])

@router.get("", response_model=List[dict])
async def get_all_teams():
    """
    Get all active teams, sorted by total score.
    (Replaces GET / from teams.js)
    """
    teams = await db.teams.find({"isActive": True}).sort("totalScore", -1).to_list(None)
    # Convert ObjectId to string for JSON serialization
    for team in teams:
        team["_id"] = str(team["_id"])
    return teams

@router.get("/{team_id}", response_model=dict)
async def get_team_by_id(team_id: str):
    """
    Get a single team by its unique ID.
    (Replaces GET /:id and GET /team/:teamId from teams.js)
    """
    # Find by custom teamId field first, then by MongoDB _id
    team = await db.teams.find_one({"team_id": team_id})
    if not team:
        from bson import ObjectId
        if ObjectId.is_valid(team_id):
            team = await db.teams.find_one({"_id": ObjectId(team_id)})
        if not team:
            raise HTTPException(status_code=404, detail="Team not found")

    team["_id"] = str(team["_id"])
    return team

@router.get("/category/{category}", response_model=List[dict])
async def get_teams_by_category(category: str):
    """
    Get all active teams for a specific category.
    (Replaces GET /category/:category from teams.js)
    """
    teams = await db.teams.find({"category": category, "isActive": True}).sort("totalScore", -1).to_list(None)
    for team in teams:
        team["_id"] = str(team["_id"])
    return teams

@router.get("/{team_id}/analytics", response_model=TeamAnalytics)
async def get_team_analytics(team_id: str):
    """
    Get calculated analytics for a specific team, formatted for the frontend charts.
    """
    team_doc = await db.teams.find_one({"team_id": team_id})
    if not team_doc:
        raise HTTPException(status_code=404, detail="Team not found")

    # The backend now constructs the exact data structure the frontend needs.
    # In a real application, this data would be calculated from commits, tasks, etc.
    # For now, we simulate it based on the team's stored analytics.
    team_analytics = team_doc.get("analytics", {})

    analytics_data = {
        "activityData": [
            {"name": 'Code Commits', "value": team_analytics.get('commitCount', 156)},
            {"name": 'Code Reviews', "value": team_analytics.get('codeReviews', 24)},
            {"name": 'Tests Written', "value": team_analytics.get('testsWritten', 89)},
            {"name": 'Bugs Fixed', "value": team_analytics.get('bugsFixed', 15)},
            {"name": 'Documentation', "value": 20}, # Example static value
        ],
        "progressData": [
            {"name": 'Planning', "completed": 100},
            {"name": 'Design', "completed": 85},
            {"name": 'Development', "completed": 60},
            {"name": 'Testing', "completed": 40},
            {"name": 'Documentation', "completed": 30},
        ],
        "performanceData": [
            {"day": 'Mon', "score": 85},
            {"day": 'Tue', "score": 88},
            {"day": 'Wed', "score": 92},
            {"day": 'Thu', "score": 90},
            {"day": 'Fri', "score": 95},
        ],
        "keyMetrics": {
            "commitCount": team_analytics.get('commitCount', 156),
            "codeReviews": team_analytics.get('codeReviews', 24),
            "testsWritten": team_analytics.get('testsWritten', 89),
            "bugsFixed": team_analytics.get('bugsFixed', 15),
            "score": team_doc.get("score", 85)
        },
        "keyInsights": [
            f"High commit activity with {team_analytics.get('commitCount', 156)} total commits",
            f"Strong code review culture with {team_analytics.get('codeReviews', 24)} reviews",
            f"Robust testing with {team_analytics.get('testsWritten', 89)} tests written",
            f"Efficient bug resolution: {team_analytics.get('bugsFixed', 15)} bugs fixed"
        ]
    }

    return analytics_data
