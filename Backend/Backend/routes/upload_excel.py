from fastapi import UploadFile, File, APIRouter
from pymongo import MongoClient
from fastapi.responses import StreamingResponse
import io
import pandas as pd
from io import BytesIO
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

credentials_store = []

@router.post("/upload_excel/")
async def upload_excel(file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_excel(BytesIO(contents), sheet_name="Sheet1")
    global credentials_store  
    credentials_store.clear()

    inserted_teams = []

    for index, row in df.iterrows():
        team_id = generate_team_id(index)
        password = generate_password()
        password_hash = hash_password(password)

        team_data = {
            "team_id": team_id,
            "problem_statement_id": row["Problem Statement Id"],
            "team_name": row["Team Name"],
            "team_leader": {
                "name": row["Team Leader Name"],
                "email": row["Leader Email"],
                "contact": row["Leader Contact Number"]
            },
            "members": [
                row["Team Member 1 Name"],
                row["Team Member 2 Name"],
                row["Team Member 3 Name"],
                row["Team Member 4 Name"],
                row["Team Member 5 Name"]
            ],
            "ppt_drive_link": row["PPT Drive Link"],
            "category": row["Category"],
            "subcategory": row["Subcategory"]
        }

        # Insert into MongoDB
        teams_collection.insert_one(team_data)

        logins_collection.insert_one({
            "team_id": team_id,
            "email": row["Leader Email"],
            "password": password_hash  
        })

        credentials_store.append({
        "team_id": team_id,
        "email": row["Leader Email"],
        "password": password
        })

        send_email(to_email=row["Leader Email"], team_id=team_id, password=password)

        inserted_teams.append(team_data)

    return {"message": f"{len(inserted_teams)} teams uploaded successfully"}

@router.get("/export_credentials/")
async def export_credentials():
    if not credentials_store:
        return {"error": "No credentials available. Upload teams first."}
    
    df = pd.DataFrame(credentials_store)
    stream = io.BytesIO()
    with pd.ExcelWriter(stream, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name="Team Credentials")
    stream.seek(0)
    return StreamingResponse(stream, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={
        "Content-Disposition": "attachment; filename=team_credentials.xlsx"
    })
