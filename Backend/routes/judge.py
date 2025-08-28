from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from db.mongo import db
from Schema.judge import JudgeModel, JudgeEvaluation, JudgeResponse, JudgeFeedback
from Schema.team_meta import TeamMeta
from auth.auth_middleware import get_current_judge

router = APIRouter()


# ------------------ 👤 Judge Profile ------------------
@router.get("/profile", response_model=JudgeResponse)
async def get_judge_profile(current_judge = Depends(get_current_judge)):
    """Get the current judge's profile"""
    try:
        judge = await db.judges.find_one({"_id": ObjectId(current_judge["id"])})
        if not judge:
            raise HTTPException(status_code=404, detail="Judge not found")
        
        # Transform the database document to match JudgeResponse schema
        # Handle email validation - if username is not a valid email, create a dummy one
        username = judge.get("username", "")
        email = judge.get("email", "")
        if not email and username:
            # Create a valid email format from username if none exists
            email = f"{username}@gla.ac.in"
        
        judge_response = {
            "id": str(judge["_id"]),
            "name": judge.get("name", judge.get("username", "Unknown")),
            "email": email,
            "expertise": judge.get("expertise", []),
            "assigned_teams": judge.get("assigned_teams", []),
            "rounds": judge.get("rounds", [])
        }
        
        return JudgeResponse(**judge_response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ------------------ 📋 Assigned Teams ------------------
@router.get("/assigned-teams")
async def get_assigned_teams(
    round_id: Optional[int] = None,
    current_judge = Depends(get_current_judge)
):
    """Get teams assigned to the judge for evaluation"""
    try:
        query = {"judge_id": current_judge["id"]}
        if round_id is not None:
            query["round_id"] = round_id

        assignments = await db.judge_assignments.find_one(query)
        if not assignments or not assignments.get("assigned_teams"):
            return {"teams": []}
            
        teams = []
        for team_id in assignments["assigned_teams"]:
            team = await db.teams.find_one({"_id": ObjectId(team_id)})
            if team:
                teams.append(TeamMeta(**team).dict())
        return {"teams": teams}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ------------------ 👥 All Teams ------------------
@router.get("/all-teams")
async def get_all_teams(current_judge = Depends(get_current_judge)):
    """Get all teams with their problem statement details for judges to view"""
    try:
        teams = await db.team_ps_details.find({"status": "active"}).to_list(None)
        
        # Convert ObjectId to string for JSON serialization
        for team in teams:
            team["_id"] = str(team["_id"])
        
        return teams
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ------------------ 📝 Submit Evaluation ------------------
@router.post("/evaluate/{team_id}", status_code=status.HTTP_201_CREATED)
async def submit_evaluation(
    team_id: str,
    evaluation: JudgeEvaluation,
    current_judge = Depends(get_current_judge)
):
    """Submit evaluation scores and feedback for a team"""
    try:
        assignment = await db.judge_assignments.find_one({
            "judge_id": current_judge["id"],
            "round_id": evaluation.round,
            "assigned_teams": team_id
        })
        if not assignment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Team not assigned to this judge for this round"
            )
        
        feedback = JudgeFeedback(
            feedback_id=str(ObjectId()),
            judge_id=current_judge["id"],
            team_id=team_id,
            round_id=evaluation.round,
            comments=evaluation.feedback or "",
            rating=sum(evaluation.scores.values()) / len(evaluation.scores) if evaluation.scores else None,
            submitted_at=datetime.utcnow()
        )
        
        eval_doc = feedback.dict()
        eval_doc["detailed_scores"] = evaluation.scores
        
        await db.judge_feedback.update_one(
            {
                "team_id": team_id,
                "judge_id": current_judge["id"],
                "round_id": evaluation.round
            },
            {"$set": eval_doc},
            upsert=True
        )
        
        return {"message": "Evaluation submitted successfully", "feedback_id": feedback.feedback_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ------------------ 📊 View Evaluations ------------------
@router.get("/evaluations")
async def get_evaluations(
    round_id: Optional[int] = None,
    team_id: Optional[str] = None,
    current_judge = Depends(get_current_judge)
):
    """View submitted evaluations by the judge"""
    try:
        query = {"judge_id": current_judge["id"]}
        if round_id is not None:
            query["round_id"] = round_id
        if team_id is not None:
            query["team_id"] = team_id
            
        evaluations = []
        async for eval in db.judge_feedback.find(query):
            team = await db.teams.find_one({"_id": ObjectId(eval["team_id"])})
            if team:
                eval_data = {
                    "feedback_id": eval["feedback_id"],
                    "team_id": eval["team_id"],
                    "team_name": team.get("team_name"),
                    "round_id": eval["round_id"],
                    "comments": eval["comments"],
                    "rating": eval["rating"],
                    "detailed_scores": eval.get("detailed_scores", {}),
                    "submitted_at": eval["submitted_at"]
                }
                evaluations.append(eval_data)
                
        return {"evaluations": evaluations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
