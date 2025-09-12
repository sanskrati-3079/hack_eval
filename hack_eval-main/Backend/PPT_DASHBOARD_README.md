# PPT Report Dashboard Integration

This document explains how to use the new PPT Report upload functionality integrated into the admin dashboard.

## 🎯 **What's New**

The admin dashboard now includes a **PPT Report Management** section that allows you to:
- Upload new PPT Report Excel files directly from the web interface
- Automatically update the MongoDB database with new data
- View real-time upload status and progress
- Track when the database was last updated

## 🚀 **Features**

### **Frontend Dashboard**
- **File Upload Interface**: Drag & drop or click to select Excel files
- **Real-time Status**: Shows upload progress and results
- **Last Update Tracking**: Displays when the database was last modified
- **Responsive Design**: Works on desktop and mobile devices

### **Backend API**
- **File Validation**: Ensures only Excel files (.xlsx, .xls) are accepted
- **Data Processing**: Automatically cleans and processes Excel data
- **Database Sync**: Updates MongoDB collection with new data
- **Error Handling**: Comprehensive error messages and validation

## 📁 **File Structure**

```
Backend/
├── routes/
│   └── ppt_upload.py          # New API routes for PPT upload
├── main.py                    # Updated to include PPT upload routes
└── test_ppt_upload_api.py    # Test script for API endpoints

admin portal/src/components/
├── Dashboard.jsx              # Updated dashboard with PPT upload
└── Dashboard.css              # Styling for the new components
```

## 🛠️ **Setup Instructions**

### **1. Backend Setup**

1. **Install Dependencies** (if not already installed):
   ```bash
   cd Backend
   pip install -r requirements_ppt_upload.txt
   ```

2. **Start the Backend Server**:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Verify API Endpoints**:
   - Open: `http://localhost:8000/docs`
   - Look for "PPT Upload" section with endpoints:
     - `POST /api/upload-ppt-report`
     - `GET /api/ppt-report-status`

### **2. Frontend Setup**

1. **Navigate to Admin Portal**:
   ```bash
   cd "admin portal"
   npm install  # If not already done
   npm run dev
   ```

2. **Access Dashboard**:
   - Open: `http://localhost:5173`
   - Navigate to Dashboard component
   - Look for "PPT Report Management" section

## 📖 **How to Use**

### **Step 1: Access the Dashboard**
1. Open your admin portal in the browser
2. Navigate to the Dashboard page
3. Look for the "PPT Report Management" section

### **Step 2: Upload a New File**
1. **Select File**: Click "Choose PPT Report Excel File" or drag & drop
2. **Validate**: Ensure the file is an Excel file (.xlsx or .xls)
3. **Upload**: Click "Update Database" button
4. **Monitor**: Watch the progress indicator and status messages

### **Step 3: View Results**
- **Success**: Green message showing records processed
- **Error**: Red message with specific error details
- **Last Updated**: Timestamp of the most recent upload

## 🔧 **API Endpoints**

### **Upload PPT Report**
```http
POST /api/upload-ppt-report
Content-Type: multipart/form-data

Body: ppt_report (Excel file)
```

**Response (Success)**:
```json
{
  "message": "PPT Report uploaded and database updated successfully",
  "total_records": 70,
  "sheets_processed": ["Reports"],
  "upload_timestamp": "2024-01-01T12:00:00Z"
}
```

### **Get PPT Report Status**
```http
GET /api/ppt-report-status
```

**Response**:
```json
{
  "total_documents": 70,
  "sheet_counts": {"Reports": 70},
  "latest_upload": "2024-01-01T12:00:00Z",
  "database_name": "hackathon_evaluation",
  "collection_name": "ppt_reports"
}
```

## 🧪 **Testing**

### **Test the API**
```bash
cd Backend
python test_ppt_upload_api.py
```

### **Test File Upload**
1. Start the backend server
2. Use the frontend dashboard to upload a file
3. Check MongoDB for updated data

## 📊 **Database Structure**

After upload, each document in the `ppt_reports` collection contains:
```json
{
  "_id": "ObjectId(...)",
  "sheet_name": "Reports",
  "data": {
    "team_name": "Coding Pirates",
    "Problem Understanding": "6",
    "Innovation & Uniqueness": "5",
    "Technical Feasibility": "8",
    // ... other fields
  },
  "upload_timestamp": "2024-01-01T12:00:00Z",
  "record_id": "Reports_0_0"
}
```

## 🔄 **Automatic Updates**

The system automatically:
1. **Clears existing data** from the collection
2. **Processes new Excel file** (all sheets)
3. **Cleans data** (removes NaN values, converts types)
4. **Adds metadata** (timestamp, record ID, sheet name)
5. **Creates indexes** for optimal query performance

## 🚨 **Error Handling**

### **Common Issues & Solutions**

1. **File Type Error**:
   - Ensure file is .xlsx or .xls format
   - Check file extension and content

2. **Database Connection Error**:
   - Verify MongoDB is running
   - Check .env file configuration
   - Ensure network access to MongoDB Atlas

3. **File Processing Error**:
   - Check Excel file integrity
   - Ensure file isn't corrupted
   - Verify file permissions

4. **Upload Size Limits**:
   - Large files may take longer to process
   - Monitor upload progress
   - Check server timeout settings

## 📱 **Mobile Responsiveness**

The dashboard is fully responsive:
- **Desktop**: Full layout with side-by-side elements
- **Tablet**: Stacked layout for medium screens
- **Mobile**: Single-column layout with touch-friendly buttons

## 🔒 **Security Features**

- **File Type Validation**: Only Excel files accepted
- **Input Sanitization**: Data cleaned before database insertion
- **Error Logging**: Comprehensive error tracking
- **Temporary File Handling**: Secure file processing

## 🚀 **Performance Optimizations**

- **Database Indexes**: Automatic index creation
- **Batch Processing**: Efficient data insertion
- **Memory Management**: Temporary file cleanup
- **Connection Pooling**: Optimized MongoDB connections

## 📈 **Monitoring & Analytics**

Track upload performance:
- **Upload Count**: Total files processed
- **Record Count**: Total records in database
- **Processing Time**: Upload duration
- **Success Rate**: Successful vs failed uploads

## 🔮 **Future Enhancements**

Potential improvements:
- **Bulk Upload**: Multiple files at once
- **Scheduled Updates**: Automatic file processing
- **Data Validation**: Enhanced Excel validation rules
- **Backup & Restore**: Data backup functionality
- **Audit Trail**: Detailed upload history

## 📞 **Support**

If you encounter issues:
1. Check the error messages in the dashboard
2. Verify backend server is running
3. Check MongoDB connection
4. Review the console logs
5. Test with the API test script

## 🎉 **Success Indicators**

Your PPT upload is working when you see:
- ✅ Green success message
- 📊 Record count displayed
- 🕒 Last updated timestamp
- 🔄 Database connection established
- 📁 File processed successfully

