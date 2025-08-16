# schema/admin_extended.py

from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict
from datetime import datetime

# Dashboard and Statistics
class AdminDashboardStats(BaseModel):
    total_teams: int
    total_judges: int
    active_round: Optional[int]
    rounds_status: Dict[str, str]
    pending_evaluations: int

# Round Management
class RoundCreate(BaseModel):
    name: str
    start_time: datetime
    end_time: datetime
    description: str
    judges_required: int
    evaluation_criteria: List[Dict[str, int]]
    category: str

class Round(RoundCreate):
    round_id: int
    status: str = "scheduled"
    created_at: datetime
    created_by: EmailStr

# Judge Management
class JudgeAssignment(BaseModel):
    judge_id: str
    round_id: int
    teams: List[str]
    criteria: List[str]

class JudgeStats(BaseModel):
    judge_id: str
    name: str
    email: EmailStr
    assigned_rounds: List[int]
    evaluations_completed: int
    evaluations_pending: int
    last_active: Optional[datetime]
    status: str

# Team and Scoring
class TeamScore(BaseModel):
    team_id: str
    team_name: str
    round_scores: Dict[int, float]
    total_score: float
    category: str
    rank: Optional[int]

# Admin Settings
class AdminSettings(BaseModel):
    registration_open: bool = True
    current_round: Optional[int] = None
    leaderboard_public: bool = False
    evaluation_locked: bool = False
    mentor_matching_enabled: bool = True
    last_updated: datetime

class LeaderboardSettings(BaseModel):
    is_public: bool = False
    show_scores: bool = True
    show_feedback: bool = False
    category_filters: List[str] = []
    last_published: Optional[datetime]

# Mentor Management
class MentorAvailability(BaseModel):
    mentor_id: str
    name: str
    email: EmailStr
    expertise: List[str]
    available_slots: List[Dict[str, datetime]]
    status: str = "available"
