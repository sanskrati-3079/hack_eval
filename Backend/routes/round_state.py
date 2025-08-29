from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from db.mongo import db


class ActiveRoundResponse(BaseModel):
    round: Optional[int]
    updated_at: datetime


router = APIRouter(prefix="/round-state", tags=["Round State"])


@router.get("/active", response_model=ActiveRoundResponse)
async def get_active_round():
    doc = await db.round_state.find_one({"_id": "active_round"})
    if not doc:
        # initialize if not present
        now = datetime.utcnow()
        await db.round_state.update_one(
            {"_id": "active_round"},
            {"$setOnInsert": {"round": None, "updated_at": now}},
            upsert=True,
        )
        return {"round": None, "updated_at": now}
    return {"round": doc.get("round"), "updated_at": doc.get("updated_at", datetime.utcnow())}


class SetActiveRoundRequest(BaseModel):
    round: Optional[int]


@router.post("/active", response_model=ActiveRoundResponse)
async def set_active_round(payload: SetActiveRoundRequest):
    # Accept values 1,2,3 or None to clear
    if payload.round is not None and payload.round not in [1, 2, 3]:
        raise HTTPException(status_code=400, detail="round must be 1, 2, 3 or null")

    now = datetime.utcnow()
    await db.round_state.update_one(
        {"_id": "active_round"},
        {"$set": {"round": payload.round, "updated_at": now}},
        upsert=True,
    )
    return {"round": payload.round, "updated_at": now}


