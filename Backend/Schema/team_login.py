from pydantic import BaseModel, Field, EmailStr
from bson import ObjectId
from db.mongo import db


# === Pydantic Schema ===
class TeamLogin(BaseModel):
    team_id: str = Field(..., description="Unique identifier for the team")
    email: EmailStr = Field(..., description="Team's email address")
    password_hash: str = Field(..., description="Hashed password for authentication")


# === MongoDB Collection ===
team_login_collection = db["team_login"]
