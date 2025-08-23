from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr
from datetime import datetime
from bson import ObjectId
import bcrypt
from auth.jwt_handler import create_access_token, verify_access_token
from core.config import MONGO_URI, MONGO_DB, JWT_SECRET, JWT_ALGORITHM
from typing import Optional
from Schema.judge import JudgeLogin, JudgeModel, JudgeResponse
from utils.hash_password import verify_password, get_password_hash
from jose import JWTError, jwt

router = APIRouter()

# Initialize database variables
client = None
db = None
logins_collection = None
admin_collection = None
judges_collection = None

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def check_db_connection():
    """Check if database connection is available"""
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Database is not available. Please check MongoDB connection."
        )

@router.get("/health")
async def health_check():
    """Check database connection health"""
    try:
        if client and db:
            await client.admin.command('ping')
            return {"status": "healthy", "database": "connected"}
        else:
            return {"status": "degraded", "database": "disconnected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "error", "message": str(e)}

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
        print("Successfully connected to MongoDB!")
        
        # Initialize database and collections
        db = client[MONGO_DB]
        logins_collection = db["team_login"]
        admin_collection = db["admin_users"]
        
        # Create indexes for better performance
        await admin_collection.create_index("email", unique=True)
        await logins_collection.create_index("email", unique=True)
        
    except Exception as e:
        print(f"Warning: Failed to connect to MongoDB: {str(e)}")
        print("Application will start but database operations will fail until MongoDB is available.")
        # Don't raise exception - let the app start
        client = None
        db = None
        logins_collection = None
        admin_collection = None
            
@router.post("/judge/login")
async def judge_login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Authenticate judge and return JWT token"""
    try:
        check_db_connection()
        judge = await db.judges.find_one({"email": form_data.username})
        if not judge:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
            
        if not verify_password(form_data.password, judge["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
            
        # Create access token
        token_data = {
            "sub": str(judge["_id"]),
            "type": "judge",
            "email": judge["email"]
        }
        access_token = create_access_token(token_data)
        
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/judge/register", response_model=JudgeResponse)
async def register_judge(judge: JudgeModel):
    """Register a new judge"""
    try:
        check_db_connection()
        # Check if judge already exists
        if await db.judges.find_one({"email": judge.email}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
            
        # Hash password
        hashed_password = get_password_hash(judge.password)
        
        # Prepare judge document
        judge_dict = judge.dict()
        judge_dict["password"] = hashed_password
        judge_dict["_id"] = ObjectId()  # Generate new ObjectId
        
        # Insert into database
        await db.judges.insert_one(judge_dict)
        
        # Convert _id to string for response
        judge_dict["id"] = str(judge_dict.pop("_id"))
        del judge_dict["password"]  # Remove password from response
        
        return judge_dict
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
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
        check_db_connection()
        print(f"Creating admin user with email: {admin.email}")
        
        # Check if admin already exists
        existing_admin = await admin_collection.find_one({"email": admin.email})
        if existing_admin:
            raise HTTPException(
                status_code=400,
                detail="Admin with this email already exists"
            )
        
        # Store password as plain text for now (we'll hash during comparison)
        admin_dict = admin.dict()
        admin_dict["password"] = admin.password
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
    print(f"Admin login attempt for email: {payload.email}")
    admin = await admin_collection.find_one({"email": payload.email})
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    stored_password = admin["password"]
    print(f"Stored password: {stored_password}")
    
    try:
        # Simple password comparison since we're storing plain text
        if payload.password != stored_password:
            print("Invalid password for admin login")
            raise HTTPException(status_code=401, detail="Invalid credentials")
    except Exception as e:
        print(f"Password verification error: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid credentials")

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
        if not (payload.password== stored_password_bytes):
            raise HTTPException(status_code=401, detail="Invalid credentials")
    except Exception as e:
        print("Password verification error:", e)
        raise HTTPException(status_code=500, detail="Password verification error")

    token = create_access_token({
        "sub": str(user.get("_id", user.get("team_id"))),
        "type": "user",
        "team_id": user["team_id"], 
        "email": user["email"],
        "is_admin": False
    })
    return {"access_token": token, "token_type": "bearer"}

@router.post("/user/login")
async def user_login(payload: LoginRequest):
    """Alias for team login; returns a JWT for user/team access."""
    return await team_login(payload)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = verify_access_token(token)
        user_id: Optional[str] = payload.get("sub")
        user_type: Optional[str] = payload.get("type")
        team_id: Optional[str] = payload.get("team_id")
        if not user_id and not team_id:
            raise credentials_exception
        return {
            "id": user_id or team_id,
            "type": user_type or ("user" if team_id else None),
            "team_id": team_id,
            "email": payload.get("email")
        }
    except JWTError:
        raise credentials_exception
