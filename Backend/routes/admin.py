# from fastapi import APIRouter, HTTPException, Depends, status, Query
# from motor.motor_asyncio import AsyncIOMotorClient
# from typing import List, Optional, Dict, Any
# from datetime import datetime, timedelta
# from bson import ObjectId
# import logging
# from fastapi.responses import JSONResponse
# from controllers.roundSchedler_controllers import RoundController
# from db.mongo import db
# from auth.auth_routes import get_current_admin
# from Schema.admin_schema import (
#     AdminDashboardStats,
#     Round,
#     RoundCreate,
#     JudgeAssignment,

#     AdminSettings,
#     TeamScore,
#     JudgeStats,
#     LeaderboardSettings,
#     MentorAvailability,
#     RoundUpdate
# )
# from Schema.judge import JudgeAssignment, JudgeFeedback
# # Configure logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# router = APIRouter(tags=["admin"])

# # Utility functions for common operations
# async def check_exists(collection: str, query: Dict[str, Any]) -> bool:
#     """Check if a document exists in the given collection"""
#     return await db[collection].count_documents(query) > 0

# async def safe_update(collection: str, query: Dict[str, Any], update: Dict[str, Any]) -> bool:
#     """Safely update a document and return whether it was successful"""
#     try:
#         result = await db[collection].update_one(query, update)
#         return result.modified_count > 0
#     except Exception as e:
#         logger.error(f"Error updating {collection}: {str(e)}")
#         return False

# # Round Management
# @router.get("/rounds", response_model=List[Round])
# async def get_rounds(
#     skip: int = Query(0, ge=0),
#     limit: int = Query(10, ge=1, le=100),
#     status: Optional[str] = Query(None, enum=["scheduled", "ongoing", "completed"]),
#     current_admin = Depends(get_current_admin)
# ):
#     """
#     Get all rounds with pagination and optional status filter
#     """
#     try:
#         rounds = await RoundController.get_rounds(skip, limit, status)
#         return rounds
        
#     except Exception as e:
#         raise HTTPException(
#             status_code=500,
#             detail=str(e)
#         )
    

# @router.get("/rounds/{round_id}", response_model=Round)
# async def get_round(
#     round_id: int,
#     current_admin = Depends(get_current_admin)
# ):
#     """
#     Get a specific round by ID
#     """
#     try:
#         round = await RoundController.get_round_by_id(round_id)
#         if not round:
#             raise HTTPException(status_code=404, detail="Round not found")
#         return round
        
#     except Exception as e:
#         raise HTTPException(
#             status_code=500,
#             detail=str(e)
#         )

# @router.post("/rounds", response_model=Round, status_code=status.HTTP_201_CREATED)
# async def create_round(
#     round: RoundCreate,
#     current_admin = Depends(get_current_admin)
# ):
#     """
#     Create a new round
#     """
#     try:
#         new_round = await RoundController.create_round(round, current_admin["email"])
#         return new_round
        
#     except ValueError as e:
#         raise HTTPException(status_code=400, detail=str(e))
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


# @router.put("/rounds/{round_id}", response_model=Round)
# async def update_round(
#     round_id: int,
#     round: RoundUpdate,
#     current_admin = Depends(get_current_admin)
# ):
#     """
#     Update an existing round
#     """
#     try:
#         updated_round = await RoundController.update_round(round_id, round)
#         if not updated_round:
#             raise HTTPException(status_code=404, detail="Round not found")
#         return updated_round
        
#     except ValueError as e:
#         raise HTTPException(status_code=400, detail=str(e))
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# # Judge Assignment
# @router.post("/judges/assign")
# async def assign_judges(
#     assignment: JudgeAssignment,
#     current_admin = Depends(get_current_admin)
# ):
#     """
#     Assign judges to rounds with validation and workload balancing.
#     Checks judge availability and ensures fair distribution of teams.
#     """
#     try:
#         # Verify round exists and is valid for assignment
#         round_info = await db.rounds.find_one({"round_id": assignment.round_id})
#         if not round_info:
#             raise HTTPException(status_code=404, detail="Round not found")
#         if round_info["status"] not in ["scheduled", "ongoing"]:
#             raise HTTPException(status_code=400, detail="Cannot assign judges to completed rounds")

