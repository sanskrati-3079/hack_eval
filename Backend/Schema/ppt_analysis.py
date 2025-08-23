from pydantic import BaseModel, Field
from datetime import datetime
from typing import Dict
from bson import ObjectId
from db.mongo import db


# === Pydantic Schema ===
class PPTAnalysis(BaseModel):
    team_id: str = Field(..., description="Unique identifier for the team")
    analysis: Dict = Field(..., description="Analysis result as dictionary")
    remarks: str = Field(..., description="Remarks for the presentation")
    generated_at: datetime = Field(default_factory=datetime.utcnow, description="Timestamp of generation")


# === MongoDB Collection ===
ppt_analysis_collection = db["ppt_analysis"]
