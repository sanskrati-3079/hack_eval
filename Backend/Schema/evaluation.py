from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime
from db.mongo import db  # ✅ MongoDB instance

# ------------------ ✅ Pydantic Schemas ------------------

class EvaluationCriteria(BaseModel):
    criteria_id: str
    name: str
    weight: float
    description: Optional[str]

class JudgeEvaluationScore(BaseModel):
    innovation: float = Field(..., ge=1, le=10, description="Innovation score (1-10)")
    problem_relevance: float = Field(..., ge=1, le=10, description="Problem relevance score (1-10)")
    feasibility: float = Field(..., ge=1, le=10, description="Feasibility score (1-10)")
    tech_stack_justification: float = Field(..., ge=1, le=10, description="Tech stack justification score (1-10)")
    clarity_of_solution: float = Field(..., ge=1, le=10, description="Clarity of solution score (1-10)")
    presentation_quality: float = Field(..., ge=1, le=10, description="Presentation quality score (1-10)")
    team_understanding: float = Field(..., ge=1, le=10, description="Team understanding score (1-10)")

class TeamEvaluation(BaseModel):
    evaluation_id: str = Field(..., description="Unique evaluation identifier")
    judge_id: str = Field(..., description="ID of the judge who performed evaluation")
    team_id: str = Field(..., description="ID of the team being evaluated")
    team_name: str = Field(..., description="Name of the team")
    problem_statement: str = Field(..., description="Problem statement being addressed")
    category: str = Field(..., description="Project category")
    round_id: int = Field(..., description="Evaluation round number")
    scores: JudgeEvaluationScore = Field(..., description="Detailed scores for each criteria")
    total_score: float = Field(..., description="Calculated total score")
    average_score: float = Field(..., description="Average score across all criteria")
    personalized_feedback: str = Field(..., description="Detailed feedback from judge")
    evaluation_status: str = Field(default="draft", description="draft, submitted, finalized")
    evaluated_at: datetime = Field(default_factory=datetime.utcnow, description="When evaluation was performed")
    submitted_at: Optional[datetime] = Field(None, description="When evaluation was submitted")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class EvaluationSummary(BaseModel):
    team_id: str
    team_name: str
    round_id: int
    total_evaluations: int
    average_total_score: float
    average_innovation: float
    average_problem_relevance: float
    average_feasibility: float
    average_tech_stack: float
    average_clarity: float
    average_presentation: float
    average_team_understanding: float
    last_updated: datetime

class JudgeEvaluationHistory(BaseModel):
    judge_id: str
    judge_name: str
    total_evaluations: int
    average_scores_given: float
    evaluations: List[TeamEvaluation]

# ------------------ 🔌 MongoDB Collections ------------------

# Create collections if they don't exist
evaluation_criteria_collection = db["evaluation_criteria"]
team_evaluations_collection = db["team_evaluations"]
evaluation_summary_collection = db["evaluation_summary"]
judge_evaluation_history_collection = db["judge_evaluation_history"]

# Initialize default evaluation criteria
default_criteria = [
    {
        "criteria_id": "innovation",
        "name": "Innovation",
        "weight": 1.0,
        "description": "Originality and creativity of the solution"
    },
    {
        "criteria_id": "problem_relevance",
        "name": "Problem Relevance", 
        "weight": 1.0,
        "description": "How well the solution addresses the problem"
    },
    {
        "criteria_id": "feasibility",
        "name": "Feasibility",
        "weight": 1.0,
        "description": "Practical implementation potential"
    },
    {
        "criteria_id": "tech_stack_justification",
        "name": "Tech Stack Justification",
        "weight": 1.0,
        "description": "Appropriateness of chosen technologies"
    },
    {
        "criteria_id": "clarity_of_solution",
        "name": "Clarity of Solution",
        "weight": 1.0,
        "description": "How well the solution is explained"
    },
    {
        "criteria_id": "presentation_quality",
        "name": "Presentation Quality",
        "weight": 1.0,
        "description": "Professionalism and clarity of presentation"
    },
    {
        "criteria_id": "team_understanding",
        "name": "Team Understanding",
        "weight": 1.0,
        "description": "Depth of team knowledge and expertise"
    }
]

# Insert default criteria if collection is empty
if evaluation_criteria_collection.count_documents({}) == 0:
    evaluation_criteria_collection.insert_many(default_criteria)