#         # Verify judge exists and is available
#         judge = await db.judges.find_one({"judge_id": assignment.judge_id})
#         if not judge:
#             raise HTTPException(status_code=404, detail="Judge not found")
        
#         # Check judge's current workload
#         current_assignments = len(judge.get("assigned_rounds", []))
#         if current_assignments >= 3:  # Maximum 3 rounds per judge
#             raise HTTPException(
#                 status_code=400,
#                 detail="Judge has reached maximum round assignments"
#             )

#         # Check for conflicts in judge's schedule
#         has_conflict = await db.rounds.find_one({
#             "round_id": {"$in": judge.get("assigned_rounds", [])},
#             "$or": [
#                 {
#                     "start_time": {"$lt": round_info["end_time"]},
#                     "end_time": {"$gt": round_info["start_time"]}
#                 }
#             ]
#         })
#         if has_conflict:
#             raise HTTPException(
#                 status_code=400,
#                 detail="Judge has conflicting round assignments"
#             )

#         # Update judge's assignments
#         update_result = await db.judges.update_one(
#             {"judge_id": assignment.judge_id},
#             {
#                 "$addToSet": {"assigned_rounds": assignment.round_id},
#                 "$set": {
#                     "last_updated": datetime.utcnow(),
#                     "assigned_teams": assignment.teams,
#                     "evaluation_criteria": assignment.criteria
#                 }
#             }
#         )

#         if update_result.modified_count == 0:
#             raise HTTPException(
#                 status_code=400,
#                 detail="Failed to update judge assignments"
#             )

#         # Log the assignment
#         logger.info(f"Judge {assignment.judge_id} assigned to round {assignment.round_id}")
#         return {
#             "message": "Judge assigned successfully",
#             "judge_id": assignment.judge_id,
#             "round_id": assignment.round_id,
#             "assigned_teams": len(assignment.teams)
#         }

#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error assigning judge: {str(e)}")
#         raise HTTPException(
#             status_code=500,
#             detail="Failed to assign judge"
#         )
    
# @router.delete("/rounds/{round_id}", status_code=status.HTTP_204_NO_CONTENT)
# async def delete_round(
#     round_id: int,
#     current_admin = Depends(get_current_admin)
# ):
#     """
#     Delete a round
#     """
#     try:
#         success = await RoundController.delete_round(round_id)
#         if not success:
#             raise HTTPException(status_code=404, detail="Round not found")
            
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
    
# @router.post("/rounds/{round_id}/start", response_model=Round)
# async def start_round(
#     round_id: int,
#     current_admin = Depends(get_current_admin)
# ):
#     """
#     Start a round (change status to ongoing)
#     """
#     try:
#         round = await RoundController.start_round(round_id)
#         if not round:
#             raise HTTPException(status_code=404, detail="Round not found or not in scheduled state")
#         return round
        
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# # Score Management
# @router.get("/scores", response_model=List[TeamScore])
# async def get_scores(
#     round_id: Optional[int] = Query(None, description="Filter scores by round"),
#     category: Optional[str] = Query(None, description="Filter scores by category"),
#     sort_by: str = Query("total_score", enum=["total_score", "round_score", "team_name"]),
#     sort_order: str = Query("desc", enum=["asc", "desc"]),
#     skip: int = Query(0, ge=0),
#     limit: int = Query(50, ge=1, le=100),
#     current_admin = Depends(get_current_admin)
# ):
#     """
#     Get team scores with advanced filtering, sorting, and pagination.
#     Supports sorting by different criteria and filtering by round/category.
#     """
#     try:
#         # Build query
#         query = {}
#         if round_id:
#             query[f"round_scores.{round_id}"] = {"$exists": True}
#         if category:
#             query["category"] = category

#         # Build sort configuration
#         sort_field = sort_by
#         if sort_by == "round_score" and round_id:
#             sort_field = f"round_scores.{round_id}"
#         sort_direction = -1 if sort_order == "desc" else 1

