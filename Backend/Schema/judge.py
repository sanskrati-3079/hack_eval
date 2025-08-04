from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class Judge(BaseModel):
    judge_id: str
    name: str
    email: EmailStr
    password_hash: str
    assigned_rounds: Optional[List[int]] = []
    role: str = "judge"
    created_at: datetime
