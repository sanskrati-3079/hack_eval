from fastapi import APIRouter, HTTPException
from pymongo import MongoClient
from pydantic import BaseModel, EmailStr
import bcrypt
from auth.jwt_handler import create_access_token
from core.config import MONGO_URI, MONGO_DB

router = APIRouter()

client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
logins_collection = db["team_login"]

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/team_login/")
def team_login(payload: LoginRequest):
    user = logins_collection.find_one({"email": payload.email})
    if not user:
        raise HTTPException(status_code=404, detail="Team not registered")

    stored_password = user["password"]
    try:
        stored_password_bytes = stored_password.encode("utf-8") if isinstance(stored_password, str) else stored_password

        if not bcrypt.checkpw(payload.password.encode(), stored_password_bytes):
            raise HTTPException(status_code=401, detail="Invalid credentials")

    except Exception as e:
        print("Password verification error:", e)
        raise HTTPException(status_code=500, detail="Password verification error")

    token = create_access_token({"team_id": user["team_id"], "email": user["email"]})
    return {"access_token": token, "token_type": "bearer"}
