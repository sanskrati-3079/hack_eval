from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from db.mongo import db  # ✅ MongoDB instance

# ------------------ ✅ Pydantic Schemas ------------------

class EvaluationCriteria(BaseModel):
    criteria_id: str
    name: str
    weight: float
    description: Optional[str]

class TeamEvaluation(BaseModel):
    evaluation_id: str
    judge_id: str
    team_id: str
    round_id: int
    scores: List[Dict[str, float]]  # Example: [{"criteria_id": "innovation", "score": 8.5}]
    feedback: Optional[str]
    evaluated_at: datetime

class EvaluationSummary(BaseModel):
    team_id: str
    round_id: int
    average_score: float
    evaluations_count: int

# ------------------ 🔌 MongoDB Collections ------------------

db.create_collection("evaluation_criteria")
db.create_collection("team_evaluations")
db.create_collection("evaluation_summary")

