from fastapi import APIRouter, HTTPException, Depends, Query, status
from typing import List, Optional
from datetime import datetime
import re

from db.mongo import db
from auth.auth_routes import get_current_user
from Schema.user_schema import TeamInfo, Submission, Notification, LeaderboardEntry

# The prefix "/user" is defined in main.py, so we remove it here to avoid /user/user/
router = APIRouter(tags=["User / Teams"])

# Regex to validate a GitHub repository URL
github_repo_regex = re.compile(r'^https?://(www\.)?github\.com/[\w\-.]+/[\w\-.]+(/)?$')

# TEAM DASHBOARD
@router.get("/team/info", response_model=TeamInfo)
async def get_team_info(current_user = Depends(get_current_user)):
    """
    Get logged-in team details (problem statement, members, category, etc.)
    """
    team = await db.teams.find_one({"team_id": current_user["team_id"]})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team


# SUBMISSIONS
@router.post("/submission/{round_id}", status_code=status.HTTP_201_CREATED)
async def upload_submission(
    round_id: int,
    submission_data: Submission,
    current_user = Depends(get_current_user)
):
    """
    Upload a GitHub repository link for a specific round.
    - Validates the GitHub link format.
    - Stores submission metadata in the database.
    """
    # Validate GitHub link format
    if not github_repo_regex.match(submission_data.submission_link):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid GitHub repository link. Please provide a link in the format https://github.com/user/repo"
        )

    round_info = await db.rounds.find_one({"round_id": round_id})
    if not round_info:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Round not found")
    if round_info.get("status") not in ["ongoing"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Submissions are not currently open for this round")

    # Prevent duplicate submissions for the same round
    existing_submission = await db.submissions.find_one({"team_id": current_user["team_id"], "round_id": round_id})
    if existing_submission:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"A submission for Round {round_id} already exists.")

    submission_doc = {
        "team_id": current_user["team_id"],
        "round_id": round_id,
        "submission_link": submission_data.submission_link,
        "status": "submitted",
        "submitted_at": datetime.utcnow(),
        "feedback": None,
        "score": None
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

@router.get("/submissions", response_model=List[Submission])
async def get_all_submissions(current_user = Depends(get_current_user)):
    """
    Get all submission history for the logged-in team.
    """
    submissions = await db.submissions.find(
        {"team_id": current_user["team_id"]}
    ).sort("round_id", 1).to_list(None)
    return submissions

@router.get("/submission/status/{round_id}", response_model=Submission)
async def get_submission_status(round_id: int, current_user = Depends(get_current_user)):
    """
    Get submission status for a specific round.
    """
    submission = await db.submissions.find_one({
        "team_id": current_user["team_id"],
        "round_id": round_id
    })
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No submission found for Round {round_id}"
        )
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
    return notes
