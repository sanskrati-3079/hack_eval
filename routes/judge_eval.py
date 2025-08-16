# judge_routes.py
from fastapi import APIRouter, HTTPException, Depends, status, Query
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Optional
from datetime import datetime

from db.mongo import db
from auth.auth_routes import get_current_judge
from Schema.judge import JudgeEvaluation, JudgeFeedback, JudgeProfile

router = APIRouter(prefix="/judge", tags=["judge"])

# ---------------- PROFILE ----------------
@router.get("/profile", response_model=JudgeProfile)
async def get_profile(current_judge = Depends(get_current_judge)):
    """
    Get logged-in judge profile
    """
    judge = await db.judges.find_one({"judge_id": current_judge["judge_id"]})
    if not judge:
        raise HTTPException(status_code=404, detail="Judge not found")
    judge["_id"] = str(judge["_id"])
    return judge


# ---------------- ASSIGNED SUBMISSIONS ----------------
@router.get("/submissions")
async def get_assigned_submissions(current_judge = Depends(get_current_judge)):
    """
    Get all submissions assigned to the logged-in judge
    """
    submissions = await db.submissions.find({
        "assigned_judges": current_judge["judge_id"]
    }).to_list(None)

    for s in submissions:
        s["_id"] = str(s["_id"])
    return submissions


@router.get("/submission/{team_id}")
async def get_submission_details(team_id: str, current_judge = Depends(get_current_judge)):
    """
    Get detailed submission info for evaluation
    """
    submission = await db.submissions.find_one({"team_id": team_id})
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    team = await db.teams.find_one({"team_id": team_id})
    ai_metrics = await db.ai_metrics.find_one({"team_id": team_id})

    return {
        "submission": submission,
        "team_info": team,
        "ai_metrics": ai_metrics
    }


# ---------------- EVALUATION ----------------
@router.post("/evaluate", response_model=JudgeEvaluation)
async def submit_evaluation(evaluation: JudgeEvaluation, current_judge = Depends(get_current_judge)):
    """
    Submit evaluation for a team
    - Stores scores + feedback
    - Updates team_scores collection
    """
    team = await db.teams.find_one({"team_id": evaluation.team_id})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    round_info = await db.rounds.find_one({"round_id": evaluation.round_id})
    if not round_info:
        raise HTTPException(status_code=404, detail="Round not found")

    # Save evaluation
    eval_doc = evaluation.dict()
    eval_doc["judge_id"] = current_judge["judge_id"]
    eval_doc["submitted_at"] = datetime.utcnow()
    await db.judge_evaluations.insert_one(eval_doc)

    # Update team_scores (average across judges)
    existing = await db.team_scores.find_one({"team_id": evaluation.team_id})
    if not existing:
        await db.team_scores.insert_one({
            "team_id": evaluation.team_id,
            "round_scores": {str(evaluation.round_id): evaluation.total_score},
            "total_score": evaluation.total_score,
            "last_updated": datetime.utcnow()
        })
    else:
        # Update by averaging with other judge scores
        scores = existing.get("round_scores", {})
        prev_score = scores.get(str(evaluation.round_id), 0)
        new_score = (prev_score + evaluation.total_score) / 2 if prev_score > 0 else evaluation.total_score

        await db.team_scores.update_one(
            {"team_id": evaluation.team_id},
            {
                "$set": {
                    f"round_scores.{evaluation.round_id}": new_score,
                    "last_updated": datetime.utcnow()
                },
                "$inc": {"total_score": evaluation.total_score}
            }
        )

    return evaluation


# ---------------- MY EVALUATIONS ----------------
@router.get("/my-evaluations", response_model=List[JudgeEvaluation])
async def get_my_evaluations(current_judge = Depends(get_current_judge)):
    """
    Fetch all evaluations submitted by the judge
    """
    evaluations = await db.judge_evaluations.find({"judge_id": current_judge["judge_id"]}).to_list(None)
    for e in evaluations:
        e["_id"] = str(e["_id"])
    return evaluations
