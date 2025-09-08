from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import pandas as pd
import pymongo
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime
import tempfile
import shutil
import asyncio

# Load environment variables
load_dotenv()

router = APIRouter(prefix="/api", tags=["PPT Upload"])

# Evaluation parameters with weights (consistent across all uploads)
EVALUATION_PARAMETERS = {
    'Problem': 'Problem Understanding',
    'Innovation': 'Innovation & Uniqueness', 
    'Technical': 'Technical Feasibility',
    'Implement': 'Implementation Approach',
    'Team': 'Team Readiness',
    # 'Res': 'Research Depth',
    'Potential': 'Potential Impact',
    'Format & Design': 'Format & Design'
}

# Weights for each parameter (total = 100)
EVALUATION_WEIGHTS = {
    'Problem': 15,      # 15%
    'Innovation': 20,   # 20%
    'Technical': 20,    # 20%
    'Implement': 15,    # 15%
    'Team': 10,         # 10%
    'Res': 10,          # 10%
    'Potential': 5,     # 5%
    'Format &': 5       # 5%
}

class PPTReportHandler:
    def __init__(self):
        """Initialize MongoDB connection"""
        self.client = None
        self.db = None
        self.collection = None
        
        # MongoDB connection parameters
        self.mongo_user = os.getenv("MONGO_USER")
        self.mongo_pass = os.getenv("MONGO_PASS")
        self.mongo_cluster = os.getenv("MONGO_CLUSTER")
        self.mongo_db = os.getenv("MONGO_DB", "hackathon_evaluation")
        
        # Collection name for PPT reports
        self.collection_name = "ppt_reports"
    
    def connect_to_mongodb(self):
        """Establish connection to MongoDB with Atlas→local fallback"""
        try:
            if self.mongo_user and self.mongo_pass and self.mongo_cluster:
                # MongoDB Atlas connection with proper URL encoding
                from urllib.parse import quote_plus
                encoded_user = quote_plus(self.mongo_user)
                encoded_pass = quote_plus(self.mongo_pass)
                uri = f"mongodb+srv://{encoded_user}:{encoded_pass}@{self.mongo_cluster}/{self.mongo_db}?retryWrites=true&w=majority"
                self.client = MongoClient(uri)
            else:
                # Local MongoDB connection
                self.client = MongoClient("mongodb://localhost:27017/")
            
            self.db = self.client[self.mongo_db]
            self.collection = self.db[self.collection_name]
            
            # Test connection
            self.client.admin.command('ping')
            print("✅ MongoDB connected successfully")
            return True
            
        except Exception as e:
            print(f"❌ MongoDB connection failed: {e}")
            return False

    def process_excel_file(self, file_path: str):
        """Process the Excel file and extract data from all sheets"""
        try:
            # Read all sheets from the Excel file
            excel_file = pd.ExcelFile(file_path)
            data = {}
            
            for sheet_name in excel_file.sheet_names:
                print(f"Processing sheet: {sheet_name}")
                
                # Read the sheet
                df = pd.read_excel(file_path, sheet_name=sheet_name)
                
                # Clean the data
                df = df.fillna('')  # Replace NaN with empty string
                
                # Convert to list of dictionaries
                records = df.to_dict('records')
                
                # Clean each record
                cleaned_records = []
                for record in records:
                    cleaned_record = {}
                    for key, value in record.items():
                        # Convert numeric values to float if possible
                        if pd.notna(value) and str(value).strip():
                            try:
                                if isinstance(value, (int, float)):
                                    cleaned_record[str(key)] = float(value)
                                else:
                                    cleaned_record[str(key)] = str(value).strip()
                            except:
                                cleaned_record[str(key)] = str(value).strip()
                        else:
                            cleaned_record[str(key)] = ''
                    cleaned_records.append(cleaned_record)
                
                data[sheet_name] = cleaned_records
                print(f"Processed {len(cleaned_records)} records from {sheet_name}")
            
            return data
            
        except Exception as e:
            print(f"❌ Error processing Excel file: {e}")
            return None
        finally:
            try:
                excel_file.close()
            except Exception:
                pass
    
    def update_database(self, data):
        """Update the MongoDB database with new data"""
        try:
            if self.collection is None:
                print("MongoDB collection not initialized")
                return False
            
            # Clear existing data
            self.collection.delete_many({})
            print("Cleared existing data from collection")
            
            upload_count = 0
            total_records = 0
            
            for sheet_name, records in data.items():
                print(f"Uploading {len(records)} records from sheet: {sheet_name}")
                
                for record in records:
                    # Add metadata to each record
                    document = {
                        "sheet_name": sheet_name,
                        "data": record,
                        "upload_timestamp": datetime.utcnow(),
                        "record_id": f"{sheet_name}_{upload_count}_{total_records}"
                    }
                    
                    # Insert the document
                    result = self.collection.insert_one(document)
                    if result.inserted_id:
                        upload_count += 1
                        total_records += 1
                
                print(f"Uploaded {len(records)} records from {sheet_name}")
            
            print(f"Total upload completed: {upload_count} documents uploaded")
            return True, total_records
            
        except Exception as e:
            print(f"Error uploading to MongoDB: {e}")
            return False, 0

    async def update_leaderboard(self):
        """Update the leaderboard based on the new PPT report data using weighted scoring"""
        try:
            # Get all records from ppt_reports collection
            pipeline = [
                {"$project": {
                    "team_name": {
                        "$ifNull": ["$data.team_name", {"$ifNull": ["$data.Team Name", "Unknown Team"]}]
                    },
                    "data": "$data"
                }},
                {"$project": {
                    "team_name": 1,
                    "problem_score": {"$convert": {"input": "$data.Problem", "to": "double", "onError": 0, "onNull": 0}},
                    "innovation_score": {"$convert": {"input": "$data.Innovation", "to": "double", "onError": 0, "onNull": 0}},
                    "technical_score": {"$convert": {"input": "$data.Technical", "to": "double", "onError": 0, "onNull": 0}},
                    "implement_score": {"$convert": {"input": "$data.Implement", "to": "double", "onError": 0, "onNull": 0}},
                    "team_score": {"$convert": {"input": "$data.Team", "to": "double", "onError": 0, "onNull": 0}},
                    "res_score": {"$convert": {"input": "$data.Res", "to": "double", "onError": 0, "onNull": 0}},
                    "potential_score": {"$convert": {"input": "$data.Potential", "to": "double", "onError": 0, "onNull": 0}},
                    "format_score": {"$convert": {"input": "$data.Format &", "to": "double", "onError": 0, "onNull": 0}}
                }},
                {"$project": {
                    "team_name": 1,
                    "total_weighted": {
                        "$add": [
                            {"$multiply": ["$problem_score", 15]},      # 15% weight
                            {"$multiply": ["$innovation_score", 20]},   # 20% weight
                            {"$multiply": ["$technical_score", 20]},    # 20% weight
                            {"$multiply": ["$implement_score", 15]},    # 15% weight
                            {"$multiply": ["$team_score", 10]},         # 10% weight
                            {"$multiply": ["$res_score", 10]},          # 10% weight
                            {"$multiply": ["$potential_score", 5]},     # 5% weight
                            {"$multiply": ["$format_score", 5]}         # 5% weight
                        ]
                    }
                }},
                {"$group": {
                    "_id": "$team_name",
                    "team_name": {"$first": "$team_name"},
                    "total_weighted": {"$max": "$total_weighted"}
                }},
                {"$sort": {"total_weighted": -1}},
                {"$project": {
                    "_id": 0, 
                    "team_name": 1, 
                    "total_weighted": {"$round": ["$total_weighted", 2]}
                }}
            ]

            results = await self.db.ppt_reports.aggregate(pipeline).to_list(None)

            # Add rank field
            for idx, doc in enumerate(results, start=1):
                doc["rank"] = idx

            # Update leaderboard collection
            leaderboard_collection = self.db["leaderboard"]
            
            # Clear existing leaderboard
            await leaderboard_collection.delete_many({})
            
            # Insert new leaderboard data
            if results:
                await leaderboard_collection.insert_many(results)
                print(f"✅ Leaderboard updated with {len(results)} teams using weighted scoring")
            else:
                print("⚠️ No leaderboard data to update")
            
            return True
            
        except Exception as e:
            print(f"❌ Error updating leaderboard: {e}")
            return False
    
    def close_connection(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()

@router.post("/upload-ppt-report")
async def upload_ppt_report(file: UploadFile = File(...)):
    """
    Upload and process PPT Report Excel file
    """
    try:
        # Validate file type
        if not file.filename.endswith(('.xlsx', '.xls')):
            raise HTTPException(
                status_code=400, 
                detail="Invalid file type. Please upload an Excel file (.xlsx or .xls)"
            )
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as temp_file:
            # Copy uploaded file to temporary file
            shutil.copyfileobj(file.file, temp_file)
            temp_file_path = temp_file.name
        
        try:
            # Initialize PPT handler
            handler = PPTReportHandler()
            
            # Connect to MongoDB
            if not handler.connect_to_mongodb():
                raise HTTPException(
                    status_code=500, 
                    detail="Failed to connect to database"
                )
            
            # Process the Excel file
            data = handler.process_excel_file(temp_file_path)
            if not data:
                raise HTTPException(
                    status_code=500, 
                    detail="Failed to process Excel file"
                )
            
            # Update database
            success, total_records = handler.update_database(data)
            if not success:
                raise HTTPException(
                    status_code=500, 
                    detail="Failed to update database"
                )
            
            # Update leaderboard
            leaderboard_success = await handler.update_leaderboard()
            if not leaderboard_success:
                print("⚠️ Warning: Leaderboard update failed, but data upload was successful")
            
            # Close database connection
            handler.close_connection()
            
            # Clean up temporary file
            os.unlink(temp_file_path)
            
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "message": f"PPT Report uploaded successfully! {total_records} records processed.",
                    "total_records": total_records,
                    "leaderboard_updated": leaderboard_success,
                    "evaluation_parameters": list(EVALUATION_PARAMETERS.keys())
                }
            )
            
        except Exception as e:
            # Clean up temporary file on error
            try:
                os.unlink(temp_file_path)
            except:
                pass
            raise e
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(e)}"
        )

