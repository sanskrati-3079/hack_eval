# Schema/judge.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class JudgeProfile(BaseModel):
    judge_id: str
    name: str
    email: str
    expertise: List[str]
    assigned_rounds: List[int]

class JudgeEvaluation(BaseModel):
    team_id: str
    round_id: int
    innovation: int
    feasibility: int
    uiux: int
    scalability: int
    total_score: float
    recommendation: str
    feedback: Optional[str]

class JudgeFeedback(BaseModel):
    team_id: str
    round_id: int
    feedback: str
    judge_id: str
    timestamp: datetime
