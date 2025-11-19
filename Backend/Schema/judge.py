from pydantic import BaseModel, EmailStr
from typing import List, Dict, Optional
from datetime import datetime

class JudgeProfile(BaseModel):
    id: str
    username: str
    email: EmailStr
    expertise: List[str]
    bio: Optional[str] = None
    assigned_teams: List[str] = []
    rounds: List[int] = []

class JudgeModel(BaseModel):
    id: str
    username: str
    email: EmailStr
    password: str
    expertise: List[str]
    bio: Optional[str] = None
    assigned_teams: List[str] = []
    rounds: List[int] = []
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

class JudgeEvaluation(BaseModel):
    round: int
    scores: Dict[str, float]  # Criteria to score mapping
    feedback: Optional[str] = None

class JudgeLogin(BaseModel):
    email: EmailStr
    password: str

class JudgeResponse(BaseModel):
    id: str
    username: str
    email: EmailStr
    expertise: List[str]
    assigned_teams: List[str]
    rounds: List[int]

class JudgeAssignment(BaseModel):
    judge_id: str
    round_id: int
    assigned_teams: List[str]  # team IDs
    status: str = "active"  # active, completed, withdrawn

class JudgeFeedback(BaseModel):
    feedback_id: str
    judge_id: str
    team_id: str
    round_id: int
    comments: str
    rating: Optional[float]
    submitted_at: datetime = datetime.utcnow()
