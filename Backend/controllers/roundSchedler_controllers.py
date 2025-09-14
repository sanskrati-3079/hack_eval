# from typing import List, Optional, Dict, Any
# from datetime import datetime
# from bson import ObjectId
# import logging

# from Schema.admin_schema import Round, RoundCreate, RoundUpdate 
# from db.mongo import db

# logger = logging.getLogger(__name__)

# class RoundController:
#     """Business logic controller for round operations"""
    
#     @staticmethod
#     async def get_rounds(
#         skip: int = 0,
#         limit: int = 10,
#         status: Optional[str] = None
#     ) -> List[Round]:
#         """
#         Get rounds with pagination and optional status filter
#         """
#         try:
#             query = {}
#             if status:
#                 query["status"] = status

#             rounds_cursor = db.rounds.find(query).skip(skip).limit(limit)
#             rounds = await rounds_cursor.to_list(length=limit)
            
#             return [Round(**round) for round in rounds]
            
#         except Exception as e:
#             logger.error(f"Error fetching rounds: {str(e)}")
#             raise Exception("Failed to fetch rounds")

#     @staticmethod
#     async def get_round_by_id(round_id: int) -> Optional[Round]:
#         """
#         Get a single round by round_id
#         """
#         try:
#             round_data = await db.rounds.find_one({"round_id": round_id})
#             if round_data:
#                 return Round(**round_data)
#             return None
            
#         except Exception as e:
#             logger.error(f"Error fetching round {round_id}: {str(e)}")
#             raise Exception(f"Failed to fetch round {round_id}")

#     @staticmethod
#     async def create_round(round_data: RoundCreate, created_by: str) -> Round:
#         """
#         Create a new round with validation and business rules
#         """
#         try:
#             # Validate round dates
#             if round_data.start_time >= round_data.end_time:
#                 raise ValueError("End time must be after start time")
            
#             if round_data.start_time < datetime.utcnow():
#                 raise ValueError("Start time cannot be in the past")

#             # Check for overlapping rounds
#             overlap = await db.rounds.find_one({
#                 "$or": [
#                     {
#                         "start_time": {"$lt": round_data.end_time},
#                         "end_time": {"$gt": round_data.start_time}
#                     },
#                     {
#                         "category": round_data.category,
#                         "status": {"$in": ["scheduled", "ongoing"]}
#                     }
#                 ]
#             })
            
#             if overlap:
#                 raise ValueError("Round overlaps with existing round or category is already active")

#             # Generate round_id (get the highest round_id and increment)
#             last_round = await db.rounds.find_one(
#                 {}, 
#                 sort=[("round_id", -1)]
#             )
#             next_round_id = (last_round["round_id"] + 1) if last_round else 1

#             # Create round document
#             round_dict = round_data.dict()
#             round_dict.update({
#                 "round_id": next_round_id,
#                 "status": "scheduled",
#                 "created_at": datetime.utcnow(),
#                 "created_by": created_by,
#                 "updated_at": datetime.utcnow()
#             })

#             # Insert into database
#             result = await db.rounds.insert_one(round_dict)
            
#             if result.inserted_id:
#                 round_dict["_id"] = result.inserted_id
#                 return Round(**round_dict)
#             else:
#                 raise Exception("Failed to create round")

#         except ValueError as e:
#             raise e
#         except Exception as e:
#             logger.error(f"Error creating round: {str(e)}")
#             raise Exception("Failed to create round")

#     @staticmethod
#     async def update_round(round_id: int, update_data: RoundUpdate) -> Optional[Round]:
#         """
#         Update an existing round
#         """
#         try:
#             # Check if round exists
#             existing_round = await db.rounds.find_one({"round_id": round_id})
#             if not existing_round:
#                 return None

#             # Prepare update data
#             update_dict = update_data.dict(exclude_unset=True)
#             update_dict["updated_at"] = datetime.utcnow()

#             # Validate if updating times
#             if update_data.start_time or update_data.end_time:
#                 current_start = update_data.start_time or existing_round["start_time"]
#                 current_end = update_data.end_time or existing_round["end_time"]
                
