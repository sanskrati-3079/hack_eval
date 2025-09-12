# PPT Report Excel Upload Script

This script extracts data from `PPt_Report.xlsx` and uploads it to MongoDB with a new collection called `ppt_reports`.

## Features

- ✅ Reads all sheets from the Excel file
- ✅ Cleans and processes data (removes NaN values, converts types)
- ✅ Creates MongoDB collection with proper indexing
- ✅ Adds metadata (sheet name, upload timestamp, record ID)
- ✅ Provides detailed progress and statistics
- ✅ Supports both MongoDB Atlas (cloud) and local MongoDB

## Prerequisites

1. **Python 3.7+** installed
2. **MongoDB** running (local or Atlas)
3. **PPt_Report.xlsx** file in the same directory

## Installation

1. **Install dependencies:**
   ```bash
   pip install -r requirements_ppt_upload.txt
   ```

2. **Set up MongoDB connection:**
   
   **Option A: MongoDB Atlas (Cloud)**
   Create a `.env` file in the Backend directory with:
   ```
   MONGO_USER=your_mongodb_username
   MONGO_PASS=your_mongodb_password
   MONGO_CLUSTER=your_cluster_name.xxxxx.mongodb.net
   MONGO_DB=hackathon_evaluation
   ```
   
   **Option B: Local MongoDB**
   Leave the .env file empty or don't create it. The script will use `localhost:27017`.

## Usage

1. **Navigate to the Backend directory:**
   ```bash
   cd Backend
   ```

2. **Run the script:**
   ```bash
   python upload_ppt_report.py
   ```

## What the Script Does

1. **Connects to MongoDB** using environment variables or local connection
2. **Reads the Excel file** and processes all sheets
3. **Cleans the data** by removing NaN values and converting types
4. **Creates indexes** for better query performance
5. **Uploads data** to MongoDB with metadata
6. **Provides statistics** about the uploaded collection

## Output Structure

Each document in the `ppt_reports` collection has this structure:
```json
{
  "_id": "ObjectId(...)",
  "sheet_name": "Sheet1",
  "data": {
    "Column1": "Value1",
    "Column2": "Value2",
    ...
  },
  "upload_timestamp": "2024-01-01T12:00:00Z",
  "record_id": "Sheet1_0_0"
}
```

## Collection Details

- **Collection Name:** `ppt_reports`
- **Indexes Created:**
  - `sheet_name` (ascending)
  - `upload_timestamp` (descending)

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Failed:**
   - Check if MongoDB is running
   - Verify connection credentials in .env file
   - Ensure network access to MongoDB Atlas

2. **Excel File Not Found:**
   - Make sure `PPt_Report.xlsx` is in the same directory as the script
   - Check file permissions

3. **Missing Dependencies:**
   - Run: `pip install -r requirements_ppt_upload.txt`

4. **Permission Errors:**
   - Ensure you have write access to the MongoDB database

### Error Messages:

- ❌ MongoDB connection failed: Check connection settings
- ❌ Excel file not found: Verify file path
- ❌ Error reading Excel file: Check file format and permissions
- ❌ Error uploading to MongoDB: Check database permissions

## Example Output

```
🚀 Starting PPT Report upload process...
==================================================
✅ MongoDB connected successfully
📖 Reading Excel file: PPt_Report.xlsx
📊 Found 3 sheets: ['Sheet1', 'Sheet2', 'Sheet3']
📋 Processing sheet: Sheet1
   ✅ Processed 25 records from Sheet1
📋 Processing sheet: Sheet2
   ✅ Processed 15 records from Sheet2
📋 Processing sheet: Sheet3
   ✅ Processed 30 records from Sheet3
✅ Collection indexes created successfully
📤 Uploading 25 records from sheet: Sheet1
   ✅ Uploaded 25 records from Sheet1
📤 Uploading 15 records from sheet: Sheet2
   ✅ Uploaded 15 records from Sheet2
📤 Uploading 30 records from sheet: Sheet3
   ✅ Uploaded 30 records from Sheet3
🎉 Total upload completed: 70 documents uploaded

📊 Collection Statistics:
Total documents: 70
Documents by sheet:
  Sheet1: 25 documents
  Sheet2: 15 documents
  Sheet3: 30 documents
==================================================
🎉 PPT Report upload completed successfully!
✅ Script completed successfully!
```

## Data Query Examples

After upload, you can query the data:

```python
# Get all documents from a specific sheet
from pymongo import MongoClient

client = MongoClient("your_connection_string")
db = client.hackathon_evaluation
collection = db.ppt_reports

# Find all records from Sheet1
sheet1_data = collection.find({"sheet_name": "Sheet1"})

# Find recent uploads
recent_data = collection.find().sort("upload_timestamp", -1).limit(10)

# Get unique sheet names
sheets = collection.distinct("sheet_name")
```

## Support

If you encounter issues:
1. Check the error messages above
2. Verify MongoDB connection settings
3. Ensure all dependencies are installed
4. Check file permissions and paths

