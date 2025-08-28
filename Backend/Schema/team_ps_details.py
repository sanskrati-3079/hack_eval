from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class TeamMember(BaseModel):
    name: str = Field(..., description="Name of the team member")
    roll_no: str = Field(..., description="University roll number")
    email: str = Field(..., description="Email address")
    contact: str = Field(..., description="Contact number")
    role: str = Field(..., description="Role in the team")

class ProblemStatement(BaseModel):
    ps_id: str = Field(..., description="Problem statement ID")
    title: str = Field(..., description="Problem statement title")
    description: str = Field(..., description="Problem statement description")
    category: str = Field(..., description="Problem category")
    difficulty: str = Field(..., description="Difficulty level")
    domain: str = Field(..., description="Domain/field")

class TeamPSDetails(BaseModel):
    team_id: str = Field(..., description="Unique team identifier")
    team_name: str = Field(..., description="Name of the team")
    college: str = Field(..., description="College/University name")
    department: str = Field(..., description="Department/Branch")
    year: str = Field(..., description="Academic year")
    team_leader: TeamMember = Field(..., description="Team leader details")
    team_members: List[TeamMember] = Field(..., description="List of team members")
    problem_statement: ProblemStatement = Field(..., description="Assigned problem statement")
    mentor: Optional[str] = Field(None, description="Assigned mentor name")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Record creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")
    status: str = Field(default="active", description="Team status")

class ExcelUploadResponse(BaseModel):
    message: str
    teams_processed: int
    teams_saved: int
    errors: List[str]
