from pydantic import BaseModel, EmailStr
from typing import List

class TeamLeader(BaseModel):
    name: str
    email: EmailStr
    contact: str

class TeamMeta(BaseModel):
    team_id: str
    problem_statement_id: str
    team_name: str
    team_leader: TeamLeader
    members: List[str]
    ppt_drive_link: str
    category: str
    subcategory: str
