#!/usr/bin/env python3
"""
Simple script to create evaluation collections in MongoDB
No async/await - direct MongoDB operations
"""

from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_collections():
    """Create all required collections for evaluation system"""
    
    print("🚀 Creating Evaluation Collections...")
    
    try:
        # Get MongoDB connection details
        user = os.getenv("MONGO_USER")
        password = os.getenv("MONGO_PASS")
        cluster = os.getenv("MONGO_CLUSTER")
        db_name = os.getenv("MONGO_DB")
        
        if not all([user, password, cluster, db_name]):
            print("❌ Missing MongoDB environment variables")
            print("Please check your .env file")
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
        
        # Define collections to create
        collections_to_create = [
            "evaluation_criteria",
            "team_evaluations", 
            "evaluation_summary",
            "judge_evaluation_history"
        ]
        
        # Create collections
        for collection_name in collections_to_create:
            try:
                # Check if collection exists
                if collection_name in db.list_collection_names():
                    print(f"✅ Collection '{collection_name}' already exists")
                else:
                    # Create collection
                    db.create_collection(collection_name)
                    print(f"✅ Collection '{collection_name}' created successfully")
                    
            except Exception as e:
                print(f"❌ Error creating collection '{collection_name}': {e}")
        
        # Insert default evaluation criteria
        try:
            criteria_collection = db["evaluation_criteria"]
            existing_criteria = criteria_collection.count_documents({})
            
            if existing_criteria == 0:
                default_criteria = [
                    {
                        "criteria_id": "innovation",
                        "name": "Innovation",
                        "weight": 1.0,
                        "description": "Originality and creativity of the solution"
                    },
                    {
                        "criteria_id": "problem_relevance",
                        "name": "Problem Relevance", 
                        "weight": 1.0,
                        "description": "How well the solution addresses the problem"
                    },
                    {
                        "criteria_id": "feasibility",
                        "name": "Feasibility",
                        "weight": 1.0,
                        "description": "Practical implementation potential"
                    },
                    {
                        "criteria_id": "tech_stack_justification",
                        "name": "Tech Stack Justification",
                        "weight": 1.0,
                        "description": "Appropriateness of chosen technologies"
                    },
                    {
                        "criteria_id": "clarity_of_solution",
                        "name": "Clarity of Solution",
                        "weight": 1.0,
                        "description": "How well the solution is explained"
                    },
                    {
                        "criteria_id": "presentation_quality",
                        "name": "Presentation Quality",
                        "weight": 1.0,
                        "description": "Professionalism and clarity of presentation"
                    },
                    {
                        "criteria_id": "team_understanding",
                        "name": "Team Understanding",
                        "weight": 1.0,
                        "description": "Depth of team knowledge and expertise"
                    }
                ]
                
                criteria_collection.insert_many(default_criteria)
                print(f"✅ Inserted {len(default_criteria)} default evaluation criteria")
            else:
                print(f"✅ Evaluation criteria already exist ({existing_criteria} items)")
                
        except Exception as e:
            print(f"❌ Error inserting default criteria: {e}")
        
        # Verify collections
        print("\n📊 Verifying Collections:")
        collection_names = db.list_collection_names()
        for name in collection_names:
            count = db[name].count_documents({})
            print(f"  - {name}: {count} documents")
            
        print("\n✅ All collections created successfully!")
        
        # Close connection
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🔧 MongoDB Collections Creation Script (Simple Version)")
    print("=" * 60)
    
    # Run the function
    success = create_collections()
    
    if success:
        print("\n🎉 Collections created successfully!")
        print("Now you can see score data in MongoDB!")
        print("\n📋 Next Steps:")
        print("1. Refresh MongoDB Compass")
        print("2. Look for new collections:")
        print("   - evaluation_criteria")
        print("   - team_evaluations")
        print("   - evaluation_summary")
        print("   - judge_evaluation_history")
    else:
        print("\n❌ Failed to create collections")
        print("Check MongoDB connection and try again")
