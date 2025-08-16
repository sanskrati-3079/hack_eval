from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr
from datetime import datetime
import bcrypt
from auth.jwt_handler import create_access_token, verify_access_token
from core.config import MONGO_URI, MONGO_DB
from typing import Optional

router = APIRouter()

# Initialize database variables
client = None
db = None
logins_collection = None
admin_collection = None

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@router.on_event("startup")
async def startup_db_client():
    global client, db, logins_collection, admin_collection
    try:
        # Connect with increased timeout and retry settings
        client = AsyncIOMotorClient(
            MONGO_URI,
            serverSelectionTimeoutMS=30000,
            connectTimeoutMS=30000,
            retryWrites=True,
            maxPoolSize=50
        )
        # Test the connection
        await client.admin.command('ping')
        print("Successfully connected to MongoDB Atlas!")
        
        # Initialize database and collections
        db = client[MONGO_DB]
        logins_collection = db["team_login"]
        admin_collection = db["admin_users"]
        
        # Create indexes for better performance
        await admin_collection.create_index("email", unique=True)
        await logins_collection.create_index("email", unique=True)
        
    except Exception as e:
        print(f"Failed to connect to MongoDB: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Database connection failed. Please try again later."
        )

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AdminCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "admin"

async def get_current_admin(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = verify_access_token(token)
        email: str = payload.get("email")
        if email is None:
            raise credentials_exception
        if not payload.get("is_admin", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not an admin user"
            )
    except:
        raise credentials_exception
        
    admin = await admin_collection.find_one({"email": email})
    if admin is None:
        raise credentials_exception
    return admin

@router.post("/admin/create")
async def create_admin(admin: AdminCreate):
    try:
        print(f"Creating admin user with email: {admin.email}")
        
        # Check if admin already exists
        existing_admin = await admin_collection.find_one({"email": admin.email})
        if existing_admin:
            raise HTTPException(
                status_code=400,
                detail="Admin with this email already exists"
            )
        
        # Hash password
        hashed_password = bcrypt.hashpw(admin.password.encode(), bcrypt.gensalt())
        
        # Create admin user
        admin_dict = admin.dict()
        admin_dict["password"] = hashed_password
        admin_dict["created_at"] = datetime.utcnow()
        
        result = await admin_collection.insert_one(admin_dict)
        print(f"Admin user created with ID: {result.inserted_id}")
        
        return {"message": "Admin created successfully", "admin_id": str(result.inserted_id)}
        
    except Exception as e:
        print(f"Error creating admin: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error creating admin: {str(e)}"
        )

@router.post("/admin/login")
async def admin_login(payload: LoginRequest):
    admin = await admin_collection.find_one({"email": payload.email})
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    stored_password = admin["password"]
    try:
        if not bcrypt.checkpw(payload.password.encode(), stored_password):
            raise HTTPException(status_code=401, detail="Invalid credentials")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Password verification error")

    token = create_access_token({
        "email": admin["email"],
        "is_admin": True,
        "name": admin["name"]
    })
    return {"access_token": token, "token_type": "bearer"}

@router.post("/team_login/")
async def team_login(payload: LoginRequest):
    user = await logins_collection.find_one({"email": payload.email})
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

    token = create_access_token({
        "team_id": user["team_id"], 
        "email": user["email"],
        "is_admin": False
    })
    return {"access_token": token, "token_type": "bearer"}
