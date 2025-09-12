from pydantic import BaseModel, EmailStr, Field
from typing import List
from db.mongo import db

# === Pydantic Schemas ===

class TeamLeader(BaseModel):
    name: str = Field(..., description="Name of the team leader")
    roll_no: str = Field(..., description="University roll number of the team leader")
    email: EmailStr = Field(..., description="Email of the team leader")
    contact: str = Field(..., description="Contact number of the team leader")

class TeamMeta(BaseModel):
    team_id: str = Field(..., description="Unique team identifier")
    problem_statement_id: str = Field(..., description="Assigned problem statement ID")

    team_name: str = Field(..., description="Name of the team")
    team_leader: TeamLeader = Field(..., description="Details of the team leader")
    members: List[str] = Field(..., description="List of team member names or IDs")
    category: str = Field(..., description="Project category")
    statement: str = Field(..., description="Problem statement text")
    university_roll_no: str = Field(..., description="University roll number")

# === MongoDB Collection accessor ===
def team_meta_collection():
    return get_collection("team_meta")
