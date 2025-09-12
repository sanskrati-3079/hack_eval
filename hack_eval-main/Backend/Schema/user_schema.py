from pydantic import BaseModel
from typing import List, Optional, Dict, Any
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
    rank: int
    team_id: Optional[str] = None
    team_name: str
    category: Optional[str] = None
    total_score: float

class PPTReportEntry(BaseModel):
    team_name: str
    weighted_total: float
    innovation_uniqueness: float
    technical_feasibility: float
    potential_impact: float
    file_name: str

class ExcelUploadResponse(BaseModel):
    success: bool
    message: str
    records_uploaded: int
    data: Optional[List[Dict[str, Any]]] = None

class Notification(BaseModel):
    team_id: str
    message: str
    type: str
    timestamp: datetime
