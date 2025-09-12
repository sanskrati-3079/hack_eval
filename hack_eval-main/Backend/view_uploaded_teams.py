#!/usr/bin/env python3
"""
Script to view and verify the uploaded team data in MongoDB
"""

import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from urllib.parse import quote_plus
from pprint import pprint

# Load environment variables
load_dotenv()

async def view_uploaded_teams():
    """View and verify the uploaded team data"""
    
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
        
        # Get collection info
        collection = db.team_ps_details
        total_docs = await collection.count_documents({})
        print(f"📊 Total teams in collection: {total_docs}")
        
        # Get a sample team to show structure
        print("\n🔍 Sample Team Structure:")
        sample_team = await collection.find_one({})
        if sample_team:
            # Remove MongoDB ObjectId for display
            sample_team["_id"] = str(sample_team["_id"])
            pprint(sample_team, width=120, depth=3)
        
        # Get teams by category
        print("\n📋 Teams by Category:")
        pipeline = [
            {"$group": {"_id": "$problem_statement.category", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        category_stats = await collection.aggregate(pipeline).to_list(None)
        
        for stat in category_stats:
            print(f"   {stat['_id']}: {stat['count']} teams")
        
        # Get teams by college
        print("\n🏫 Teams by College:")
        pipeline = [
            {"$group": {"_id": "$college", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        college_stats = await collection.aggregate(pipeline).to_list(None)
        
        for stat in college_stats:
            print(f"   {stat['_id']}: {stat['count']} teams")
        
        # Show first 5 team names
        print("\n👥 First 5 Teams:")
        first_teams = await collection.find({}, {"team_name": 1, "team_leader.name": 1, "problem_statement.title": 1}).limit(5).to_list(None)
        
        for i, team in enumerate(first_teams, 1):
            print(f"   {i}. {team['team_name']}")
            print(f"      Leader: {team['team_leader']['name']}")
            print(f"      PS: {team['problem_statement']['title'][:50]}...")
            print()
        
        # Show last 5 team names
        print("👥 Last 5 Teams:")
        last_teams = await collection.find({}, {"team_name": 1, "team_leader.name": 1, "problem_statement.title": 1}).skip(total_docs - 5).to_list(None)
        
        for i, team in enumerate(last_teams, 1):
            print(f"   {i}. {team['team_name']}")
            print(f"      Leader: {team['team_leader']['name']}")
            print(f"      PS: {team['problem_statement']['title'][:50]}...")
            print()
        
        # Close connection
        client.close()
        print("✅ MongoDB connection closed")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Viewing uploaded team data...")
    success = asyncio.run(view_uploaded_teams())
    
    if success:
        print("\n✅ Data verification completed!")
    else:
        print("\n❌ Data verification failed!")
