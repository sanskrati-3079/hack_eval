#!/usr/bin/env python3
"""
Script to create a test judge in the database for testing authentication
Run this script after starting MongoDB and before testing the frontend
"""

import asyncio
import sys
import os
from datetime import datetime
from bson import ObjectId

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db.mongo import db
from utils.hash_password import get_password_hash

async def create_test_judge():
    """Create a test judge in the database"""
    try:
        # Check if database connection is available
        if db is None:
            print("❌ Database connection not available. Please check MongoDB connection.")
            return False
        
        # Check if judge already exists
        existing_judge = await db.judges.find_one({"username": "testjudge"})
        if existing_judge:
            print("✅ Test judge already exists in database")
            return True
        
        # Create test judge data matching your database structure
        test_judge = {
            "_id": ObjectId(),
            "username": "testjudge",
            "password": "test123",  # Plain text password as per your DB structure
            "name": "Test Judge",
            "expertise": ["Web Development", "Mobile Development"],
            "bio": "Test judge for development purposes",
            "assigned_teams": [],
            "rounds": []
        }
        
        # Insert into database
        result = await db.judges.insert_one(test_judge)
        
        if result.inserted_id:
            print("✅ Test judge created successfully!")
            print(f"   Username: {test_judge['username']}")
            print(f"   Password: {test_judge['password']}")
            print(f"   ID: {test_judge['_id']}")
            return True
        else:
            print("❌ Failed to create test judge")
            return False
            
    except Exception as e:
        print(f"❌ Error creating test judge: {str(e)}")
        return False

async def main():
    """Main function"""
    print("🚀 Creating test judge for authentication testing...")
    
    success = await create_test_judge()
    
    if success:
        print("\n🎉 Test judge created successfully!")
        print("You can now use these credentials to test the judge panel:")
        print("   Username: testjudge")
        print("   Password: test123")
        print("\nOr use your existing credentials:")
        print("   Username: judge01, Password: GLA_01")
        print("   Username: judge02, Password: GLA_02")
        print("\nStart your backend server and try logging in!")
    else:
        print("\n💥 Failed to create test judge. Please check the error messages above.")

if __name__ == "__main__":
    # Run the async function
    asyncio.run(main())
