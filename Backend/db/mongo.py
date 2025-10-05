import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure, OperationFailure
from dotenv import load_dotenv
import asyncio

load_dotenv()

# MongoDB connection details
MONGO_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME", "hackathon_evaluation")

client = None
db = None

async def connect_to_mongo():
    """Connect to MongoDB with error handling"""
    global client, db
    try:
        if not MONGO_URI:
            print("❌ MONGODB_URI environment variable not set")
            return False
            
        client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        
        # Test the connection
        await client.admin.command('ping')
        
        db = client[DB_NAME]
        print(f"✅ Connected to MongoDB: {DB_NAME}")
        return True
        
    except ConnectionFailure as e:
        print(f"❌ MongoDB connection failed: {e}")
        return False
    except OperationFailure as e:
        print(f"❌ MongoDB authentication failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected MongoDB error: {e}")
        return False

async def close_mongo_connection():
    """Close MongoDB connection"""
    global client
    if client:
        client.close()
        print("✅ MongoDB connection closed")

def get_database():
    """Get database instance - for synchronous contexts"""
    global db
    return db

async def get_database_async():
    """Get database instance asynchronously"""
    global db
    if db is None:
        success = await connect_to_mongo()
        if not success:
            return None
    return db


















# import os
# from motor.motor_asyncio import AsyncIOMotorClient
# from pymongo.errors import ConnectionFailure, OperationFailure
# from dotenv import load_dotenv
# import logging

# load_dotenv()

# # Configure logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# # MongoDB connection details
# MONGO_URI = os.getenv("MONGODB_URI")
# DB_NAME = os.getenv("DB_NAME", "hackathon_evaluation")

# # Global database instance
# _client = None
# _db = None

# async def connect_to_mongo():
#     """Connect to MongoDB with error handling"""
#     global _client, _db
#     try:
#         if not MONGO_URI:
#             logger.error("❌ MONGODB_URI environment variable not set")
#             return False
            
#         _client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=10000)
        
#         # Test the connection
#         await _client.admin.command('ping')
        
#         _db = _client[DB_NAME]
#         logger.info(f"✅ Connected to MongoDB: {DB_NAME}")
#         return True
        
#     except ConnectionFailure as e:
#         logger.error(f"❌ MongoDB connection failed: {e}")
#         return False
#     except OperationFailure as e:
#         logger.error(f"❌ MongoDB authentication failed: {e}")
#         return False
#     except Exception as e:
#         logger.error(f"❌ Unexpected MongoDB error: {e}")
#         return False

# async def close_mongo_connection():
#     """Close MongoDB connection"""
#     global _client
#     if _client:
#         _client.close()
#         logger.info("✅ MongoDB connection closed")

# def get_database():
#     """Get database instance with error handling"""
#     global _db
#     if _db is None:
#         logger.error("❌ Database not initialized. Call connect_to_mongo() first.")
#         raise RuntimeError("Database not initialized")
#     return _db

# async def check_database_connection():
#     """Check if database connection is active"""
#     try:
#         db = get_database()
#         await db.command('ping')
#         return True
#     except Exception as e:
#         logger.error(f"Database connection check failed: {e}")
#         return False