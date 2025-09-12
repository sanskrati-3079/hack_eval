from fastapi import APIRouter, HTTPException
from typing import List

from db.mongo import db
from Schema.mentor import MentorResponse # Using existing detailed schema

router = APIRouter(prefix="/mentors", tags=["Mentors"])

@router.get("", response_model=List[MentorResponse])
async def get_all_mentors():
    """
    Get all active mentors.
    (Replaces GET / from mentors.js)
    """
    mentors_cursor = db.mentors.find({"status": "active"})
    mentors = await mentors_cursor.to_list(None)
    return mentors

@router.get("/{mentor_id}", response_model=MentorResponse)
async def get_mentor_by_id(mentor_id: str):
    """
    Get a single mentor by their ID.
    (Replaces GET /:id from mentors.js)
    """
    from bson import ObjectId
    if not ObjectId.is_valid(mentor_id):
        raise HTTPException(status_code=400, detail="Invalid mentor ID format")

    mentor = await db.mentors.find_one({"_id": ObjectId(mentor_id)})
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    return mentor

@router.get("/expertise/{expertise}", response_model=List[MentorResponse])
async def get_mentors_by_expertise(expertise: str):
    """
    Get available mentors by a specific expertise.
    (Replaces GET /expertise/:expertise from mentors.js)
    """
    # The expertise field is a list, so we query for items in the array
    mentors_cursor = db.mentors.find({
        "expertise": expertise,
        "status": "active"
    })
    mentors = await mentors_cursor.to_list(None)
    return mentors
