# test_mongo_connection.py
import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure, OperationFailure
from dotenv import load_dotenv

load_dotenv()

async def test_mongo_connection():
    MONGO_URI = os.getenv("MONGODB_URI")
    
    if not MONGO_URI:
        print("❌ MONGODB_URI not found in environment variables")
        return False
    
    print(f"Testing connection to: {MONGO_URI.split('@')[-1] if '@' in MONGO_URI else MONGO_URI}")
    
    try:
        client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        
        # Test connection
        await client.admin.command('ping')
        print("✅ MongoDB connection successful!")
        
        # Test if we can access the database
        db_name = MONGO_URI.split('/')[-1].split('?')[0] if '/' in MONGO_URI and '?' in MONGO_URI else "hackathon_eval"
        db = client[db_name]
        collections = await db.list_collection_names()
        print(f"✅ Database '{db_name}' accessible")
        print(f"✅ Collections: {collections}")
        
        return True
        
    except OperationFailure as e:
        print(f"❌ Authentication failed: {e}")
        print("Please check your username and password in the connection string")
        return False
        
    except ConnectionFailure as e:
        print(f"❌ Connection failed: {e}")
        print("Please check your network connection and IP whitelisting")
        return False
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_mongo_connection())