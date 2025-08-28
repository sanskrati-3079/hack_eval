from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from fastapi.responses import JSONResponse
import pandas as pd
import io
from typing import List
import uuid
from datetime import datetime

from db.mongo import db
from Schema.team_ps_details import TeamPSDetails, ExcelUploadResponse
from auth.auth_routes import get_current_user

router = APIRouter(prefix="/team-ps", tags=["Team and Problem Statement Details"])

@router.post("/upload-excel", response_model=ExcelUploadResponse)
async def upload_team_ps_excel(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload Excel file containing team and problem statement details
    and save to MongoDB collection
    """
    if not file.filename.endswith('.xlsx'):
        raise HTTPException(status_code=400, detail="Only Excel (.xlsx) files are allowed")
    
    try:
        # Read the Excel file
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        
        # Validate required columns
        required_columns = [
            'Team Name', 'College', 'Department', 'Year', 
            'Team Leader Name', 'Team Leader Roll No', 'Team Leader Email', 'Team Leader Contact',
            'Member 1 Name', 'Member 1 Roll No', 'Member 1 Email', 'Member 1 Contact',
            'Member 2 Name', 'Member 2 Roll No', 'Member 2 Email', 'Member 2 Contact',
            'Problem Statement ID', 'Problem Statement Title', 'Problem Statement Description',
            'Category', 'Difficulty', 'Domain'
        ]
        
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required columns: {', '.join(missing_columns)}"
            )
        
        teams_processed = 0
        teams_saved = 0
        errors = []
        
        # Process each row
        for index, row in df.iterrows():
            try:
                teams_processed += 1
                
                # Generate unique team ID
                team_id = f"TEAM_{uuid.uuid4().hex[:8].upper()}"
                
                # Create team leader object
                team_leader = {
                    "name": str(row['Team Leader Name']).strip(),
                    "roll_no": str(row['Team Leader Roll No']).strip(),
                    "email": str(row['Team Leader Email']).strip(),
                    "contact": str(row['Team Leader Contact']).strip(),
                    "role": "Team Leader"
                }
                
                # Create team members list
                team_members = []
                
                # Add member 1 if exists
                if pd.notna(row['Member 1 Name']) and str(row['Member 1 Name']).strip():
                    team_members.append({
                        "name": str(row['Member 1 Name']).strip(),
                        "roll_no": str(row['Member 1 Roll No']).strip(),
                        "email": str(row['Member 1 Email']).strip(),
                        "contact": str(row['Member 1 Contact']).strip(),
                        "role": "Member"
                    })
                
                # Add member 2 if exists
                if pd.notna(row['Member 2 Name']) and str(row['Member 2 Name']).strip():
                    team_members.append({
                        "name": str(row['Member 2 Name']).strip(),
                        "roll_no": str(row['Member 2 Roll No']).strip(),
                        "email": str(row['Member 2 Email']).strip(),
                        "contact": str(row['Member 2 Contact']).strip(),
                        "role": "Member"
                    })
                
                # Create problem statement object
                problem_statement = {
                    "ps_id": str(row['Problem Statement ID']).strip(),
                    "title": str(row['Problem Statement Title']).strip(),
                    "description": str(row['Problem Statement Description']).strip(),
                    "category": str(row['Category']).strip(),
                    "difficulty": str(row['Difficulty']).strip(),
                    "domain": str(row['Domain']).strip()
                }
                
                # Create team document
                team_doc = {
                    "team_id": team_id,
                    "team_name": str(row['Team Name']).strip(),
                    "college": str(row['College']).strip(),
                    "department": str(row['Department']).strip(),
                    "year": str(row['Year']).strip(),
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
                else:
                    # Insert new team
                    await db.team_ps_details.insert_one(team_doc)
                
                teams_saved += 1
                
            except Exception as e:
                error_msg = f"Row {index + 2}: {str(e)}"
                errors.append(error_msg)
                continue
        
        return ExcelUploadResponse(
            message="Excel file processed successfully",
            teams_processed=teams_processed,
            teams_saved=teams_saved,
            errors=errors
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@router.get("/teams", response_model=List[dict])
async def get_all_teams_ps_details(
    current_user: dict = Depends(get_current_user)
):
    """
    Get all teams with their problem statement details
    """
    try:
        teams = await db.team_ps_details.find({"status": "active"}).to_list(None)
        
        # Convert ObjectId to string for JSON serialization
        for team in teams:
            team["_id"] = str(team["_id"])
        
        return teams
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching teams: {str(e)}")

@router.get("/teams/{team_id}", response_model=dict)
async def get_team_ps_details(
    team_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get specific team details by team ID
    """
    try:
        team = await db.team_ps_details.find_one({"team_id": team_id})
        if not team:
            raise HTTPException(status_code=404, detail="Team not found")
        
        team["_id"] = str(team["_id"])
        return team
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching team: {str(e)}")

@router.get("/college/{college_name}", response_model=List[dict])
async def get_teams_by_college(
    college_name: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get all teams from a specific college
    """
    try:
        teams = await db.team_ps_details.find({
            "college": {"$regex": college_name, "$options": "i"},
            "status": "active"
        }).to_list(None)
        
        for team in teams:
            team["_id"] = str(team["_id"])
        
        return teams
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching teams: {str(e)}")

@router.get("/category/{category}", response_model=List[dict])
async def get_teams_by_category(
    category: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get all teams in a specific category
    """
    try:
        teams = await db.team_ps_details.find({
            "problem_statement.category": {"$regex": category, "$options": "i"},
            "status": "active"
        }).to_list(None)
        
        for team in teams:
            team["_id"] = str(team["_id"])
        
        return teams
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching teams: {str(e)}")
