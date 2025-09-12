#!/usr/bin/env python3
"""
Script to read the Excel file "Team and ps detail.xlsx" and upload all data
to the MongoDB team_ps_details collection
"""

import asyncio
import os
import pandas as pd
import uuid
from datetime import datetime
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from urllib.parse import quote_plus

# Load environment variables
load_dotenv()

async def upload_all_team_data():
    """Read Excel file and upload all team data to MongoDB"""
    
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
        
        # Path to the Excel file
        excel_file_path = "../Team and ps detail.xlsx"
        
        if not os.path.exists(excel_file_path):
            print(f"❌ Excel file not found at: {excel_file_path}")
            return False
        
        print(f"📁 Reading Excel file: {excel_file_path}")
        
        # Read the Excel file
        df = pd.read_excel(excel_file_path)
        
        print(f"📊 Excel file loaded with {len(df)} rows and {len(df.columns)} columns")
        print(f"📋 Columns found: {list(df.columns)}")
        
        # Check if required columns exist
        required_columns = [
            'Team Name', 'College', 'Department', 'Year', 
            'Team Leader Name', 'Team Leader Roll No', 'Team Leader Email', 'Team Leader Contact',
            'Member 1 Name', 'Member 1 Roll No', 'Member 1 Email', 'Member 1 Contact',
            'Member 2 Name', 'Member 2 Roll No', 'Member 2 Email', 'Member 2 Contact',
            'Problem Statement ID', 'Problem Statement Title', 'Problem Statement Description',
            'Category', 'Difficulty', 'Domain'
        ]
        
        # Check which columns are missing
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            print(f"⚠️ Missing columns: {missing_columns}")
            print("🔍 Available columns:")
            for col in df.columns:
                print(f"   - {col}")
            
            # Try to map similar column names
            print("\n🔄 Attempting to map similar column names...")
            column_mapping = {}
            
            for required_col in missing_columns:
                for available_col in df.columns:
                    if required_col.lower() in available_col.lower() or available_col.lower() in required_col.lower():
                        column_mapping[required_col] = available_col
                        print(f"   Mapped '{required_col}' to '{available_col}'")
                        break
            
            # Update required columns with mapped ones
            for required_col in missing_columns[:]:
                if required_col in column_mapping:
                    required_columns[required_columns.index(required_col)] = column_mapping[required_col]
                    missing_columns.remove(required_col)
            
            if missing_columns:
                print(f"❌ Still missing columns: {missing_columns}")
                return False
        
        print("✅ All required columns found or mapped")
        
        # Process each row
        teams_processed = 0
        teams_saved = 0
        errors = []
        
        print(f"\n🚀 Starting to process {len(df)} teams...")
        
        for index, row in df.iterrows():
            try:
                teams_processed += 1
                
                if teams_processed % 10 == 0:
                    print(f"📈 Processed {teams_processed}/{len(df)} teams...")
                
                # Generate unique team ID
                team_id = f"TEAM_{uuid.uuid4().hex[:8].upper()}"
                
                # Create team leader object
                team_leader = {
                    "name": str(row['Team Leader Name']).strip() if pd.notna(row['Team Leader Name']) else "N/A",
                    "roll_no": str(row['Team Leader Roll No']).strip() if pd.notna(row['Team Leader Roll No']) else "N/A",
                    "email": str(row['Team Leader Email']).strip() if pd.notna(row['Team Leader Email']) else "N/A",
                    "contact": str(row['Team Leader Contact']).strip() if pd.notna(row['Team Leader Contact']) else "N/A",
                    "role": "Team Leader"
                }
                
                # Create team members list
                team_members = []
                
                # Add member 1 if exists
                if pd.notna(row['Member 1 Name']) and str(row['Member 1 Name']).strip():
                    team_members.append({
                        "name": str(row['Member 1 Name']).strip(),
                        "roll_no": str(row['Member 1 Roll No']).strip() if pd.notna(row['Member 1 Roll No']) else "N/A",
                        "email": str(row['Member 1 Email']).strip() if pd.notna(row['Member 1 Email']) else "N/A",
                        "contact": str(row['Member 1 Contact']).strip() if pd.notna(row['Member 1 Contact']) else "N/A",
                        "role": "Member"
                    })
                
                # Add member 2 if exists
                if pd.notna(row['Member 2 Name']) and str(row['Member 2 Name']).strip():
                    team_members.append({
                        "name": str(row['Member 2 Name']).strip(),
                        "roll_no": str(row['Member 2 Roll No']).strip() if pd.notna(row['Member 2 Roll No']) else "N/A",
                        "email": str(row['Member 2 Email']).strip() if pd.notna(row['Member 2 Email']) else "N/A",
                        "contact": str(row['Member 2 Contact']).strip() if pd.notna(row['Member 2 Contact']) else "N/A",
                        "role": "Member"
                    })
                
                # Create problem statement object
                problem_statement = {
                    "ps_id": str(row['Problem Statement ID']).strip() if pd.notna(row['Problem Statement ID']) else "N/A",
                    "title": str(row['Problem Statement Title']).strip() if pd.notna(row['Problem Statement Title']) else "N/A",
                    "description": str(row['Problem Statement Description']).strip() if pd.notna(row['Problem Statement Description']) else "N/A",
                    "category": str(row['Category']).strip() if pd.notna(row['Category']) else "N/A",
                    "difficulty": str(row['Difficulty']).strip() if pd.notna(row['Difficulty']) else "N/A",
                    "domain": str(row['Domain']).strip() if pd.notna(row['Domain']) else "N/A"
                }
                
                # Create team document
                team_doc = {
                    "team_id": team_id,
                    "team_name": str(row['Team Name']).strip() if pd.notna(row['Team Name']) else f"Team_{index+1}",
                    "college": str(row['College']).strip() if pd.notna(row['College']) else "N/A",
                    "department": str(row['Department']).strip() if pd.notna(row['Department']) else "N/A",
                    "year": str(row['Year']).strip() if pd.notna(row['Year']) else "N/A",
                    "team_leader": team_leader,
                    "team_members": team_members,
                    "problem_statement": problem_statement,
                    "mentor": None,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "status": "active"
                }
                
                # Check if team already exists (by team name and college)
                existing_team = await db.team_ps_details.find_one({
                    "team_name": team_doc["team_name"],
                    "college": team_doc["college"]
                })
                
                if existing_team:
                    # Update existing team
                    await db.team_ps_details.update_one(
                        {"_id": existing_team["_id"]},
                        {"$set": team_doc}
                    )
                    print(f"🔄 Updated existing team: {team_doc['team_name']} from {team_doc['college']}")
                else:
                    # Insert new team
                    result = await db.team_ps_details.insert_one(team_doc)
                    print(f"✅ Inserted new team: {team_doc['team_name']} from {team_doc['college']} (ID: {result.inserted_id})")
                
                teams_saved += 1
                
            except Exception as e:
                error_msg = f"Row {index + 2}: {str(e)}"
                errors.append(error_msg)
                print(f"❌ Error processing row {index + 2}: {str(e)}")
                continue
        
        # Get final collection info
        total_docs = await db.team_ps_details.count_documents({})
        
        print(f"\n🎉 Data upload completed!")
        print(f"📊 Summary:")
        print(f"   - Teams processed: {teams_processed}")
        print(f"   - Teams saved: {teams_saved}")
        print(f"   - Errors: {len(errors)}")
        print(f"   - Total documents in collection: {total_docs}")
        
        if errors:
            print(f"\n❌ Errors encountered:")
            for error in errors[:10]:  # Show first 10 errors
                print(f"   - {error}")
            if len(errors) > 10:
                print(f"   ... and {len(errors) - 10} more errors")
        
        # Close connection
        client.close()
        print("✅ MongoDB connection closed")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting bulk upload of team data...")
    success = asyncio.run(upload_all_team_data())
    
    if success:
        print("\n🎉 All team data has been successfully uploaded to MongoDB!")
        print("\n📋 You can now:")
        print("   - View all teams at GET /team-ps/teams")
        print("   - Search teams by college at GET /team-ps/college/{college_name}")
        print("   - Search teams by category at GET /team-ps/category/{category}")
        print("   - Get specific team at GET /team-ps/teams/{team_id}")
    else:
        print("\n❌ Team data upload failed!")
