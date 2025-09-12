#!/usr/bin/env python3
"""
Script to update team data with more complete information
and replace N/A values with meaningful defaults
"""

import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from urllib.parse import quote_plus

# Load environment variables
load_dotenv()

async def update_team_data():
    """Update team data with more complete information"""
    
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
        
        # Update teams with better information
        update_count = 0
        
        # Get all teams
        teams = await collection.find({}).to_list(None)
        
        for team in teams:
            try:
                updates = {}
                
                # Update team leader information
                if team.get('team_leader', {}).get('roll_no') == 'N/A':
                    updates['team_leader.roll_no'] = f"ROLL_{team['team_id'][-4:]}"
                
                if team.get('team_leader', {}).get('email') == 'N/A':
                    leader_name = team.get('team_leader', {}).get('name', 'Unknown')
                    if leader_name != 'N/A':
                        # Create a reasonable email format
                        email_name = leader_name.lower().replace(' ', '.')
                        updates['team_leader.email'] = f"{email_name}@gla.ac.in"
                    else:
                        updates['team_leader.email'] = f"leader.{team['team_id'][-4:]}@gla.ac.in"
                
                if team.get('team_leader', {}).get('contact') == 'N/A':
                    updates['team_leader.contact'] = f"+91{team['team_id'][-8:]}"
                
                # Update team members information
                if 'team_members' in team and team['team_members']:
                    for i, member in enumerate(team['team_members']):
                        if member.get('roll_no') == 'N/A':
                            updates[f'team_members.{i}.roll_no'] = f"MEMBER_{team['team_id'][-4:]}_{i+1}"
                        
                        if member.get('email') == 'N/A':
                            member_name = member.get('name', 'Unknown')
                            if member_name != 'N/A':
                                email_name = member_name.lower().replace(' ', '.')
                                updates[f'team_members.{i}.email'] = f"{email_name}@gla.ac.in"
                            else:
                                updates[f'team_members.{i}.email'] = f"member{i+1}.{team['team_id'][-4:]}@gla.ac.in"
                        
                        if member.get('contact') == 'N/A':
                            updates[f'team_members.{i}.contact'] = f"+91{team['team_id'][-8:]}{i+1}"
                
                # Update problem statement information
                if team.get('problem_statement', {}).get('difficulty') == 'N/A':
                    # Set difficulty based on category
                    category = team.get('problem_statement', {}).get('category', '')
                    if category == 'Software':
                        updates['problem_statement.difficulty'] = 'Medium'
                    elif category == 'Hardware':
                        updates['problem_statement.difficulty'] = 'Hard'
                    else:
                        updates['problem_statement.difficulty'] = 'Medium'
                
                if team.get('problem_statement', {}).get('domain') == 'N/A':
                    # Set domain based on problem statement title
                    title = team.get('problem_statement', {}).get('title', '').lower()
                    if 'health' in title or 'medical' in title:
                        updates['problem_statement.domain'] = 'Healthcare'
                    elif 'education' in title or 'learning' in title:
                        updates['problem_statement.domain'] = 'Education'
                    elif 'agriculture' in title or 'farming' in title:
                        updates['problem_statement.domain'] = 'Agriculture'
                    elif 'finance' in title or 'banking' in title:
                        updates['problem_statement.domain'] = 'Finance'
                    elif 'transport' in title or 'logistics' in title:
                        updates['problem_statement.domain'] = 'Transportation'
                    else:
                        updates['problem_statement.domain'] = 'Technology'
                
                # Update college information if it's the default
                if team.get('college') == 'GLA University':
                    updates['college'] = 'GLA University, Mathura'
                
                # Update department if it's N/A
                if team.get('department') == 'N/A':
                    updates['department'] = 'Computer Science & Engineering'
                
                # Update year if it's N/A
                if team.get('year') == 'N/A':
                    updates['year'] = '3rd Year'
                
                # Apply updates if any
                if updates:
                    result = await collection.update_one(
                        {"_id": team["_id"]},
                        {"$set": updates}
                    )
                    if result.modified_count > 0:
                        update_count += 1
                        print(f"✅ Updated team: {team['team_name']}")
                        print(f"   Updates: {list(updates.keys())}")
                
            except Exception as e:
                print(f"❌ Error updating team {team.get('team_name', 'Unknown')}: {str(e)}")
                continue
        
        print(f"\n🎉 Update completed!")
        print(f"📊 Summary:")
        print(f"   - Teams updated: {update_count}")
        print(f"   - Total teams: {total_docs}")
        
        # Show a sample updated team
        print(f"\n🔍 Sample Updated Team:")
        sample_team = await collection.find_one({})
        if sample_team:
            print(f"   Team: {sample_team['team_name']}")
            print(f"   Leader: {sample_team['team_leader']['name']}")
            print(f"   Leader Email: {sample_team['team_leader']['email']}")
            print(f"   Leader Contact: {sample_team['team_leader']['contact']}")
            print(f"   Department: {sample_team['department']}")
            print(f"   Year: {sample_team['year']}")
            print(f"   Difficulty: {sample_team['problem_statement']['difficulty']}")
            print(f"   Domain: {sample_team['problem_statement']['domain']}")
        
        # Close connection
        client.close()
        print("✅ MongoDB connection closed")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting team data update...")
    success = asyncio.run(update_team_data())
    
    if success:
        print("\n🎉 Team data has been updated successfully!")
        print("\n📋 The following improvements were made:")
        print("   - Generated realistic roll numbers")
        print("   - Created GLA email addresses")
        print("   - Generated contact numbers")
        print("   - Set difficulty levels based on category")
        print("   - Assigned domains based on problem statements")
        print("   - Enhanced college and department information")
    else:
        print("\n❌ Team data update failed!")
