from pydantic import BaseModel
from datetime import datetime

class PPTAnalysis(BaseModel):
    team_id: str
    analysis: dict
    remarks: str
    generated_at: datetime
