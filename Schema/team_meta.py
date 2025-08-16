from pydantic import BaseModel, EmailStr, Field
from typing import List
from db.mongo import db


# === Pydantic Schemas ===

class TeamLeader(BaseModel):
    name: str = Field(..., description="Name of the team leader")
    email: EmailStr = Field(..., description="Email of the team leader")
    contact: str = Field(..., description="Contact number of the team leader")

class TeamMeta(BaseModel):
    team_id: str = Field(..., description="Unique team identifier")
    problem_statement_id: str = Field(..., description="Assigned problem statement ID")
    team_name: str = Field(..., description="Name of the team")
    team_leader: TeamLeader = Field(..., description="Details of the team leader")
    members: List[str] = Field(..., description="List of team member names or IDs")
    ppt_drive_link: str = Field(..., description="Google Drive link to the team PPT")
    category: str = Field(..., description="Project category")
    subcategory: str = Field(..., description="Project subcategory")


# === MongoDB Collection ===
team_meta_collection = db["team_meta"]
