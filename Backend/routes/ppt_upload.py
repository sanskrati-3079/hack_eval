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

# Load environment variables
load_dotenv()

router = APIRouter(prefix="/api", tags=["PPT Upload"])

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
            tried_atlas = False
            # Try Atlas if credentials are provided
            if self.mongo_user and self.mongo_pass and self.mongo_cluster:
                tried_atlas = True
                try:
                    from urllib.parse import quote_plus
                    encoded_user = quote_plus(self.mongo_user)
                    encoded_pass = quote_plus(self.mongo_pass)
                    uri = (
                        f"mongodb+srv://{encoded_user}:{encoded_pass}@{self.mongo_cluster}/"
                        f"{self.mongo_db}?retryWrites=true&w=majority"
                    )
                    self.client = MongoClient(uri)
                    self.db = self.client[self.mongo_db]
                    self.collection = self.db[self.collection_name]
                    self.client.admin.command('ping')
                    return True
                except Exception as atlas_error:
                    print(f"Atlas connection failed ({atlas_error}). Falling back to local MongoDB...")
                    # Explicitly fall through to local
            # Try local MongoDB
            self.client = MongoClient("mongodb://localhost:27017/")
            self.db = self.client[self.mongo_db]
            self.collection = self.db[self.collection_name]
            self.client.admin.command('ping')
            if tried_atlas:
                print("Connected to local MongoDB after Atlas failure.")
            return True
        except Exception as e:
            print(f"MongoDB connection failed: {e}")
            return False
    
    def process_excel_file(self, file_path: str):
        """Process the uploaded Excel file"""
        excel_file = None
        try:
            # Read all sheets from the Excel file
            excel_file = pd.ExcelFile(file_path)
            all_data = {}
            for sheet_name in excel_file.sheet_names:
                # Read the sheet
                df = pd.read_excel(file_path, sheet_name=sheet_name)
                # Convert DataFrame to records (list of dictionaries)
                records = df.to_dict('records')
                # Clean the data - remove NaN values and convert to proper types
                cleaned_records = []
                for record in records:
                    cleaned_record = {}
                    for key, value in record.items():
                        if pd.isna(value):
                            cleaned_record[key] = None
                        elif isinstance(value, (int, float)):
                            cleaned_record[key] = value
                        else:
                            cleaned_record[key] = str(value).strip() if value else None
                    cleaned_records.append(cleaned_record)
                all_data[sheet_name] = cleaned_records
            return all_data
        except Exception as e:
            print(f"Error processing Excel file: {e}")
            return None
        finally:
            # Ensure the Excel file handle is closed so Windows can delete the temp file
            try:
                if excel_file is not None:
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
            
            # Close database connection
            handler.close_connection()
            
            # Clean up temporary file
            os.unlink(temp_file_path)
            
            return JSONResponse(
                status_code=200,
                content={
                    "message": "PPT Report uploaded and database updated successfully",
                    "total_records": total_records,
                    "sheets_processed": list(data.keys()),
                    "upload_timestamp": datetime.utcnow().isoformat()
                }
            )
            
        except Exception as e:
            # Clean up temporary file on error
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
            raise e
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Internal server error occurred while processing the file"
        )

@router.get("/ppt-report-status")
async def get_ppt_report_status():
    """
    Get the current status of PPT reports in the database
    """
    try:
        # Initialize PPT handler
        handler = PPTReportHandler()
        
        # Connect to MongoDB
        if not handler.connect_to_mongodb():
            raise HTTPException(
                status_code=500, 
                detail="Failed to connect to database"
            )
        
        try:
            # Get collection statistics
            total_documents = handler.collection.count_documents({})
            sheet_counts = {}
            
            # Count documents by sheet name
            pipeline = [
                {"$group": {"_id": "$sheet_name", "count": {"$sum": 1}}}
            ]
            
            for doc in handler.collection.aggregate(pipeline):
                sheet_counts[doc["_id"]] = doc["count"]
            
            # Get latest upload timestamp
            latest_doc = handler.collection.find_one(
                sort=[("upload_timestamp", -1)]
            )
            
            latest_timestamp = latest_doc["upload_timestamp"] if latest_doc else None
            
            return JSONResponse(
                status_code=200,
                content={
                    "total_documents": total_documents,
                    "sheet_counts": sheet_counts,
                    "latest_upload": latest_timestamp.isoformat() if latest_timestamp else None,
                    "database_name": handler.mongo_db,
                    "collection_name": handler.collection_name
                }
            )
            
        finally:
            handler.close_connection()
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Internal server error occurred while fetching status"
        )

