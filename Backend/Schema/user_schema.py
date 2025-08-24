# Schema/user_schema.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TeamInfo(BaseModel):
    team_id: str
    team_name: str
    problem_statement: str
    category: str
    members: List[str]

class Submission(BaseModel):
    team_id: str
    round_id: int
    submission_link: str
    status: str
    submitted_at: Optional[datetime]

class LeaderboardEntry(BaseModel):
    team_id: str
    team_name: str
    category: str
    total_score: float
    rank: Optional[int]

class Notification(BaseModel):
    team_id: str
    message: str
    type: str
    timestamp: datetime
