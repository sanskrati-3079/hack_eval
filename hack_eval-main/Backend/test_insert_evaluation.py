#!/usr/bin/env python3
"""
Test script to manually insert evaluation data
"""

from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

def test_insert_evaluation():
    """Test inserting evaluation data manually"""
    
    print("🧪 Testing Evaluation Data Insertion...")
    
    try:
        # Get MongoDB connection details
        user = os.getenv("MONGO_USER")
        password = os.getenv("MONGO_PASS")
        cluster = os.getenv("MONGO_CLUSTER")
        db_name = os.getenv("MONGO_DB")
        
        if not all([user, password, cluster, db_name]):
            print("❌ Missing MongoDB environment variables")
            return False
        
        # Create MongoDB URI
        from urllib.parse import quote_plus
        user = quote_plus(user)
        password = quote_plus(password)
        mongo_uri = f"mongodb+srv://{user}:{password}@{cluster}/{db_name}?retryWrites=true&w=majority"
        
        # Connect to MongoDB
        print("🔌 Connecting to MongoDB...")
        client = MongoClient(mongo_uri)
        db = client[db_name]
        
        # Test connection
        client.admin.command('ping')
        print("✅ Connected to MongoDB successfully")
        
        # Check if collections exist
        collections = db.list_collection_names()
        print(f"📊 Available collections: {collections}")
        
        # Test data (from frontend)
        test_evaluation = {
            "evaluation_id": "TEST-001",
            "judge_id": "judge123",
            "team_id": "TI-2024-001",
            "team_name": "Team Innovators",
            "problem_statement": "Smart waste management solution",
            "category": "Smart Cities",
            "round_id": 1,
            "scores": {
                "innovation": 5,
                "problem_relevance": 5,
                "feasibility": 5,
                "tech_stack_justification": 5,
                "clarity_of_solution": 5,
                "presentation_quality": 5,
                "team_understanding": 5
            },
            "total_score": 35.0,
            "average_score": 5.0,
            "personalized_feedback": "Test feedback",
            "evaluation_status": "submitted",
            "evaluated_at": datetime.utcnow(),
            "submitted_at": datetime.utcnow()
        }
        
        # Insert into team_evaluations collection
        try:
            if "team_evaluations" in collections:
                result = db["team_evaluations"].insert_one(test_evaluation)
                print(f"✅ Test evaluation inserted with ID: {result.inserted_id}")
                
                # Verify insertion
                inserted = db["team_evaluations"].find_one({"_id": result.inserted_id})
                if inserted:
                    print("✅ Data verified in database:")
                    print(f"  - Team: {inserted['team_name']}")
                    print(f"  - Total Score: {inserted['total_score']}")
                    print(f"  - Status: {inserted['evaluation_status']}")
                else:
                    print("❌ Data not found after insertion")
                    
            else:
                print("❌ Collection 'team_evaluations' not found")
                print("Run create_collections_simple.py first")
                
        except Exception as e:
            print(f"❌ Error inserting test data: {e}")
        
        # Show all evaluations
        print("\n📊 All Evaluations in Database:")
        all_evaluations = list(db["team_evaluations"].find({}))
        for eval in all_evaluations:
            print(f"  - {eval['team_name']}: {eval['total_score']}/70 ({eval['evaluation_status']})")
        
        # Close connection
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Evaluation Data Insertion Test")
    print("=" * 50)
    
    success = test_insert_evaluation()
    
    if success:
        print("\n🎉 Test completed successfully!")
        print("Check MongoDB Compass to see the data")
    else:
        print("\n❌ Test failed")
        print("Check MongoDB connection and collections")
