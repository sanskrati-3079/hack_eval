# routes/rounds.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

from db.mongo import get_database

router = APIRouter(prefix="/rounds", tags=["Rounds"])

# Pydantic models
class RoundBase(BaseModel):
    name: str
    description: str
    start_time: datetime
    end_time: datetime
    upload_deadline: datetime
    status: str  # draft, live, completed

class RoundCreate(RoundBase):
    pass

class RoundUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    upload_deadline: Optional[datetime] = None
    status: Optional[str] = None

class RoundResponse(RoundBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        json_encoders = {ObjectId: str}

# Utility functions
async def get_round_by_id(db, round_id: str):
    try:
        round_obj = await db.rounds.find_one({"_id": ObjectId(round_id)})
        if round_obj:
            round_obj["id"] = str(round_obj["_id"])
            return round_obj
        return None
    except:
        return None

async def validate_round_data(db, round_data, exclude_id=None):
    # Check if status is valid
    if round_data.status and round_data.status not in ["draft", "live", "completed"]:
        raise HTTPException(status_code=400, detail="Status must be 'draft', 'live', or 'completed'")
    
    # Check if end time is after start time
    if round_data.start_time and round_data.end_time:
        if round_data.end_time <= round_data.start_time:
            raise HTTPException(status_code=400, detail="End time must be after start time")
    
    # Check if upload deadline is between start and end times
    if (round_data.start_time and round_data.end_time and round_data.upload_deadline):
        if not (round_data.start_time <= round_data.upload_deadline <= round_data.end_time):
            raise HTTPException(status_code=400, detail="Upload deadline must be between start and end times")
    
    return True

# Routes
@router.get("/", response_model=List[RoundResponse])
async def get_all_rounds():
    db = await get_database()
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Database connection not available. Please check MongoDB connection."
        )
    
    try:
        rounds = []
        async for round_obj in db.rounds.find().sort("start_time", 1):
            round_obj["id"] = str(round_obj["_id"])
            rounds.append(round_obj)
        return rounds
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error accessing database: {str(e)}"
        )

@router.get("/{round_id}", response_model=RoundResponse)
async def get_round(round_id: str):
    db = await get_database()
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Database connection not available. Please check MongoDB connection."
        )
    
    round_obj = await get_round_by_id(db, round_id)
    if not round_obj:
        raise HTTPException(status_code=404, detail="Round not found")
    
    return round_obj

@router.post("/", response_model=RoundResponse,methods=['POST'])
async def create_round(round_data: RoundCreate):
    db = await get_database()
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Database connection not available. Please check MongoDB connection."
        )
    
    # Validate round data
    await validate_round_data(db, round_data)
    
    try:
        now = datetime.utcnow()
        round_dict = round_data.dict()
        round_dict["created_at"] = now
        round_dict["updated_at"] = now
        
        result = await db.rounds.insert_one(round_dict)
        
        # Get the created round
        created_round = await get_round_by_id(db, str(result.inserted_id))
        return created_round
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error creating round: {str(e)}"
        )

@router.put("/{round_id}", response_model=RoundResponse)
async def update_round(round_id: str, round_data: RoundUpdate):
    db = await get_database()
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Database connection not available. Please check MongoDB connection."
        )
    
    # Check if round exists
    existing_round = await get_round_by_id(db, round_id)
    if not existing_round:
        raise HTTPException(status_code=404, detail="Round not found")
    
    # Validate round data
    await validate_round_data(db, round_data, exclude_id=round_id)
    
    try:
        update_data = {k: v for k, v in round_data.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        await db.rounds.update_one(
            {"_id": ObjectId(round_id)},
            {"$set": update_data}
        )
        
        # Get the updated round
        updated_round = await get_round_by_id(db, round_id)
        return updated_round
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error updating round: {str(e)}"
        )

@router.delete("/{round_id}")
async def delete_round(round_id: str):
    db = await get_database()
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Database connection not available. Please check MongoDB connection."
        )
    
    # Check if round exists
    existing_round = await get_round_by_id(db, round_id)
    if not existing_round:
        raise HTTPException(status_code=404, detail="Round not found")
    
    try:
        await db.rounds.delete_one({"_id": ObjectId(round_id)})
        return {"message": "Round deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting round: {str(e)}"
        )

@router.get("/status/{status}", response_model=List[RoundResponse])
async def get_rounds_by_status(status: str):
    if status not in ["draft", "live", "completed"]:
        raise HTTPException(status_code=400, detail="Status must be 'draft', 'live', or 'completed'")
    
    db = await get_database()
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Database connection not available. Please check MongoDB connection."
        )
    
    try:
        rounds = []
        async for round_obj in db.rounds.find({"status": status}).sort("start_time", 1):
            round_obj["id"] = str(round_obj["_id"])
            rounds.append(round_obj)
        return rounds
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error accessing database: {str(e)}"
        )