#         # Execute aggregation pipeline
#         pipeline = [
#             {"$match": query},
#             {"$sort": {sort_field: sort_direction}},
#             {"$skip": skip},
#             {"$limit": limit},
#             {
#                 "$addFields": {
#                     "rank": {"$add": [{"$indexOfArray": ["$scores", "$total_score"]}, 1]}
#                 }
#             }
#         ]

#         scores = await db.team_scores.aggregate(pipeline).to_list(None)

#         # Add statistics to response headers
#         total_count = await db.team_scores.count_documents(query)
#         stats = {
#             "total_count": total_count,
#             "page": skip // limit + 1,
#             "total_pages": (total_count + limit - 1) // limit,
#             "has_next": (skip + limit) < total_count
#         }

#         return JSONResponse(
#             content=scores,
#             headers={
#                 "X-Total-Count": str(total_count),
#                 "X-Page": str(stats["page"]),
#                 "X-Total-Pages": str(stats["total_pages"]),
#                 "X-Has-Next": str(stats["has_next"]).lower()
#             }
#         )

#     except Exception as e:
#         logger.error(f"Error fetching scores: {str(e)}")
#         raise HTTPException(
#             status_code=500,
#             detail="Failed to fetch scores"
#         )

# @router.post("/scores/{team_id}")
# async def update_score(
#     team_id: str,
#     round_id: int = Query(..., description="Round number for which to update score", ge=1),
#     score: float = Query(..., ge=0, le=100, description="Score value between 0 and 100"),
#     feedback: Optional[str] = Query(None, max_length=500, description="Optional feedback for the team"),
#     current_admin = Depends(get_current_admin)
# ):
#     """
#     Update a team's score for a specific round.
#     - Validates score range (0-100)
#     - Validates team and round existence
#     - Checks round status
#     - Updates total score automatically
#     - Logs score updates
#     """
#     try:
#         # Verify team exists
#         team = await db.teams.find_one({"team_id": team_id})
#         if not team:
#             raise HTTPException(
#                 status_code=404,
#                 detail="Team not found"
#             )

#         # Verify round exists and is active
#         round_info = await db.rounds.find_one({"round_id": round_id})
#         if not round_info:
#             raise HTTPException(
#                 status_code=404,
#                 detail="Round not found"
#             )
        
#         # Check round status
#         if round_info["status"] not in ["ongoing", "completed"]:
#             raise HTTPException(
#                 status_code=400,
#                 detail="Cannot update scores for scheduled rounds"
#             )

#         # Get existing score record
#         existing_score = await db.team_scores.find_one({"team_id": team_id})
#         old_score = existing_score.get("round_scores", {}).get(str(round_id), 0) if existing_score else 0

#         # Prepare update data
#         update_data = {
#             f"round_scores.{round_id}": score,
#             "last_updated": datetime.utcnow(),
#             "updated_by": current_admin["username"]
#         }
        
#         if feedback:
#             update_data[f"round_feedback.{round_id}"] = feedback

#         # Calculate score difference for total score adjustment
#         score_difference = score - old_score

#         # Update score and total
#         result = await db.team_scores.update_one(
#             {"team_id": team_id},
#             {
#                 "$set": update_data,
#                 "$inc": {"total_score": score_difference}
#             },
#             upsert=True
#         )

#         # Log score update
#         await db.score_logs.insert_one({
#             "team_id": team_id,
#             "round_id": round_id,
#             "old_score": old_score,
#             "new_score": score,
#             "score_change": score_difference,
#             "feedback": feedback,
#             "admin": current_admin["username"],
#             "timestamp": datetime.utcnow()
#         })

#         logger.info(f"Score updated for team {team_id} in round {round_id}: {old_score} -> {score}")

#         return {
#             "message": "Score updated successfully",
#             "team_id": team_id,
#             "round_id": round_id,
#             "old_score": old_score,
#             "new_score": score,
#             "score_change": score_difference,
#             "total_score_adjusted": True,
#             "timestamp": datetime.utcnow()
#         }

#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error updating score: {str(e)}")
#         raise HTTPException(
#             status_code=500,
#             detail="Failed to update score"
#         )

