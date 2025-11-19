from pydantic import BaseModel, EmailStr
from typing import List, Dict, Optional
from datetime import datetime
from db.mongo import db  # ✅ Import your DB from mongo.py

# ------------------ ✅ Pydantic Schemas ------------------

class Round(BaseModel):
    round_id: int
    name: str
    start_time: datetime
    end_time: datetime
    description: str
    category: str
    status: str = "scheduled"
    judges_required: int

    

class MentorAvailability(BaseModel):
    mentor_id: str
    name: str
    email: EmailStr
    expertise: List[str]
    available_slots: List[Dict[str, datetime]]
    status: str = "available"

class AdminSettings(BaseModel):
    leaderboard_public: bool = False
    current_round: int = 0
    registration_open: bool = True
    mentor_matching_enabled: bool = True
    last_updated: datetime

class TeamScore(BaseModel):
    team_id: str
    team_name: str
    round_scores: Dict[int, float]
    total_score: float
    rank: Optional[int]
    category: str

class LeaderboardSettings(BaseModel):
    is_public: bool = False
    show_scores: bool = True
    show_feedback: bool = False
    category_filters: List[str] = []
    last_published: Optional[datetime]

# ------------------ 🔌 MongoDB Collections ------------------

rounds_collection = db["rounds"]
mentors_collection = db["mentors"]
admin_collection = db["admin_settings"]
scores_collection = db["team_scores"]
leaderboard_collection = db["leaderboard_settings"]