#                 if current_end <= current_start:
#                     raise ValueError("End time must be after start time")

#             # Update in database
#             result = await db.rounds.update_one(
#                 {"round_id": round_id},
#                 {"$set": update_dict}
#             )

#             if result.modified_count > 0:
#                 updated_round = await db.rounds.find_one({"round_id": round_id})
#                 return Round(**updated_round)
#             return None

#         except ValueError as e:
#             raise e
#         except Exception as e:
#             logger.error(f"Error updating round {round_id}: {str(e)}")
#             raise Exception(f"Failed to update round {round_id}")

#     @staticmethod
#     async def delete_round(round_id: int) -> bool:
#         """
#         Delete a round
#         """
#         try:
#             result = await db.rounds.delete_one({"round_id": round_id})
#             return result.deleted_count > 0
            
#         except Exception as e:
#             logger.error(f"Error deleting round {round_id}: {str(e)}")
#             raise Exception(f"Failed to delete round {round_id}")

#     @staticmethod
#     async def start_round(round_id: int) -> Optional[Round]:
#         """
#         Start a round (change status to ongoing)
#         """
#         try:
#             result = await db.rounds.update_one(
#                 {"round_id": round_id, "status": "scheduled"},
#                 {"$set": {"status": "ongoing", "updated_at": datetime.utcnow()}}
#             )
            
#             if result.modified_count > 0:
#                 updated_round = await db.rounds.find_one({"round_id": round_id})
#                 return Round(**updated_round)
#             return None
            
#         except Exception as e:
#             logger.error(f"Error starting round {round_id}: {str(e)}")
#             raise Exception(f"Failed to start round {round_id}")

#     @staticmethod
#     async def complete_round(round_id: int) -> Optional[Round]:
#         """
#         Complete a round (change status to completed)
#         """
#         try:
#             result = await db.rounds.update_one(
#                 {"round_id": round_id, "status": "ongoing"},
#                 {"$set": {"status": "completed", "updated_at": datetime.utcnow()}}
#             )
            
#             if result.modified_count > 0:
#                 updated_round = await db.rounds.find_one({"round_id": round_id})
#                 return Round(**updated_round)
#             return None
            
#         except Exception as e:
#             logger.error(f"Error completing round {round_id}: {str(e)}")
#             raise Exception(f"Failed to complete round {round_id}")

















from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
import logging

from Schema.admin_schema import Round, RoundCreate, RoundUpdate
from db.mongo import db

logger = logging.getLogger(__name__)