@router.get("/leaderboard")
async def get_leaderboard():
    """
    Get the current leaderboard based on PPT report data
    """
    try:
        handler = PPTReportHandler()
        
        if not handler.connect_to_mongodb():
            raise HTTPException(
                status_code=500,
                detail="Failed to connect to database"
            )
        
        # Get leaderboard from collection
        leaderboard_collection = handler.db["leaderboard"]
        leaderboard = await leaderboard_collection.find({}).sort("rank", 1).to_list(None)
        
        handler.close_connection()
        
        return {
            "success": True,
            "leaderboard": leaderboard,
            "total_teams": len(leaderboard),
            "evaluation_parameters": list(EVALUATION_PARAMETERS.keys())
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch leaderboard: {str(e)}"
        )

@router.get("/evaluation-parameters")
async def get_evaluation_parameters():
    """
    Get the evaluation parameters and weights used in the system
    """
    return {
        "success": True,
        "parameters": EVALUATION_PARAMETERS,
        "weights": EVALUATION_WEIGHTS,
        "description": "These parameters and weights remain consistent across all evaluations"
    }

@router.get("/team-evaluation/{team_name}")
async def get_team_ppt_evaluation(team_name: str):
    """
    Get PPT evaluation data for a specific team by team name
    """
    try:
        handler = PPTReportHandler()
        
        if not handler.connect_to_mongodb():
            raise HTTPException(
                status_code=500,
                detail="Failed to connect to database"
            )
        
        # Find the team's PPT evaluation data
        ppt_data = handler.db["ppt_reports"].find_one({
            "data.team_name": team_name
        })
        
        if not ppt_data:
            raise HTTPException(
                status_code=404,
                detail=f"No PPT evaluation data found for team: {team_name}"
            )
        
        # Extract the evaluation data
        evaluation_data = ppt_data.get("data", {})
        
        # Debug: Print all available fields
        print(f"Available fields for team {team_name}:")
        for key, value in evaluation_data.items():
            print(f"  {key}: {value}")
        
        # Calculate weighted score
        weighted_score = 0
        raw_scores = {}
        
        for param_key, param_name in EVALUATION_PARAMETERS.items():
            score = evaluation_data.get(param_name, 0)
            if isinstance(score, (int, float)):
                raw_scores[param_name] = score
                weight = EVALUATION_WEIGHTS.get(param_key, 0)
                weighted_score += (score * weight / 100)
        
        # Use the original total_weighted from database if available
        original_weighted = evaluation_data.get("total_weighted", 0)
        if original_weighted and isinstance(original_weighted, (int, float)):
            weighted_score = original_weighted
        
        # Prepare response
        response_data = {
            "team_name": team_name,
            "sheet_name": ppt_data.get("sheet_name", "Unknown"),
            "upload_timestamp": ppt_data.get("upload_timestamp", ""),
            "evaluation_scores": raw_scores,
            "total_raw_score": evaluation_data.get("total_raw", 0),
            "total_weighted_score": round(weighted_score, 2),
            "summary": evaluation_data.get("summary", ""),
            "workflow_overall": evaluation_data.get("workflow_overall", ""),
            "feedback_positive": evaluation_data.get("feedback_positive", ""),
            "feedback_criticism": evaluation_data.get("feedback_criticism", ""),
            "feedback_technical": evaluation_data.get("feedback_technical", ""),
            "feedback_suggestions": evaluation_data.get("feedback_suggestions", ""),
            "evaluation_parameters": EVALUATION_PARAMETERS,
            "evaluation_weights": EVALUATION_WEIGHTS
        }
        
        handler.close_connection()
        
        return {
            "success": True,
            "data": response_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch team PPT evaluation: {str(e)}"
        )

