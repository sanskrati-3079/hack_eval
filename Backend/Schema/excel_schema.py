from pydantic import BaseModel, Field
from typing import List, Optional

class PPTScoreEntry(BaseModel):
    rank: int
    team_name: str
    weighted_total: float
    innovation_uniqueness: float
    technical_feasibility: float
    potential_impact: float
    file_name: Optional[str] = None

class PPTScoreUpload(BaseModel):
    entries: List[PPTScoreEntry]
