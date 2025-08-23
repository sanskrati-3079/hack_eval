from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from core.config import MONGO_URI, MONGO_DB
from bson.json_util import dumps
import json

async def check_database():
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[MONGO_DB]
    
    # Get all collections
    collections = await db.list_collection_names()
    print("\nCollections in database:", collections)
    
    for collection in collections:
        print(f"\nChecking {collection}:")
        count = await db[collection].count_documents({})
        print(f"Total documents: {count}")
        
        if count > 0:
            # Show first document as sample
            sample = await db[collection].find_one()
            print(f"Sample document:\n{json.dumps(json.loads(dumps(sample)), indent=2)}")

async def check_collection(collection_name):
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[MONGO_DB]
    
    print(f"\nChecking {collection_name}:")
    count = await db[collection_name].count_documents({})
    print(f"Total documents: {count}")
    
    if count > 0:
        documents = await db[collection_name].find().to_list(None)
        print(f"All documents:\n{json.dumps(json.loads(dumps(documents)), indent=2)}")

if __name__ == "__main__":
    # Check all collections
    asyncio.run(check_database())
    
    # Uncomment and modify to check specific collections:
    # asyncio.run(check_collection("teams"))
    # asyncio.run(check_collection("rounds"))
    # asyncio.run(check_collection("team_scores"))
    # asyncio.run(check_collection("score_logs"))