# # Leaderboard Management
# @router.post("/leaderboard/settings")
# async def update_leaderboard_settings(
#     settings: LeaderboardSettings,
#     current_admin = Depends(get_current_admin)
# ):
#     settings_dict = settings.dict()
#     settings_dict["last_updated"] = datetime.utcnow()
#     await db.settings.update_one(
#         {"_id": "leaderboard_settings"},
#         {"$set": settings_dict},
#         upsert=True
#     )
#     return settings_dict

# # Mentor Management
# @router.post("/mentors/availability")
# async def update_mentor_availability(
#     availability: MentorAvailability,
#     current_admin = Depends(get_current_admin)
# ):
#     avail_dict = availability.dict()
#     result = await db.mentor_availability.update_one(
#         {"mentor_id": availability.mentor_id},
#         {"$set": avail_dict},
#         upsert=True
#     )
#     return avail_dict

# # Admin Settings
# @router.get("/settings", response_model=AdminSettings)
# async def get_admin_settings(current_admin = Depends(get_current_admin)):
#     settings = await db.settings.find_one({"_id": "admin_settings"})
#     if not settings:
#         settings = AdminSettings(last_updated=datetime.utcnow()).dict()
#         await db.settings.insert_one({"_id": "admin_settings", **settings})
#     return settings

# @router.put("/settings", response_model=AdminSettings)
# async def update_admin_settings(
#     settings: AdminSettings,
#     current_admin = Depends(get_current_admin)
# ):
#     settings_dict = settings.dict()
#     settings_dict["last_updated"] = datetime.utcnow()
#     await db.settings.update_one(
#         {"_id": "admin_settings"},
#         {"$set": settings_dict},
#         upsert=True
#     )
#     return settings_dict


# @router.post("/rounds/{round_id}/complete", response_model=Round)
# async def complete_round(
#     round_id: int,
#     current_admin = Depends(get_current_admin)
# ):
#     """
#     Complete a round (change status to completed)
#     """
#     try:
#         round = await RoundController.complete_round(round_id)
#         if not round:
#             raise HTTPException(status_code=404, detail="Round not found or not in ongoing state")
#         return round
        
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))















from fastapi import APIRouter, HTTPException, Depends, status, Query
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, timezone
from bson import ObjectId
import logging
from fastapi.responses import JSONResponse

from db.mongo import get_database_async
from auth.auth_routes import get_current_admin
from Schema.admin_schema import (
    AdminDashboardStats,
    Round,
    RoundCreate,
    JudgeAssignment,
    AdminSettings,
    TeamScore,
    JudgeStats,
    LeaderboardSettings,
    MentorAvailability
)
from Schema.judge import JudgeAssignment, JudgeFeedback
# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(tags=["admin"])

# Database dependency
async def get_db():
    db = await get_database_async()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    return db

# Utility functions for common operations
async def check_exists(db, collection: str, query: Dict[str, Any]) -> bool:
    """Check if a document exists in the given collection"""
    return await db[collection].count_documents(query) > 0

async def safe_update(db, collection: str, query: Dict[str, Any], update: Dict[str, Any]) -> bool:
    """Safely update a document and return whether it was successful"""
    try:
        result = await db[collection].update_one(query, update)
        return result.modified_count > 0
    except Exception as e:
        logger.error(f"Error updating {collection}: {str(e)}")
        return False

# Round Management
@router.get("/rounds", response_model=List[Round])
async def get_rounds(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[str] = Query(None, enum=["scheduled", "ongoing", "completed"]),
    current_admin = Depends(get_current_admin),
    db = Depends(get_db)
):
    """
    Get all rounds with pagination and optional status filter.
    Skip and limit parameters enable pagination.
    Optional status filter to get rounds of specific status.
    """
    try:
        query = {}
        if status:
            query["status"] = status

        rounds = await db["rounds"].find(query).skip(skip).limit(limit).to_list(None)
        return rounds
    except Exception as e:
        logger.error(f"Error fetching rounds: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch rounds"
        )

