from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict
from datetime import datetime
from bson import ObjectId
from enum import Enum

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

# Base Mentor Model
class MentorBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=20)
    expertise: List[MentorExpertise]
    location: str = Field(..., min_length=2, max_length=100)
    bio: str = Field(..., min_length=10, max_length=500)
    status: MentorStatus = MentorStatus.ACTIVE
    availability: MentorAvailability = MentorAvailability.AVAILABLE

# Create Mentor Model
class MentorCreate(MentorBase):
    password: str = Field(..., min_length=6)
    profile_picture: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    website_url: Optional[str] = None

# Update Mentor Model
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

# Mentor Response Model
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
        schema_extra = {
            "example": {
                "name": "Dr. Sarah Johnson",
                "email": "sarah.johnson@example.com",
                "phone": "+1 (555) 123-4567",
                "expertise": ["AI/ML", "Data Science"],
                "location": "San Francisco, CA",
                "bio": "Senior AI researcher with 10+ years of experience in machine learning and data science.",
                "status": "active",
                "availability": "available",
                "rating": 4.8,
                "total_sessions": 15,
                "assigned_teams": ["Team Alpha", "Team Delta"],
                "total_teams": 2
            }
        }

# Mentor Session Model
class MentorSession(BaseModel):
    session_id: str
    mentor_id: str
    team_id: str
    session_date: datetime
    duration_minutes: int
    session_type: str = "mentoring"  # mentoring, review, consultation
    notes: Optional[str] = None
    rating: Optional[float] = Field(None, ge=1.0, le=5.0)
    feedback: Optional[str] = None
    created_at: datetime

# Mentor Team Assignment Model
class MentorTeamAssignment(BaseModel):
    assignment_id: str
    mentor_id: str
    team_id: str
    assigned_date: datetime
    status: str = "active"  # active, completed, cancelled
    expertise_areas: List[MentorExpertise]
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

# Mentor Availability Schedule Model
class MentorAvailabilitySchedule(BaseModel):
    mentor_id: str
    day_of_week: int = Field(..., ge=0, le=6)  # 0=Monday, 6=Sunday
    start_time: str = Field(..., regex=r"^([01]?[0-9]|2[0-3]):[0-5][0-9]$")  # HH:MM format
    end_time: str = Field(..., regex=r"^([01]?[0-9]|2[0-3]):[0-5][0-9]$")  # HH:MM format
    is_available: bool = True
    notes: Optional[str] = None

# Mentor Statistics Model
class MentorStats(BaseModel):
    mentor_id: str
    total_sessions: int = 0
    total_teams_mentored: int = 0
    average_rating: float = 0.0
    total_rating_count: int = 0
    expertise_utilization: Dict[str, int] = {}  # expertise -> session count
    monthly_sessions: Dict[str, int] = {}  # YYYY-MM -> session count
    last_active: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

# Mentor Search and Filter Model
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

# Mentor Dashboard Stats
class MentorDashboardStats(BaseModel):
    total_mentors: int
    available_mentors: int
    busy_mentors: int
    inactive_mentors: int
    total_sessions: int
    total_teams_assigned: int
    average_rating: float
    top_expertise_areas: List[Dict[str, any]]
    recent_mentors: List[MentorResponse]
