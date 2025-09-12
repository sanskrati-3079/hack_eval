# schema/admin_extended.py

from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

# Dashboard and Statistics
class AdminDashboardStats(BaseModel):
    total_teams: int
    total_judges: int
    total_mentors: int
    active_round: Optional[int]
    rounds_status: Dict[str, str]
    pending_evaluations: int
    mentor_utilization: float

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

# Mentor Management - Enhanced
class MentorStatus(str, Enum):
    ACTIVE = "active"
    BUSY = "busy"
    INACTIVE = "inactive"

class MentorAvailability(str, Enum):
    AVAILABLE = "available"
    UNAVAILABLE = "unavailable"
    BUSY = "busy"

class MentorExpertise(str, Enum):
    AI_ML = "AI/ML"
    DATA_SCIENCE = "Data Science"
    WEB_DEVELOPMENT = "Web Development"
    MOBILE_APP = "Mobile App"
    UI_UX = "UI/UX"
    FULL_STACK = "Full Stack"
    IOT = "IoT"
    HARDWARE = "Hardware"
    CLOUD_COMPUTING = "Cloud Computing"
    CYBERSECURITY = "Cybersecurity"
    BLOCKCHAIN = "Blockchain"
    GAME_DEVELOPMENT = "Game Development"

class MentorBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=20)
    expertise: List[MentorExpertise]
    location: str = Field(..., min_length=2, max_length=100)
    bio: str = Field(..., min_length=10, max_length=500)
    status: MentorStatus = MentorStatus.ACTIVE
    availability: MentorAvailability = MentorAvailability.AVAILABLE

class MentorCreate(MentorBase):
    password: str = Field(..., min_length=6)
    profile_picture: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    website_url: Optional[str] = None

class MentorUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    expertise: Optional[List[MentorExpertise]] = None
    location: Optional[str] = Field(None, min_length=2, max_length=100)
    bio: Optional[str] = Field(None, min_length=10, max_length=500)
    status: Optional[MentorStatus] = None
    availability: Optional[MentorAvailability] = None
    profile_picture: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    website_url: Optional[str] = None

class MentorResponse(MentorBase):
    id: str = Field(alias="_id")
    profile_picture: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    website_url: Optional[str] = None
    rating: float = 0.0
    total_sessions: int = 0
    assigned_teams: List[str] = []
    total_teams: int = 0
    created_at: datetime
    updated_at: datetime
    last_active: Optional[datetime] = None

    class Config:
        allow_population_by_field_name = True

class MentorSession(BaseModel):
    session_id: str
    mentor_id: str
    team_id: str
    session_date: datetime
    duration_minutes: int
    session_type: str = "mentoring"
    notes: Optional[str] = None
    rating: Optional[float] = Field(None, ge=1.0, le=5.0)
    feedback: Optional[str] = None
    created_at: datetime

class MentorTeamAssignment(BaseModel):
    assignment_id: str
    mentor_id: str
    team_id: str
    assigned_date: datetime
    status: str = "active"
    expertise_areas: List[MentorExpertise]
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class MentorAvailabilitySchedule(BaseModel):
    mentor_id: str
    day_of_week: int = Field(..., ge=0, le=6)
    start_time: str = Field(..., pattern=r"^([01]?[0-9]|2[0-3]):[0-5][0-9]$")
    end_time: str = Field(..., pattern=r"^([01]?[0-9]|2[0-3]):[0-5][0-9]$")
    is_available: bool = True
    notes: Optional[str] = None

class MentorStats(BaseModel):
    mentor_id: str
    total_sessions: int = 0
    total_teams_mentored: int = 0
    average_rating: float = 0.0
    total_rating_count: int = 0
    expertise_utilization: Dict[str, int] = {}
    monthly_sessions: Dict[str, int] = {}
    last_active: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

class MentorSearchFilters(BaseModel):
    expertise: Optional[List[MentorExpertise]] = None
    status: Optional[MentorStatus] = None
    availability: Optional[MentorAvailability] = None
    location: Optional[str] = None
    rating_min: Optional[float] = Field(None, ge=0.0, le=5.0)
    rating_max: Optional[float] = Field(None, ge=0.0, le=5.0)
    search_term: Optional[str] = None
    limit: int = 20
    offset: int = 0

class MentorDashboardStats(BaseModel):
    total_mentors: int
    available_mentors: int
    busy_mentors: int
    inactive_mentors: int
    total_sessions: int
    total_teams_assigned: int
    average_rating: float
    top_expertise_areas: List[Dict[str, Any]]
    recent_mentors: List[MentorResponse]

# Mentor Management API Models
class MentorBulkCreate(BaseModel):
    mentors: List[MentorCreate]

class MentorBulkUpdate(BaseModel):
    mentor_ids: List[str]
    updates: MentorUpdate

class MentorBulkDelete(BaseModel):
    mentor_ids: List[str]

class MentorAssignmentRequest(BaseModel):
    mentor_id: str
    team_id: str
    expertise_areas: List[MentorExpertise]
    notes: Optional[str] = None

class MentorSessionCreate(BaseModel):
    mentor_id: str
    team_id: str
    session_date: datetime
    duration_minutes: int
    session_type: str = "mentoring"
    notes: Optional[str] = None

class MentorSessionUpdate(BaseModel):
    session_id: str
    notes: Optional[str] = None
    rating: Optional[float] = Field(None, ge=1.0, le=5.0)
    feedback: Optional[str] = None

# Mentor Analytics and Reporting
class MentorAnalytics(BaseModel):
    mentor_id: str
    period: str  # daily, weekly, monthly, yearly
    start_date: datetime
    end_date: datetime
    sessions_count: int
    total_duration: int  # in minutes
    average_rating: float
    teams_mentored: int
    expertise_breakdown: Dict[str, int]

class MentorReport(BaseModel):
    report_id: str
    report_type: str  # performance, utilization, feedback
    mentor_ids: List[str]
    period: str
    start_date: datetime
    end_date: datetime
    generated_at: datetime
    generated_by: str
    data: Dict[str, Any]
