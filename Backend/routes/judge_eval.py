# judge_routes.py
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional
from datetime import datetime
import uuid
from bson import ObjectId

from Schema.evaluation import (
    TeamEvaluation, 
    JudgeEvaluationScore, 
    EvaluationSummary,
    JudgeEvaluationHistory,
    team_evaluations_collection,
    evaluation_summary_collection,
    judge_evaluation_history_collection
)
from Schema.judge import JudgeModel
from auth.auth_middleware import get_current_judge
from db.mongo import db

router = APIRouter(tags=["Judge Evaluation"])
security = HTTPBearer()

# ==================== EVALUATION CRUD OPERATIONS ====================

@router.post("/submit", response_model=dict)
async def submit_evaluation(
    evaluation_data: dict,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Submit a complete evaluation for a team
    """
    try:
        # Get current judge from token
        current_judge = await get_current_judge(credentials.credentials)
        
        # Generate unique evaluation ID
        evaluation_id = str(uuid.uuid4())
        
        # Extract scores from the evaluation data
        scores = JudgeEvaluationScore(
            innovation=float(evaluation_data.get("innovation", 5)),
            problem_relevance=float(evaluation_data.get("problem_relevance", 5)),
            feasibility=float(evaluation_data.get("feasibility", 5)),
            tech_stack_justification=float(evaluation_data.get("tech_stack_justification", 5)),
            clarity_of_solution=float(evaluation_data.get("clarity_of_solution", 5)),
            presentation_quality=float(evaluation_data.get("presentation_quality", 5)),
            team_understanding=float(evaluation_data.get("team_understanding", 5))
        )
        
        # Calculate total and average scores
        total_score = sum([
            scores.innovation,
            scores.problem_relevance,
            scores.feasibility,
            scores.tech_stack_justification,
            scores.clarity_of_solution,
            scores.presentation_quality,
            scores.team_understanding
        ])
        average_score = total_score / 7
        
        # Create evaluation object
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
        
        # Save to database
        result = await team_evaluations_collection.insert_one(evaluation.dict())
        
        if result.inserted_id:
            # Update evaluation summary
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

@router.post("/save-draft", response_model=dict)
async def save_evaluation_draft(
    evaluation_data: dict,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Save evaluation as draft (can be updated later)
    """
    try:
        current_judge = await get_current_judge(credentials.credentials)
        
        # Check if draft already exists
        existing_draft = await team_evaluations_collection.find_one({
            "judge_id": current_judge["id"],
            "team_id": evaluation_data["team_id"],
            "round_id": evaluation_data.get("round_id", 1),
            "evaluation_status": "draft"
        })
        
        if existing_draft:
            # Update existing draft
            evaluation_id = existing_draft["evaluation_id"]
            update_data = {
                "scores": {
                    "innovation": float(evaluation_data.get("innovation", 5)),
                    "problem_relevance": float(evaluation_data.get("problem_relevance", 5)),
                    "feasibility": float(evaluation_data.get("feasibility", 5)),
                    "tech_stack_justification": float(evaluation_data.get("tech_stack_justification", 5)),
                    "clarity_of_solution": float(evaluation_data.get("clarity_of_solution", 5)),
                    "presentation_quality": float(evaluation_data.get("presentation_quality", 5)),
                    "team_understanding": float(evaluation_data.get("team_understanding", 5))
                },
                "personalized_feedback": evaluation_data.get("personalized_feedback", ""),
                "evaluated_at": datetime.utcnow()
            }
            
            # Calculate scores
            scores = evaluation_data["scores"]
            total_score = sum(scores.values())
            average_score = total_score / 7
            
            update_data["total_score"] = total_score
            update_data["average_score"] = round(average_score, 2)
            
            await team_evaluations_collection.update_one(
                {"evaluation_id": evaluation_id},
                {"$set": update_data}
            )
            
            return {
                "success": True,
                "message": "Draft updated successfully",
                "evaluation_id": evaluation_id
            }
        else:
            # Create new draft
            evaluation_id = str(uuid.uuid4())
            
            scores = {
                "innovation": float(evaluation_data.get("innovation", 5)),
                "problem_relevance": float(evaluation_data.get("problem_relevance", 5)),
                "feasibility": float(evaluation_data.get("feasibility", 5)),
                "tech_stack_justification": float(evaluation_data.get("tech_stack_justification", 5)),
                "clarity_of_solution": float(evaluation_data.get("clarity_of_solution", 5)),
                "presentation_quality": float(evaluation_data.get("presentation_quality", 5)),
                "team_understanding": float(evaluation_data.get("team_understanding", 5))
            }
            
            total_score = sum(scores.values())
            average_score = total_score / 7
            
            draft_evaluation = TeamEvaluation(
                evaluation_id=evaluation_id,
                judge_id=current_judge["id"],
                team_id=evaluation_data["team_id"],
                team_name=evaluation_data["team_name"],
                problem_statement=evaluation_data["problem_statement"],
                category=evaluation_data.get("category", "General"),
                round_id=evaluation_data.get("round_id", 1),
                scores=JudgeEvaluationScore(**scores),
                total_score=total_score,
                average_score=round(average_score, 2),
                personalized_feedback=evaluation_data.get("personalized_feedback", ""),
                evaluation_status="draft",
                evaluated_at=datetime.utcnow()
            )
            
            result = await team_evaluations_collection.insert_one(draft_evaluation.dict())
            
            if result.inserted_id:
                return {
                    "success": True,
                    "message": "Draft saved successfully",
                    "evaluation_id": evaluation_id
                }
            else:
                raise HTTPException(status_code=500, detail="Failed to save draft")
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving draft: {str(e)}")

@router.get("/my-evaluations", response_model=List[dict])
async def get_my_evaluations(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get all evaluations submitted by the current judge
    """
    try:
        current_judge = await get_current_judge(credentials.credentials)
        
        evaluations = list(await team_evaluations_collection.find({
            "judge_id": current_judge["id"]
        }).to_list(None))
        
        # Convert ObjectId to string for JSON serialization
        for eval in evaluations:
            eval["_id"] = str(eval["_id"])
            eval["evaluated_at"] = eval["evaluated_at"].isoformat()
            if eval.get("submitted_at"):
                eval["submitted_at"] = eval["submitted_at"].isoformat()
        
        return evaluations
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching evaluations: {str(e)}")

@router.get("/team/{team_id}", response_model=dict)
async def get_team_evaluation(
    team_id: str,
    round_id: int = 1,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get evaluation for a specific team by the current judge
    """
    try:
        current_judge = await get_current_judge(credentials.credentials)
        
        evaluation = await team_evaluations_collection.find_one({
            "judge_id": current_judge["id"],
            "team_id": team_id,
            "round_id": round_id
        })
        
        if evaluation:
            evaluation["_id"] = str(evaluation["_id"])
            evaluation["evaluated_at"] = evaluation["evaluated_at"].isoformat()
            if evaluation.get("submitted_at"):
                evaluation["submitted_at"] = evaluation["submitted_at"].isoformat()
            return evaluation
        else:
            return {"message": "No evaluation found for this team"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching team evaluation: {str(e)}")

@router.get("/summary/{team_id}", response_model=dict)
async def get_team_evaluation_summary(
    team_id: str,
    round_id: int = 1
):
    """
    Get evaluation summary for a team (aggregated scores from all judges)
    """
    try:
        summary = await evaluation_summary_collection.find_one({
            "team_id": team_id,
            "round_id": round_id
        })
        
        if summary:
            summary["_id"] = str(summary["_id"])
            summary["last_updated"] = summary["last_updated"].isoformat()
            return summary
        else:
            return {"message": "No evaluation summary found for this team"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching evaluation summary: {str(e)}")

# ==================== HELPER FUNCTIONS ====================

async def update_evaluation_summary(team_id: str, round_id: int):
    """
    Update evaluation summary for a team after new evaluation is submitted
    """
    try:
        # Get all evaluations for this team and round
        evaluations = list(await team_evaluations_collection.find({
            "team_id": team_id,
            "round_id": round_id,
            "evaluation_status": "submitted"
        }).to_list(None))
        
        if not evaluations:
            return
        
        # Calculate averages
        total_evaluations = len(evaluations)
        avg_total_score = sum(eval["total_score"] for eval in evaluations) / total_evaluations
        avg_innovation = sum(eval["scores"]["innovation"] for eval in evaluations) / total_evaluations
        avg_problem_relevance = sum(eval["scores"]["problem_relevance"] for eval in evaluations) / total_evaluations
        avg_feasibility = sum(eval["scores"]["feasibility"] for eval in evaluations) / total_evaluations
        avg_tech_stack = sum(eval["scores"]["tech_stack_justification"] for eval in evaluations) / total_evaluations
        avg_clarity = sum(eval["scores"]["clarity_of_solution"] for eval in evaluations) / total_evaluations
        avg_presentation = sum(eval["scores"]["presentation_quality"] for eval in evaluations) / total_evaluations
        avg_team_understanding = sum(eval["scores"]["team_understanding"] for eval in evaluations) / total_evaluations
        
        # Get team name from first evaluation
        team_name = evaluations[0]["team_name"]
        
        summary_data = {
            "team_id": team_id,
            "team_name": team_name,
            "round_id": round_id,
            "total_evaluations": total_evaluations,
            "average_total_score": round(avg_total_score, 2),
            "average_innovation": round(avg_innovation, 2),
            "average_problem_relevance": round(avg_problem_relevance, 2),
            "average_feasibility": round(avg_feasibility, 2),
            "average_tech_stack": round(avg_tech_stack, 2),
            "average_clarity": round(avg_clarity, 2),
            "average_presentation": round(avg_presentation, 2),
            "average_team_understanding": round(avg_team_understanding, 2),
            "last_updated": datetime.utcnow()
        }
        
        # Upsert summary
        await evaluation_summary_collection.update_one(
            {"team_id": team_id, "round_id": round_id},
            {"$set": summary_data},
            upsert=True
        )
        
    except Exception as e:
        print(f"Error updating evaluation summary: {str(e)}")

# ==================== ADMIN ENDPOINTS ====================

@router.get("/admin/all-evaluations", response_model=List[dict])
async def get_all_evaluations(
    team_id: Optional[str] = None,
    round_id: Optional[int] = None,
    judge_id: Optional[str] = None
):
    """
    Admin endpoint to get all evaluations with optional filters
    """
    try:
        filter_query = {}
        if team_id:
            filter_query["team_id"] = team_id
        if round_id:
            filter_query["round_id"] = round_id
        if judge_id:
            filter_query["judge_id"] = judge_id
            
        evaluations = list(await team_evaluations_collection.find(filter_query).to_list(None))
        
        # Convert ObjectId to string
        for eval in evaluations:
            eval["_id"] = str(eval["_id"])
            eval["evaluated_at"] = eval["evaluated_at"].isoformat()
            if eval.get("submitted_at"):
                eval["submitted_at"] = eval["submitted_at"].isoformat()
        
        return evaluations
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching all evaluations: {str(e)}")

@router.get("/admin/leaderboard", response_model=List[dict])
async def get_evaluation_leaderboard(round_id: int = 1):
    """
    Get leaderboard based on evaluation scores
    """
    try:
        pipeline = [
            {"$match": {"round_id": round_id, "evaluation_status": "submitted"}},
            {"$group": {
                "_id": "$team_id",
                "team_name": {"$first": "$team_name"},
                "total_score": {"$avg": "$total_score"},
                "average_score": {"$avg": "$average_score"},
                "evaluation_count": {"$sum": 1}
            }},
            {"$sort": {"total_score": -1}},
            {"$project": {
                "team_id": "$_id",
                "team_name": 1,
                "total_score": {"$round": ["$total_score", 2]},
                "average_score": {"$round": ["$average_score", 2]},
                "evaluation_count": 1
            }}
        ]
        
        leaderboard = list(await evaluation_summary_collection.aggregate(pipeline).to_list(None))
        
        # Add rank
        for i, entry in enumerate(leaderboard):
            entry["rank"] = i + 1
            
        return leaderboard
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching leaderboard: {str(e)}")
