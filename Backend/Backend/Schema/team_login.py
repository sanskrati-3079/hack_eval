from pydantic import BaseModel, EmailStr

class TeamLogin(BaseModel):
    team_id: str
    email: EmailStr
    password_hash: str