class RoundController:
    """Business logic controller for round operations"""
    
    @staticmethod
    async def get_rounds(
        skip: int = 0,
        limit: int = 10,
        status: Optional[str] = None
    ) -> List[Round]:
        """
        Get rounds with pagination and optional status filter
        """
        try:
            query = {}
            if status:
                query["status"] = status

            rounds_cursor = db.rounds.find(query).skip(skip).limit(limit)
            rounds = await rounds_cursor.to_list(length=limit)
            
            return [Round(**round) for round in rounds]
            
        except Exception as e:
            logger.error(f"Error fetching rounds: {str(e)}")
            raise Exception("Failed to fetch rounds")

    @staticmethod
    async def get_round_by_id(round_id: int) -> Optional[Round]:
        """
        Get a single round by round_id
        """
        try:
            round_data = await db.rounds.find_one({"round_id": round_id})
            if round_data:
                return Round(**round_data)
            return None
            
        except Exception as e:
            logger.error(f"Error fetching round {round_id}: {str(e)}")
            raise Exception(f"Failed to fetch round {round_id}")

    @staticmethod
    async def create_round(round_data: RoundCreate, created_by: str) -> Round:
        """
        Create a new round with validation and business rules
        """
        try:
            # Validate round dates
            if round_data.start_time >= round_data.end_time:
                raise ValueError("End time must be after start time")
            
            if round_data.start_time < datetime.utcnow():
                raise ValueError("Start time cannot be in the past")

            # Check for overlapping rounds
            overlap = await db.rounds.find_one({
                "$or": [
                    {
                        "start_time": {"$lt": round_data.end_time},
                        "end_time": {"$gt": round_data.start_time}
                    },
                    {
                        "category": round_data.category,
                        "status": {"$in": ["scheduled", "ongoing"]}
                    }
                ]
            })
            
            if overlap:
                raise ValueError("Round overlaps with existing round or category is already active")

            # Generate round_id (get the highest round_id and increment)
            last_round = await db.rounds.find_one(
                {}, 
                sort=[("round_id", -1)]
            )
            next_round_id = (last_round["round_id"] + 1) if last_round else 1

            # Create round document
            round_dict = round_data.dict()
            round_dict.update({
                "round_id": next_round_id,
                "status": "scheduled",
                "created_at": datetime.utcnow(),
                "created_by": created_by,
                "updated_at": datetime.utcnow()
            })

            # Insert into database
            result = await db.rounds.insert_one(round_dict)
            
            if result.inserted_id:
                round_dict["_id"] = result.inserted_id
                return Round(**round_dict)
            else:
                raise Exception("Failed to create round")

        except ValueError as e:
            raise e
        except Exception as e:
            logger.error(f"Error creating round: {str(e)}")
            raise Exception("Failed to create round")

    @staticmethod
    async def update_round(round_id: int, update_data: RoundUpdate) -> Optional[Round]:
        """
        Update an existing round
        """
        try:
            # Check if round exists
            existing_round = await db.rounds.find_one({"round_id": round_id})
            if not existing_round:
                return None

            # Prepare update data
            update_dict = update_data.dict(exclude_unset=True)
            update_dict["updated_at"] = datetime.utcnow()

            # Validate if updating times
            if update_data.start_time or update_data.end_time:
                current_start = update_data.start_time or existing_round["start_time"]
                current_end = update_data.end_time or existing_round["end_time"]
                
                if current_end <= current_start:
                    raise ValueError("End time must be after start time")

            # Update in database
            result = await db.rounds.update_one(
                {"round_id": round_id},
                {"$set": update_dict}
            )

            if result.modified_count > 0:
                updated_round = await db.rounds.find_one({"round_id": round_id})
                return Round(**updated_round)
            return None

        except ValueError as e:
            raise e
        except Exception as e:
            logger.error(f"Error updating round {round_id}: {str(e)}")
            raise Exception(f"Failed to update round {round_id}")

    @staticmethod
    async def delete_round(round_id: int) -> bool:
        """
        Delete a round
        """
        try:
            result = await db.rounds.delete_one({"round_id": round_id})
            return result.deleted_count > 0
            
        except Exception as e:
            logger.error(f"Error deleting round {round_id}: {str(e)}")
            raise Exception(f"Failed to delete round {round_id}")

    @staticmethod
    async def start_round(round_id: int) -> Optional[Round]:
        """
        Start a round (change status to ongoing)
        """
        try:
            result = await db.rounds.update_one(
                {"round_id": round_id, "status": "scheduled"},
                {"$set": {"status": "ongoing", "updated_at": datetime.utcnow()}}
            )
            
            if result.modified_count > 0:
                updated_round = await db.rounds.find_one({"round_id": round_id})
                return Round(**updated_round)
            return None
            
        except Exception as e:
            logger.error(f"Error starting round {round_id}: {str(e)}")
            raise Exception(f"Failed to start round {round_id}")

    @staticmethod
    async def complete_round(round_id: int) -> Optional[Round]:
        """
        Complete a round (change status to completed)
        """
        try:
            result = await db.rounds.update_one(
                {"round_id": round_id, "status": "ongoing"},
                {"$set": {"status": "completed", "updated_at": datetime.utcnow()}}
            )
            
            if result.modified_count > 0:
                updated_round = await db.rounds.find_one({"round_id": round_id})
                return Round(**updated_round)
            return None
            
        except Exception as e:
            logger.error(f"Error completing round {round_id}: {str(e)}")
            raise Exception(f"Failed to complete round {round_id}")