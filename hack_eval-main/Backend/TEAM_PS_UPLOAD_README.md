# Team & Problem Statement Details Upload System

This system allows you to upload Excel files containing team and problem statement details directly to MongoDB.

## Features

- **Excel Upload**: Upload `.xlsx` or `.xls` files with team details
- **Data Validation**: Automatic validation of required columns and data format
- **MongoDB Integration**: Direct storage in `team_ps_details` collection
- **Duplicate Handling**: Updates existing teams or creates new ones
- **Error Reporting**: Detailed error messages for failed uploads
- **Unique Team IDs**: Automatic generation of unique team identifiers

## Required Excel Columns

Your Excel file must contain the following columns (exact names required):

### Team Information
- `Team Name` - Name of the team
- `College` - College/University name
- `Department` - Department/Branch
- `Year` - Academic year

### Team Leader Details
- `Team Leader Name` - Name of the team leader
- `Team Leader Roll No` - University roll number
- `Team Leader Email` - Email address
- `Team Leader Contact` - Contact number

### Team Member 1 Details
- `Member 1 Name` - Name of first team member
- `Member 1 Roll No` - University roll number
- `Member 1 Email` - Email address
- `Member 1 Contact` - Contact number

### Team Member 2 Details
- `Member 2 Name` - Name of second team member
- `Member 2 Roll No` - University roll number
- `Member 2 Email` - Email address
- `Member 2 Contact` - Contact number

### Problem Statement Details
- `Problem Statement ID` - Unique problem statement identifier
- `Problem Statement Title` - Title of the problem
- `Problem Statement Description` - Detailed description
- `Category` - Problem category
- `Difficulty` - Difficulty level
- `Domain` - Domain/field

## API Endpoints

### Upload Excel File
```
POST /team-ps/upload-excel
```
Uploads Excel file and processes team data.

**Request**: Multipart form data with Excel file
**Response**: JSON with upload status and statistics

### Get All Teams
```
GET /team-ps/teams
```
Retrieves all teams with their problem statement details.

### Get Specific Team
```
GET /team-ps/teams/{team_id}
```
Retrieves details for a specific team by ID.

### Get Teams by College
```
GET /team-ps/college/{college_name}
```
Retrieves all teams from a specific college.

### Get Teams by Category
```
GET /team-ps/category/{category}
```
Retrieves all teams in a specific category.

## Database Schema

The data is stored in the `team_ps_details` collection with the following structure:

```json
{
  "team_id": "TEAM_ABC12345",
  "team_name": "Team Name",
  "college": "College Name",
  "department": "Department",
  "year": "3rd Year",
  "team_leader": {
    "name": "Leader Name",
    "roll_no": "ROLL001",
    "email": "leader@email.com",
    "contact": "1234567890",
    "role": "Team Leader"
  },
  "team_members": [
    {
      "name": "Member Name",
      "roll_no": "ROLL002",
      "email": "member@email.com",
      "contact": "1234567891",
      "role": "Member"
    }
  ],
  "problem_statement": {
    "ps_id": "PS001",
    "title": "Problem Title",
    "description": "Problem Description",
    "category": "Technology",
    "difficulty": "Medium",
    "domain": "Software Development"
  },
  "mentor": null,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "status": "active"
}
```

## Setup Instructions

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Environment Variables
Create a `.env` file with:
```
MONGO_USER=your_mongodb_username
MONGO_PASS=your_mongodb_password
MONGO_CLUSTER=your_mongodb_cluster
MONGO_DB=your_database_name
```

### 3. Create Collection
Run the setup script:
```bash
python create_team_ps_collection.py
```

### 4. Start Backend
```bash
uvicorn main:app --reload
```

## Frontend Integration

The system includes a React component (`TeamPSUpload.jsx`) that provides:

- Drag & drop file upload
- Excel data preview
- Real-time validation
- Upload progress tracking
- Success/error reporting

## Usage Example

1. **Prepare Excel File**: Ensure all required columns are present
2. **Upload File**: Use the frontend component or API endpoint
3. **Monitor Progress**: Check upload status and any errors
4. **Verify Data**: Use GET endpoints to confirm data was saved

## Error Handling

The system provides detailed error messages for:
- Missing required columns
- Invalid file formats
- Database connection issues
- Data processing errors

## Security Features

- Authentication required for all endpoints
- File type validation (.xlsx/.xls only)
- Input sanitization and validation
- MongoDB injection protection

## Troubleshooting

### Common Issues

1. **Missing Columns**: Ensure all required columns exist with exact names
2. **File Format**: Only Excel files (.xlsx/.xls) are supported
3. **Database Connection**: Check MongoDB connection settings
4. **Authentication**: Ensure valid authentication token

### Debug Mode

Enable debug logging by setting environment variable:
```
DEBUG=true
```

## Support

For issues or questions, check:
1. Backend logs for error details
2. MongoDB connection status
3. Excel file format and column names
4. Authentication token validity