@router.post("/rounds", response_model=Round, status_code=status.HTTP_201_CREATED)
async def create_round(round: RoundCreate, current_admin = Depends(get_current_admin), db = Depends(get_db)):
    """
    Create a new round with validation checks.
    Ensures round dates are valid and there are no conflicts.
    """
    try:
        print(f"Received round data: {round.dict()}")
        
        # Get current time with timezone
        current_time = datetime.now(timezone.utc)
        
        # Convert input datetimes to timezone-aware UTC
        start_time = round.start_time
        end_time = round.end_time
        
        # Handle both naive and aware datetimes
        if start_time.tzinfo is None:
            start_time = start_time.replace(tzinfo=timezone.utc)
        else:
            start_time = start_time.astimezone(timezone.utc)
            
        if end_time.tzinfo is None:
            end_time = end_time.replace(tzinfo=timezone.utc)
        else:
            end_time = end_time.astimezone(timezone.utc)
        
        # Validate round dates
        if start_time >= end_time:
            raise HTTPException(
                status_code=400,
                detail="End time must be after start time"
            )
        
        # Allow past start times for testing/draft rounds
        # if start_time < current_time:
        #     raise HTTPException(
        #         status_code=400,
        #         detail="Start time cannot be in the past"
        #     )

        # Check for overlapping rounds - convert to naive for MongoDB comparison
        overlap = await db["rounds"].find_one({
            "$or": [
                {
                    "start_time": {"$lt": end_time.replace(tzinfo=None)},
                    "end_time": {"$gt": start_time.replace(tzinfo=None)}
                },
                {
                    "category": round.category,
                    "status": {"$in": ["scheduled", "ongoing"]}
                }
            ]
        })
        
        if overlap:
            raise HTTPException(
                status_code=400,
                detail="Round overlaps with existing round or category is already active"
            )

        # Generate a new round_id
        last_round = await db["rounds"].find_one({}, sort=[("round_id", -1)])
        new_round_id = (last_round["round_id"] + 1) if last_round else 1

        # Create round - store as naive datetime for MongoDB
        round_dict = round.dict()
        round_dict.update({
            "round_id": new_round_id,
            "start_time": start_time.replace(tzinfo=None),
            "end_time": end_time.replace(tzinfo=None),
            "status": "scheduled",
            "created_at": current_time.replace(tzinfo=None),
            "created_by": current_admin["email"],
            "updated_at": current_time.replace(tzinfo=None)
        })

        result = await db["rounds"].insert_one(round_dict)
        round_dict["_id"] = str(result.inserted_id)
        
        # Log round creation
        logger.info(f"Round created: {round_dict['name']} by {current_admin['email']}")
        return round_dict

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating round: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create round: {str(e)}"
        )

