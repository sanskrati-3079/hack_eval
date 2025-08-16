from pydantic import BaseModel, EmailStr
from typing import List, Dict, Optional
from datetime import datetime
from db.mongo import db  # ✅ MongoDB instance

# ------------------ ✅ Pydantic Schemas ------------------

class JudgeProfile(BaseModel):
    judge_id: str
    name: str
    email: EmailStr
    expertise: List[str]
    bio: Optional[str]
    registered_at: datetime

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
    submitted_at: datetime

# ------------------ 🔌 MongoDB Collections ------------------

judges_collection = db["judges"]
assignments_collection = db["judge_assignments"]
feedback_collection = db["judge_feedback"]
