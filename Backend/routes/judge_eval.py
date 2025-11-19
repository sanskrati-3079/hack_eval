from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional
from datetime import datetime
import uuid

# ✅ Use the collection getter functions instead of direct imports
from Schema.evaluation import (
    TeamEvaluation, 
    JudgeEvaluationScore, 
    EvaluationSummary,
    JudgeEvaluationHistory,
    get_team_evaluations_collection,
    get_evaluation_summary_collection,
    get_judge_evaluation_history_collection
)
from Schema.judge import JudgeModel
from auth.auth_middleware import get_current_judge

router = APIRouter(tags=["Judge Evaluation"])
security = HTTPBearer()

# ==================== EVALUATION CRUD OPERATIONS ====================

@router.post("/submit", response_model=dict)
async def submit_evaluation(
    evaluation_data: dict,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        current_judge = await get_current_judge(credentials.credentials)
        evaluation_id = str(uuid.uuid4())
        
        scores = JudgeEvaluationScore(
            problem_solution_fit=float(evaluation_data.get("problem_solution_fit", 5)),
            functionality_features=float(evaluation_data.get("functionality_features", 5)),
            technical_feasibility=float(evaluation_data.get("technical_feasibility", 5)),
            innovation_creativity=float(evaluation_data.get("innovation_creativity", 5)),
            user_experience=float(evaluation_data.get("user_experience", 5)),
            impact_value=float(evaluation_data.get("impact_value", 5)),
            presentation_demo_quality=float(evaluation_data.get("presentation_demo_quality", 5)),
            team_collaboration=float(evaluation_data.get("team_collaboration", 5))
        )
        
        weights = {
            "problem_solution_fit": 10,
            "functionality_features": 20,
            "technical_feasibility": 20,
            "innovation_creativity": 15,
            "user_experience": 15,
            "impact_value": 10,
            "presentation_demo_quality": 5,
            "team_collaboration": 5,
        }
        
        raw_scores = [
            scores.problem_solution_fit,
            scores.functionality_features,
            scores.technical_feasibility,
            scores.innovation_creativity,
            scores.user_experience,
            scores.impact_value,
            scores.presentation_demo_quality,
            scores.team_collaboration,
        ]
        
        average_score = sum(raw_scores) / 8
        total_score = (
            scores.problem_solution_fit * weights["problem_solution_fit"] +
            scores.functionality_features * weights["functionality_features"] +
            scores.technical_feasibility * weights["technical_feasibility"] +
            scores.innovation_creativity * weights["innovation_creativity"] +
            scores.user_experience * weights["user_experience"] +
            scores.impact_value * weights["impact_value"] +
            scores.presentation_demo_quality * weights["presentation_demo_quality"] +
            scores.team_collaboration * weights["team_collaboration"]
        ) / 10.0
        
        evaluation = TeamEvaluation(
            evaluation_id=evaluation_id,
            judge_id=current_judge["id"],
            team_id=evaluation_data["team_id"],
            team_name=evaluation_data["team_name"],
            problem_statement=evaluation_data["problem_statement"],
            category=evaluation_data.get("category", "General"),
            round_id=evaluation_data.get("round_id", 1),
            scores=scores,
            total_score=total_score,
            average_score=round(average_score, 2),
            personalized_feedback=evaluation_data.get("personalized_feedback", ""),
            evaluation_status="submitted",
            evaluated_at=datetime.utcnow(),
            submitted_at=datetime.utcnow()
        )
        
        # ✅ Use the collection getter function
        team_evaluations_collection = get_team_evaluations_collection()
        result = await team_evaluations_collection.insert_one(evaluation.dict())
        
        if result.inserted_id:
            await update_evaluation_summary(evaluation.team_id, evaluation.round_id)
            return {
                "success": True,
                "message": "Evaluation submitted successfully",
                "evaluation_id": evaluation_id,
                "total_score": total_score,
                "average_score": average_score
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to save evaluation")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error submitting evaluation: {str(e)}")

# ... (rest of the routes, update all collection references to use the getter functions)

async def update_evaluation_summary(team_id: str, round_id: int):
    """Update evaluation summary for a team after new evaluation is submitted"""
    try:
        team_evaluations_collection = get_team_evaluations_collection()
        evaluation_summary_collection = get_evaluation_summary_collection()
        
        evaluations = list(await team_evaluations_collection.find({
            "team_id": team_id,
            "round_id": round_id,
            "evaluation_status": "submitted"
        }).to_list(None))
        
        if not evaluations:
            return
        
        # ... (rest of the function remains the same)
        
    except Exception as e:
        print(f"Error updating evaluation summary: {str(e)}")