
import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure, OperationFailure
from dotenv import load_dotenv

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
    """Get database instance"""
    return db