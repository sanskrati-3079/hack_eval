from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from bson import ObjectId
from db.mongo import db
from core.config import JWT_SECRET, JWT_ALGORITHM

# JWT Configuration
SECRET_KEY = JWT_SECRET
ALGORITHM = JWT_ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/judge/login")

async def get_current_judge(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        judge_id: str = payload.get("sub")
        if judge_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    judge = await db.judges.find_one({"_id": ObjectId(judge_id)})
    if judge is None:
        raise credentials_exception
        
    return {"id": str(judge["_id"])}
