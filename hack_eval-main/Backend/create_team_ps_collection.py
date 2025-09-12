#!/usr/bin/env python3
"""
Script to create the team_ps_details collection in MongoDB
and test the database connection
"""

import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from urllib.parse import quote_plus

# Load environment variables
load_dotenv()

async def create_collection():
    """Create the team_ps_details collection and test connection"""
    
    # Get MongoDB connection details
    user = os.getenv("MONGO_USER")
    password = os.getenv("MONGO_PASS")
    cluster = os.getenv("MONGO_CLUSTER")
    db_name = os.getenv("MONGO_DB")
    
    if not all([user, password, cluster, db_name]):
        print("❌ Missing MongoDB environment variables")
        return False
    
    user = quote_plus(user)
    password = quote_plus(password)
    
    MONGO_URI = f"mongodb+srv://{user}:{password}@{cluster}/{db_name}?retryWrites=true&w=majority"
    
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(MONGO_URI)
        db = client[db_name]
        
        # Test the connection
        await client.admin.command('ping')
        print("✅ MongoDB connected successfully")
        
        # Create collection if it doesn't exist
        collection_name = "team_ps_details"
        
        # Check if collection exists
        collections = await db.list_collection_names()
        if collection_name in collections:
            print(f"✅ Collection '{collection_name}' already exists")
        else:
            # Create collection with a sample document
            sample_doc = {
                "team_id": "SAMPLE_TEAM_001",
                "team_name": "Sample Team",
                "college": "Sample College",
                "department": "Computer Science",
                "year": "3rd Year",
                "team_leader": {
                    "name": "Sample Leader",
                    "roll_no": "SAMPLE001",
                    "email": "leader@sample.com",
                    "contact": "1234567890",
                    "role": "Team Leader"
                },
                "team_members": [
                    {
                        "name": "Sample Member 1",
                        "roll_no": "SAMPLE002",
                        "email": "member1@sample.com",
                        "contact": "1234567891",
                        "role": "Member"
                    }
                ],
                "problem_statement": {
                    "ps_id": "PS001",
                    "title": "Sample Problem Statement",
                    "description": "This is a sample problem statement for testing",
                    "category": "Technology",
                    "difficulty": "Medium",
                    "domain": "Software Development"
                },
                "mentor": None,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z",
                "status": "active"
            }
            
            result = await db[collection_name].insert_one(sample_doc)
            print(f"✅ Collection '{collection_name}' created successfully")
            print(f"✅ Sample document inserted with ID: {result.inserted_id}")
        
        # Get collection info
        collection = db[collection_name]
        doc_count = await collection.count_documents({})
        print(f"📊 Collection '{collection_name}' contains {doc_count} documents")
        
        # Close connection
        client.close()
        print("✅ MongoDB connection closed")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Creating team_ps_details collection...")
    success = asyncio.run(create_collection())
    
    if success:
        print("\n🎉 Collection setup completed successfully!")
        print("\n📋 Available endpoints:")
        print("  POST /team-ps/upload-excel - Upload Excel file with team details")
        print("  GET  /team-ps/teams - Get all teams")
        print("  GET  /team-ps/teams/{team_id} - Get specific team")
        print("  GET  /team-ps/college/{college_name} - Get teams by college")
        print("  GET  /team-ps/category/{category} - Get teams by category")
    else:
        print("\n❌ Collection setup failed!")
