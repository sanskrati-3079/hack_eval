from pydantic import BaseModel
from typing import Dict
from datetime import datetime

class Evaluation(BaseModel):
    team_id: str
    judge_id: str
    scores: Dict[str, int]
    feedback: str
    submitted_at: datetime