@router.put("/rounds/{round_id}", response_model=Round)
async def update_round(round_id: int, round: Round, current_admin = Depends(get_current_admin), db = Depends(get_db)):
    result = await db["rounds"].update_one(
        {"round_id": round_id},
        {"$set": round.dict()}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Round not found")
    return round

@router.post("/test-datetime")
async def test_datetime_parsing(round: RoundCreate, db = Depends(get_db)):
    """Test endpoint to debug datetime parsing"""
    return {
        "received_start_time": round.start_time,
        "received_end_time": round.end_time,
        "start_time_type": str(type(round.start_time)),
        "end_time_type": str(type(round.end_time)),
        "start_time_tzinfo": str(round.start_time.tzinfo),
        "end_time_tzinfo": str(round.end_time.tzinfo)
    }

# Judge Assignment
@router.post("/judges/assign")
async def assign_judges(
    assignment: JudgeAssignment,
    current_admin = Depends(get_current_admin),
    db = Depends(get_db)
):
    """
    Assign judges to rounds with validation and workload balancing.
    Checks judge availability and ensures fair distribution of teams.
    """
    try:
        # Verify round exists and is valid for assignment
        round_info = await db["rounds"].find_one({"round_id": assignment.round_id})
        if not round_info:
            raise HTTPException(status_code=404, detail="Round not found")
        if round_info["status"] not in ["scheduled", "ongoing"]:
            raise HTTPException(status_code=400, detail="Cannot assign judges to completed rounds")

        # Verify judge exists and is available
        judge = await db["judges"].find_one({"judge_id": assignment.judge_id})
        if not judge:
            raise HTTPException(status_code=404, detail="Judge not found")
        
        # Check judge's current workload
        current_assignments = len(judge.get("assigned_rounds", []))
        if current_assignments >= 3:  # Maximum 3 rounds per judge
            raise HTTPException(
                status_code=400,
                detail="Judge has reached maximum round assignments"
            )

        # Check for conflicts in judge's schedule
        has_conflict = await db["rounds"].find_one({
            "round_id": {"$in": judge.get("assigned_rounds", [])},
            "$or": [
                {
                    "start_time": {"$lt": round_info["end_time"]},
                    "end_time": {"$gt": round_info["start_time"]}
                }
            ]
        })
        if has_conflict:
            raise HTTPException(
                status_code=400,
                detail="Judge has conflicting round assignments"
            )

        # Update judge's assignments
        update_result = await db["judges"].update_one(
            {"judge_id": assignment.judge_id},
            {
                "$addToSet": {"assigned_rounds": assignment.round_id},
                "$set": {
                    "last_updated": datetime.utcnow(),
                    "assigned_teams": assignment.teams,
                    "evaluation_criteria": assignment.criteria
                }
            }
        )

        if update_result.modified_count == 0:
            raise HTTPException(
                status_code=400,
                detail="Failed to update judge assignments"
            )

        # Log the assignment
        logger.info(f"Judge {assignment.judge_id} assigned to round {assignment.round_id}")
        return {
            "message": "Judge assigned successfully",
            "judge_id": assignment.judge_id,
            "round_id": assignment.round_id,
            "assigned_teams": len(assignment.teams)
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error assigning judge: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to assign judge"
        )

# Score Management
@router.get("/scores", response_model=List[TeamScore])
async def get_scores(
    round_id: Optional[int] = Query(None, description="Filter scores by round"),
    category: Optional[str] = Query(None, description="Filter scores by category"),
    sort_by: str = Query("total_score", enum=["total_score", "round_score", "team_name"]),
    sort_order: str = Query("desc", enum=["asc", "desc"]),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_admin = Depends(get_current_admin),
    db = Depends(get_db)
):
    """
    Get team scores with advanced filtering, sorting, and pagination.
    Supports sorting by different criteria and filtering by round/category.
    """
    try:
        # Build query
        query = {}
        if round_id:
            query[f"round_scores.{round_id}"] = {"$exists": True}
        if category:
            query["category"] = category

        # Build sort configuration
        sort_field = sort_by
        if sort_by == "round_score" and round_id:
            sort_field = f"round_scores.{round_id}"
        sort_direction = -1 if sort_order == "desc" else 1

        # Execute aggregation pipeline
        pipeline = [
            {"$match": query},
            {"$sort": {sort_field: sort_direction}},
            {"$skip": skip},
            {"$limit": limit},
            {
                "$addFields": {
                    "rank": {"$add": [{"$indexOfArray": ["$scores", "$total_score"]}, 1]}
                }
            }
        ]

        scores = await db["team_scores"].aggregate(pipeline).to_list(None)

        # Add statistics to response headers
        total_count = await db["team_scores"].count_documents(query)
        stats = {
            "total_count": total_count,
            "page": skip // limit + 1,
            "total_pages": (total_count + limit - 1) // limit,
            "has_next": (skip + limit) < total_count
        }

        return JSONResponse(
            content=scores,
            headers={
                "X-Total-Count": str(total_count),
                "X-Page": str(stats["page"]),
                "X-Total-Pages": str(stats["total_pages"]),
                "X-Has-Next": str(stats["has_next"]).lower()
            }
        )

    except Exception as e:
        logger.error(f"Error fetching scores: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch scores"
        )

@router.post("/scores/{team_id}")
async def update_score(
    team_id: str,
    round_id: int = Query(..., description="Round number for which to update score", ge=1),
    score: float = Query(..., ge=0, le=100, description="Score value between 0 and 100"),
    feedback: Optional[str] = Query(None, max_length=500, description="Optional feedback for the team"),
    current_admin = Depends(get_current_admin),
    db = Depends(get_db)
):
    """
    Update a team's score for a specific round.
    - Validates score range (0-100)
    - Validates team and round existence
    - Checks round status
    - Updates total score automatically
    - Logs score updates
    """
    try:
        # Verify team exists
        team = await db["teams"].find_one({"team_id": team_id})
        if not team:
            raise HTTPException(
                status_code=404,
                detail="Team not found"
            )

        # Verify round exists and is active
        round_info = await db["rounds"].find_one({"round_id": round_id})
        if not round_info:
            raise HTTPException(
                status_code=404,
                detail="Round not found"
            )
        
        # Check round status
        if round_info["status"] not in ["ongoing", "completed"]:
            raise HTTPException(
                status_code=400,
                detail="Cannot update scores for scheduled rounds"
            )

        # Get existing score record
        existing_score = await db["team_scores"].find_one({"team_id": team_id})
        old_score = existing_score.get("round_scores", {}).get(str(round_id), 0) if existing_score else 0

        # Prepare update data
        update_data = {
            f"round_scores.{round_id}": score,
            "last_updated": datetime.utcnow(),
            "updated_by": current_admin["username"]
        }
        
        if feedback:
            update_data[f"round_feedback.{round_id}"] = feedback

        # Calculate score difference for total score adjustment
        score_difference = score - old_score

        # Update score and total
        result = await db["team_scores"].update_one(
            {"team_id": team_id},
            {
                "$set": update_data,
                "$inc": {"total_score": score_difference}
            },
            upsert=True
        )

        # Log score update
        await db["score_logs"].insert_one({
            "team_id": team_id,
            "round_id": round_id,
            "old_score": old_score,
            "new_score": score,
            "score_change": score_difference,
            "feedback": feedback,
            "admin": current_admin["username"],
            "timestamp": datetime.utcnow()
        })

        logger.info(f"Score updated for team {team_id} in round {round_id}: {old_score} -> {score}")

        return {
            "message": "Score updated successfully",
            "team_id": team_id,
            "round_id": round_id,
            "old_score": old_score,
            "new_score": score,
            "score_change": score_difference,
            "total_score_adjusted": True,
            "timestamp": datetime.utcnow()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating score: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to update score"
        )

# Leaderboard Management
@router.post("/leaderboard/settings")
async def update_leaderboard_settings(
    settings: LeaderboardSettings,
    current_admin = Depends(get_current_admin),
    db = Depends(get_db)
):
    settings_dict = settings.dict()
    settings_dict["last_updated"] = datetime.utcnow()
    await db["settings"].update_one(
        {"_id": "leaderboard_settings"},
        {"$set": settings_dict},
        upsert=True
    )
    return settings_dict

# Mentor Management
@router.post("/mentors/availability")
async def update_mentor_availability(
    availability: MentorAvailability,
    current_admin = Depends(get_current_admin),
    db = Depends(get_db)
):
    avail_dict = availability.dict()
    result = await db["mentor_availability"].update_one(
        {"mentor_id": availability.mentor_id},
        {"$set": avail_dict},
        upsert=True
    )
    return avail_dict

# Admin Settings
@router.get("/settings", response_model=AdminSettings)
async def get_admin_settings(current_admin = Depends(get_current_admin), db = Depends(get_db)):
    settings = await db["settings"].find_one({"_id": "admin_settings"})
    if not settings:
        settings = AdminSettings(last_updated=datetime.utcnow()).dict()
        await db["settings"].insert_one({"_id": "admin_settings", **settings})
    return settings

@router.put("/settings", response_model=AdminSettings)
async def update_admin_settings(
    settings: AdminSettings,
    current_admin = Depends(get_current_admin),
    db = Depends(get_db)
):
    settings_dict = settings.dict()
    settings_dict["last_updated"] = datetime.utcnow()
    await db["settings"].update_one(
        {"_id": "admin_settings"},
        {"$set": settings_dict},
        upsert=True
    )
    return settings_dict


@router.post("/rounds/debug")
async def debug_round_creation(
    round_data: Dict[str, Any],
    current_admin = Depends(get_current_admin),
    db = Depends(get_db)
):
    """
    Debug endpoint to test round creation with raw data
    """
    try:
        from Schema.admin_schema import RoundCreate
        # Try to parse the data
        round_create = RoundCreate(**round_data)
        
        return {
            "status": "success",
            "parsed_data": round_create.dict(),
            "message": "Data parsed successfully"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Validation failed: {str(e)}",
            "error_details": str(e)
        }