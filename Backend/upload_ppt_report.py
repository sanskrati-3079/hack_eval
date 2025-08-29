import pandas as pd
import pymongo
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import json
from datetime import datetime
import sys

# Load environment variables
load_dotenv()

class PPTReportUploader:
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
        """Establish connection to MongoDB"""
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
    
    def read_excel_file(self, file_path):
        """Read the PPT Report Excel file"""
        try:
            print(f"📖 Reading Excel file: {file_path}")
            
            # Read all sheets from the Excel file
            excel_file = pd.ExcelFile(file_path)
            print(f"📊 Found {len(excel_file.sheet_names)} sheets: {excel_file.sheet_names}")
            
            all_data = {}
            
            for sheet_name in excel_file.sheet_names:
                print(f"📋 Processing sheet: {sheet_name}")
                
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
                print(f"   ✅ Processed {len(cleaned_records)} records from {sheet_name}")
            
            return all_data
            
        except Exception as e:
            print(f"❌ Error reading Excel file: {e}")
            return None
    
    def create_collection_indexes(self):
        """Create indexes for better query performance"""
        try:
            # Create indexes based on common query patterns
            self.collection.create_index([("sheet_name", 1)])
            self.collection.create_index([("upload_timestamp", -1)])
            print("✅ Collection indexes created successfully")
        except Exception as e:
            print(f"⚠️ Warning: Could not create indexes: {e}")
    
    def upload_to_mongodb(self, data):
        """Upload the data to MongoDB"""
        try:
            if self.collection is None:
                print("❌ MongoDB collection not initialized")
                return False
            
            # Clear existing data (optional - comment out if you want to keep existing data)
            # self.collection.delete_many({})
            # print("🗑️ Cleared existing data from collection")
            
            upload_count = 0
            total_records = 0
            
            for sheet_name, records in data.items():
                print(f"📤 Uploading {len(records)} records from sheet: {sheet_name}")
                
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
                
                print(f"   ✅ Uploaded {len(records)} records from {sheet_name}")
            
            print(f"🎉 Total upload completed: {upload_count} documents uploaded")
            return True
            
        except Exception as e:
            print(f"❌ Error uploading to MongoDB: {e}")
            return False
    
    def get_collection_stats(self):
        """Get statistics about the uploaded collection"""
        try:
            total_documents = self.collection.count_documents({})
            sheet_counts = {}
            
            # Count documents by sheet name
            pipeline = [
                {"$group": {"_id": "$sheet_name", "count": {"$sum": 1}}}
            ]
            
            for doc in self.collection.aggregate(pipeline):
                sheet_counts[doc["_id"]] = doc["count"]
            
            print("\n📊 Collection Statistics:")
            print(f"Total documents: {total_documents}")
            print("Documents by sheet:")
            for sheet, count in sheet_counts.items():
                print(f"  {sheet}: {count} documents")
            
            return {
                "total_documents": total_documents,
                "sheet_counts": sheet_counts
            }
            
        except Exception as e:
            print(f"❌ Error getting collection stats: {e}")
            return None
    
    def close_connection(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            print("✅ MongoDB connection closed")
    
    def run_upload(self, excel_file_path):
        """Main method to run the complete upload process"""
        try:
            print("🚀 Starting PPT Report upload process...")
            print("=" * 50)
            
            # Step 1: Connect to MongoDB
            if not self.connect_to_mongodb():
                return False
            
            # Step 2: Read Excel file
            data = self.read_excel_file(excel_file_path)
            if not data:
                return False
            
            # Step 3: Create indexes
            self.create_collection_indexes()
            
            # Step 4: Upload to MongoDB
            if not self.upload_to_mongodb(data):
                return False
            
            # Step 5: Get statistics
            self.get_collection_stats()
            
            print("=" * 50)
            print("🎉 PPT Report upload completed successfully!")
            return True
            
        except Exception as e:
            print(f"❌ Unexpected error during upload: {e}")
            return False
        finally:
            self.close_connection()

def main():
    """Main function to run the script"""
    # Excel file path
    excel_file_path = "PPt_Report.xlsx"
    
    # Check if file exists
    if not os.path.exists(excel_file_path):
        print(f"❌ Excel file not found: {excel_file_path}")
        print("Please make sure the file is in the same directory as this script")
        return
    
    # Create uploader instance and run
    uploader = PPTReportUploader()
    success = uploader.run_upload(excel_file_path)
    
    if success:
        print("\n✅ Script completed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Script failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
