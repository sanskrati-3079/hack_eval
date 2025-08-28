#!/usr/bin/env python3
"""
Script to read the Excel file "Team and ps detail.xlsx" and upload all data
to the MongoDB team_ps_details collection with flexible column mapping
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
        
        # Map the actual columns to our required structure
        column_mapping = {
            'Team Name': 'Team Name',
            'Select Category ': 'Category',
            'Problem Statement Name': 'Problem Statement Title',
            'PSID': 'Problem Statement ID',
            'Problem Statement Name.1': 'Problem Statement Title Alt',
            'Problem Statement Description as it is in SIH Website': 'Problem Statement Description',
            'Team Leader Name': 'Team Leader Name',
            'Team member-1 name': 'Member 1 Name',
            'Team Member-2 Name': 'Member 2 Name',
            'Team Member-3 Name': 'Member 3 Name',
            'Team Member-4 Name': 'Member 4 Name',
            'Team Member-5 Name': 'Member 5 Name'
        }
        
        # Check which columns are available
        available_columns = {}
        for required_col, excel_col in column_mapping.items():
            if excel_col in df.columns:
                available_columns[required_col] = excel_col
                print(f"✅ Found column: {excel_col} -> {required_col}")
            else:
                print(f"⚠️ Missing column: {excel_col}")
        
        print(f"\n📋 Column mapping completed. {len(available_columns)} columns available.")
        
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
                    "roll_no": "N/A",  # Not available in current Excel
                    "email": "N/A",    # Not available in current Excel
                    "contact": "N/A",  # Not available in current Excel
                    "role": "Team Leader"
                }
                
                # Create team members list
                team_members = []
                
                # Add member 1 if exists
                if pd.notna(row['Team member-1 name']) and str(row['Team member-1 name']).strip():
                    team_members.append({
                        "name": str(row['Team member-1 name']).strip(),
                        "roll_no": "N/A",
                        "email": "N/A",
                        "contact": "N/A",
                        "role": "Member"
                    })
                
                # Add member 2 if exists
                if pd.notna(row['Team Member-2 Name']) and str(row['Team Member-2 Name']).strip():
                    team_members.append({
                        "name": str(row['Team Member-2 Name']).strip(),
                        "roll_no": "N/A",
                        "email": "N/A",
                        "contact": "N/A",
                        "role": "Member"
                    })
                
                # Add member 3 if exists
                if pd.notna(row['Team Member-3 Name']) and str(row['Team Member-3 Name']).strip():
                    team_members.append({
                        "name": str(row['Team Member-3 Name']).strip(),
                        "roll_no": "N/A",
                        "email": "N/A",
                        "contact": "N/A",
                        "role": "Member"
                    })
                
                # Add member 4 if exists
                if pd.notna(row['Team Member-4 Name']) and str(row['Team Member-4 Name']).strip():
                    team_members.append({
                        "name": str(row['Team Member-4 Name']).strip(),
                        "roll_no": "N/A",
                        "email": "N/A",
                        "contact": "N/A",
                        "role": "Member"
                    })
                
                # Add member 5 if exists
                if pd.notna(row['Team Member-5 Name']) and str(row['Team Member-5 Name']).strip():
                    team_members.append({
                        "name": str(row['Team Member-5 Name']).strip(),
                        "roll_no": "N/A",
                        "email": "N/A",
                        "contact": "N/A",
                        "role": "Member"
                    })
                
                # Create problem statement object
                problem_statement = {
                    "ps_id": str(row['PSID']).strip() if pd.notna(row['PSID']) else "N/A",
                    "title": str(row['Problem Statement Name']).strip() if pd.notna(row['Problem Statement Name']) else "N/A",
                    "description": str(row['Problem Statement Description as it is in SIH Website']).strip() if pd.notna(row['Problem Statement Description as it is in SIH Website']) else "N/A",
                    "category": str(row['Select Category ']).strip() if pd.notna(row['Select Category ']) else "N/A",
                    "difficulty": "N/A",  # Not available in current Excel
                    "domain": "N/A"       # Not available in current Excel
                }
                
                # Create team document
                team_doc = {
                    "team_id": team_id,
                    "team_name": str(row['Team Name']).strip() if pd.notna(row['Team Name']) else f"Team_{index+1}",
                    "college": "GLA University",  # Default value since not in Excel
                    "department": "N/A",           # Not available in current Excel
                    "year": "N/A",                # Not available in current Excel
                    "team_leader": team_leader,
                    "team_members": team_members,
                    "problem_statement": problem_statement,
                    "mentor": None,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "status": "active"
                }
                
                # Check if team already exists (by team name)
                existing_team = await db.team_ps_details.find_one({
                    "team_name": team_doc["team_name"]
                })
                
                if existing_team:
                    # Update existing team
                    await db.team_ps_details.update_one(
                        {"_id": existing_team["_id"]},
                        {"$set": team_doc}
                    )
                    print(f"🔄 Updated existing team: {team_doc['team_name']}")
                else:
                    # Insert new team
                    result = await db.team_ps_details.insert_one(team_doc)
                    print(f"✅ Inserted new team: {team_doc['team_name']} (ID: {result.inserted_id})")
                
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
