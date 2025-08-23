# user_routes.py
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query, status
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from db.mongo import db
from auth.auth_routes import get_current_user
from Schema.user_schema import TeamInfo, Submission, Notification, LeaderboardEntry

router = APIRouter(prefix="/user", tags=["user"])

# TEAM DASHBOARD 
@router.get("/team/info", response_model=TeamInfo)
async def get_team_info(current_user = Depends(get_current_user)):
    """
    Get logged-in team details (problem statement, members, category, etc.)
    """
    team = await db.teams.find_one({"team_id": current_user["team_id"]})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    team["_id"] = str(team["_id"])
    return team


# SUBMISSIONS 
@router.post("/submission/{round_id}")
async def upload_submission(
    round_id: int,
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    """
    Upload PPT for a specific round
    - Stores metadata in DB
    - File should ideally be uploaded to cloud (S3 / GDrive / MinIO)
    """
    round_info = await db.rounds.find_one({"round_id": round_id})
    if not round_info:
        raise HTTPException(status_code=404, detail="Round not found")
    if round_info["status"] not in ["ongoing"]:
        raise HTTPException(status_code=400, detail="Submissions not allowed for this round")

    submission_doc = {
        "team_id": current_user["team_id"],
        "round_id": round_id,
        "filename": file.filename,
        "status": "submitted",
        "submitted_at": datetime.utcnow()
    }
    await db.submissions.insert_one(submission_doc)

    # Add notification
    await db.notifications.insert_one({
        "team_id": current_user["team_id"],
        "message": f"Submission received for Round {round_id}",
        "timestamp": datetime.utcnow(),
        "type": "submission"
    })

    return {"message": "Submission uploaded successfully"}


@router.get("/submission/status/{round_id}", response_model=Submission)
async def get_submission_status(round_id: int, current_user = Depends(get_current_user)):
    """
    Get submission status (submitted/pending) for a round
    """
    submission = await db.submissions.find_one({
        "team_id": current_user["team_id"],
        "round_id": round_id
    })
    if not submission:
        return {"team_id": current_user["team_id"], "round_id": round_id, "status": "pending"}
    submission["_id"] = str(submission["_id"])
    return submission


# ---------------- LEADERBOARD ----------------
@router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(
    category: Optional[str] = Query(None, description="Filter by category")
):
    """
    Leaderboard: Overall or category-wise
    """
    query = {}
    if category:
        query["category"] = category

    pipeline = [
        {"$match": query},
        {"$sort": {"total_score": -1}},
        {
            "$project": {
                "_id": 0,
                "team_id": 1,
                "team_name": 1,
                "category": 1,
                "total_score": 1
            }
        }
    ]
    leaderboard = await db.team_scores.aggregate(pipeline).to_list(None)

    # Add ranks
    for idx, entry in enumerate(leaderboard, 1):
        entry["rank"] = idx
    return leaderboard


# ---------------- NOTIFICATIONS ----------------
@router.get("/notifications", response_model=List[Notification])
async def get_notifications(current_user = Depends(get_current_user)):
    """
    Get all notifications for a team
    """
    notes = await db.notifications.find({"team_id": current_user["team_id"]}).sort("timestamp", -1).to_list(None)
    for n in notes:
        n["_id"] = str(n["_id"])
    return notes
