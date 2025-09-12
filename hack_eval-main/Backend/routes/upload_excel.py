from fastapi import UploadFile, File, APIRouter, HTTPException
from pymongo import MongoClient
from fastapi.responses import StreamingResponse, JSONResponse
import io
import pandas as pd
from io import BytesIO
import re # Import regex module
from utils.send_email import send_email
from utils.team_id_generator import generate_team_id
from utils.password_generate import generate_password
from utils.hash_password import hash_password
from core.config import MONGO_URI, MONGO_DB

router = APIRouter()

# MongoDB connection
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
teams_collection = db["teams_meta"]
logins_collection = db["team_login"]

# In-memory store for credentials to be exported.
# Note: This is not suitable for production with multiple server workers.
credentials_store = []

# Regex for GLA University email validation
GLA_EMAIL_REGEX = r"^[a-zA-Z0-9_.-]+@gla\.ac\.in$"

@router.post("/upload_excel/")
async def upload_excel(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        # Use try-except to handle potential errors if sheet_name is different
        try:
            df = pd.read_excel(BytesIO(contents)) # More robust: reads the first sheet by default
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error reading Excel file. Ensure it's a valid .xlsx or .xls file. Error: {e}")

        global credentials_store
        credentials_store.clear()

        inserted_teams = []
        skipped_teams = []

        df.columns = [str(col).strip().lower() for col in df.columns]

        # Now define required columns in lowercase
        required_columns = [
            "select category",
            "team id",
            "team name",
            "team leader name",
            "university roll no",
            "team leader email id (gla email id only)",
            "team leader contact no.",
            "psid",
            "statement"
        ]

        member_columns = [f"team_memeber_{i}" for i in range(1, 6)]


        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns in Excel file: {', '.join(missing_columns)}"
            )

        # --- Define expected column names from your Excel file ---
        COL_CATEGORY = "select category"
        COL_TEAM_NAME = "team name"
        COL_TEAM_ID = "team id"
        COL_LEADER_NAME = "team leader name"
        COL_ROLL_NO = "university roll no"
        COL_LEADER_EMAIL = "team leader email id (gla email id only)"
        COL_LEADER_CONTACT = "team leader contact no."
        COL_PSID = "psid"
        COL_STATEMENT = "statement"
        # Optional columns
        COL_MEMBERS = [f"team member {i} name" for i in range(1, 6)]
        COL_PPT_LINK = "ppt drive link"
        COL_SUBCATEGORY = "subcategory"

        # --- Verify required columns exist in the dataframe ---
        # required_columns = [COL_CATEGORY, COL_TEAM_NAME, COL_LEADER_NAME, COL_LEADER_EMAIL, COL_LEADER_CONTACT]
        # missing_columns = [col for col in required_columns if col not in df.columns]
        # if missing_columns:
        #     raise HTTPException(status_code=400, detail=f"Missing required columns in Excel file: {', '.join(missing_columns)}")


        for index, row in df.iterrows():
            leader_email = str(row.get(COL_LEADER_EMAIL, "")).strip()
            team_name = str(row.get(COL_TEAM_NAME, f"Team at Row {index+2}"))

            # --- Email Validation Step ---
            if not re.match(GLA_EMAIL_REGEX, leader_email):
                skipped_teams.append({
                    "team_name": team_name,
                    "reason": f"Invalid email format: '{leader_email}'"
                })
                continue # Skip to the next row


            password = generate_password()
            password_hash = hash_password(password)

             # Collect members
            members = [str(row.get(col)).strip() for col in member_columns if pd.notna(row.get(col)) and str(row.get(col)).strip()]

            team_data = {
                "team_id": str(row.get(COL_TEAM_ID)),  # Get the actual team ID from the row
                "problem_statement_id": str(row.get(COL_PSID)),  # Get the actual PSID from the row
                "team_name": team_name,
                "team_leader": {
                    "name": str(row.get(COL_LEADER_NAME)),
                    "roll_no": str(row.get(COL_ROLL_NO)),  # Add roll_no to team_leader object
                    "email": leader_email,
                    "contact": str(row.get(COL_LEADER_CONTACT))
                },
                "members": members,
                "category": str(row.get(COL_CATEGORY)),
                "subcategory": str(row.get(COL_SUBCATEGORY)) if COL_SUBCATEGORY in row else None,
                "statement": str(row.get(COL_STATEMENT)),
                "university_roll_no": str(row.get(COL_ROLL_NO))
            }

            # Insert into MongoDB
            teams_collection.insert_one(team_data)
            logins_collection.insert_one({
                "team_id": COL_TEAM_ID,
                "email": leader_email,
                "password": password_hash
            })

            # Store plain text password for export
            credentials_store.append({
                "team_id": str(row.get(COL_TEAM_ID)),
                "team_name": team_name,
                "email": leader_email,
                "password": password
            })

            # Send email with credentials
            send_email(to_email=leader_email, team_id=str(row.get(COL_TEAM_ID)), password=password)
            if send_email(to_email=leader_email, team_id=str(row.get(COL_TEAM_ID)), password=password):
                print(f"Email sent successfully to {leader_email}") 

            inserted_teams.append(team_data)

        # --- Construct detailed response ---
        response_message = f"Processing complete. {len(inserted_teams)} teams uploaded successfully."
        if skipped_teams:
            response_message += f" {len(skipped_teams)} teams were skipped."

        return JSONResponse(status_code=200, content={
            "message": response_message,
            "processed_count": len(inserted_teams),
            "skipped_count": len(skipped_teams),
            "skipped_details": skipped_teams
        })

    except HTTPException as http_exc:
        raise http_exc # Re-raise FastAPI's HTTP exceptions
    except Exception as e:
        # Catch any other unexpected errors during processing
        return JSONResponse(status_code=500, content={"message": f"An unexpected error occurred: {str(e)}"})


@router.get("/export_credentials/")
async def export_credentials():
    if not credentials_store:
        return JSONResponse(status_code=404, content={"error": "No credentials available. Upload an Excel file first."})

    df = pd.DataFrame(credentials_store)
    stream = io.BytesIO()
    with pd.ExcelWriter(stream, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name="Team Credentials")
    stream.seek(0)
    return StreamingResponse(stream, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={
        "Content-Disposition": "attachment; filename=team_credentials.xlsx"
    })
