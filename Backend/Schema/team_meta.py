from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from db.mongo import get_database
import asyncio

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

# === MongoDB Collection ===
# Initialize collection lazily to avoid import-time connection issues

def get_team_meta_collection():
    """Get team_meta collection with lazy initialization"""
    db = get_database()
    if db is None:
        raise RuntimeError("Database not initialized. Call connect_to_mongo() first.")
    return db["team_meta"]

# Remove the immediate collection access that was causing the error