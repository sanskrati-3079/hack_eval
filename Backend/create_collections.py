#!/usr/bin/env python3
"""
Script to manually create evaluation collections in MongoDB
Run this script to create the missing collections
"""

import asyncio
from db.mongo import connect_to_mongo, db
from Schema.evaluation import (
    evaluation_criteria_collection,
    team_evaluations_collection,
    evaluation_summary_collection,
    judge_evaluation_history_collection,
    default_criteria
)

async def create_collections():
    """Create all required collections for evaluation system"""
    
    print("🚀 Creating Evaluation Collections...")
    
    try:
        # Connect to MongoDB
        connected = await connect_to_mongo()
        if not connected:
            print("❌ Failed to connect to MongoDB")
            return False
            
        print("✅ Connected to MongoDB successfully")
        
        # Create collections
        collections_to_create = [
            ("evaluation_criteria", evaluation_criteria_collection),
            ("team_evaluations", team_evaluations_collection),
            ("evaluation_summary", evaluation_summary_collection),
            ("judge_evaluation_history", judge_evaluation_history_collection)
        ]
        
        for collection_name, collection in collections_to_create:
            try:
                # Check if collection exists
                collection_names = await db.list_collection_names()
                if collection_name in collection_names:
                    print(f"✅ Collection '{collection_name}' already exists")
                else:
                    # Create collection
                    await db.create_collection(collection_name)
                    print(f"✅ Collection '{collection_name}' created successfully")
                    
            except Exception as e:
                print(f"❌ Error creating collection '{collection_name}': {e}")
        
        # Insert default evaluation criteria
        try:
            existing_criteria = await evaluation_criteria_collection.count_documents({})
            if existing_criteria == 0:
                await evaluation_criteria_collection.insert_many(default_criteria)
                print(f"✅ Inserted {len(default_criteria)} default evaluation criteria")
            else:
                print(f"✅ Evaluation criteria already exist ({existing_criteria} items)")
        except Exception as e:
            print(f"❌ Error inserting default criteria: {e}")
        
        # Verify collections
        print("\n📊 Verifying Collections:")
        collection_names = await db.list_collection_names()
        for name in collection_names:
            count = await db[name].count_documents({})
            print(f"  - {name}: {count} documents")
            
        print("\n✅ All collections created successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        # Close connection
        await close_mongo_connection()

async def close_mongo_connection():
    """Close MongoDB connection"""
    try:
        from db.mongo import close_mongo_connection
        await close_mongo_connection()
    except:
        pass

if __name__ == "__main__":
    print("🔧 MongoDB Collections Creation Script")
    print("=" * 50)
    
    # Run the async function
    success = asyncio.run(create_collections())
    
    if success:
        print("\n🎉 Collections created successfully!")
        print("Now you can see score data in MongoDB!")
    else:
        print("\n❌ Failed to create collections")
        print("Check MongoDB connection and try again")
