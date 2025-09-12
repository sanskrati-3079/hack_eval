from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Dict, Any
from datetime import datetime
import pandas as pd
import io

from db.mongo import db
from Schema.user_schema import LeaderboardEntry, PPTReportEntry, ExcelUploadResponse
from Schema.excel_schema import PPTScoreEntry, PPTScoreUpload

# First, define the router
router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

@router.get("/overall", response_model=List[LeaderboardEntry])
async def get_overall_leaderboard():
    """
    Get the overall leaderboard sorted by total score.
    (Replaces GET /overall from leaderboard.js)
    """
    # In a real scenario, team data would be in a 'teams' collection
    teams_cursor = db.teams.find({"isActive": True}).sort("totalScore", -1).limit(50)
    teams = await teams_cursor.to_list(None)

    leaderboard = []
    for i, team in enumerate(teams):
        leaderboard.append(
            LeaderboardEntry(
                rank=i + 1,
                team_id=team.get("team_id"),
                team_name=team.get("team_name"),
                category=team.get("category"),
                total_score=team.get("totalScore", 0)
            )
        )
    return leaderboard

@router.get("/stats", response_model=Dict[str, Any])
async def get_leaderboard_stats():
    """
    Get aggregate statistics for the leaderboard.
    (Replaces GET /stats from leaderboard.js)
    """
    pipeline = [
        {"$match": {"isActive": True}},
        {"$group": {
            "_id": None,
            "totalTeams": {"$sum": 1},
            "averageScore": {"$avg": "$totalScore"},
            "highestScore": {"$max": "$totalScore"},
            "lowestScore": {"$min": "$totalScore"}
        }}
    ]
    stats_result = await db.teams.aggregate(pipeline).to_list(1)

    if not stats_result:
        return {
            "totalTeams": 0, "averageScore": 0, "highestScore": 0, "lowestScore": 0
        }

    return stats_result[0]

@router.get("/ppt", response_model=List[Dict[str, Any]])
async def get_ppt_leaderboard(limit: int = 100):
    """
    Leaderboard based on PPT report marks stored in `ppt_scores` collection.
    Returns data sorted by the original rank from the uploaded Excel file.
    """
    # Get all PPT score entries and sort them by the weighted_total field if rank isn't available
    pipeline = [
        {"$sort": {"rank": 1}},  # Sort by rank if it exists
        {"$limit": limit}
    ]

    scores = await db.ppt_scores.aggregate(pipeline).to_list(None)

    # Format for leaderboard response
    results = []
    for i, score in enumerate(scores, 1):
        # Use the rank from the Excel file if available, otherwise use the index
        rank = score.get("rank", i)

        results.append({
            "rank": rank,
            "team_name": score.get("team_name", "Unknown Team"),
            "total_score": round(score.get("weighted_total", 0), 2),
            "category": score.get("category", "N/A"),
            "innovation_uniqueness": score.get("innovation_uniqueness", 0),
            "technical_feasibility": score.get("technical_feasibility", 0),
            "potential_impact": score.get("potential_impact", 0),
            "file_name": score.get("file_name", "")
        })

    # Sort results by the rank field to ensure correct order
    results.sort(key=lambda x: x["rank"])
    return results

@router.post("/upload-ppt-scores", response_model=ExcelUploadResponse)
async def upload_ppt_scores(file: UploadFile = File(...)):
    """
    Upload PPT scores from an Excel file.
    Preserves the rank information from the Excel file.
    """
    if not file.filename.endswith(('.xls', '.xlsx')):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload an Excel file.")

    try:
        # Clear existing data (optional - only if you want to replace all existing records)
        await db.ppt_scores.delete_many({})

        # Read the Excel file
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))

        # Process and validate the data
        entries = []
        for _, row in df.iterrows():
            try:


                # Use the PPTReportEntry schema for validation plus add rank
                entry = {
                    "rank": str(row.get("Rank", "")),  # Store the rank from Excel
                    "team_name": str(row.get("Team Name", "")),
                    "weighted_total": float(row.get("Weighted Total", 0)),
                    "innovation_uniqueness": float(row.get("Innovation & Uniqueness", 0)),
                    "technical_feasibility": float(row.get("Technical Feasibility", 0)),
                    "potential_impact": float(row.get("Potential Impact", 0)),
                    "file_name": str(row.get("File Name", ""))
                }
                entries.append(entry)
            except Exception as e:
                # Skip invalid rows but continue processing
                continue

        # Insert into MongoDB - using ppt_scores collection
        if entries:
            # Add timestamp to each entry
            for entry in entries:
                entry["uploaded_at"] = datetime.now()
                # Assign a category if missing (for UI display)
                if "category" not in entry or not entry["category"]:
                    entry["category"] = "N/A"

            result = await db.ppt_scores.insert_many(entries)

            return ExcelUploadResponse(
                success=True,
                message=f"Successfully uploaded {len(result.inserted_ids)} PPT score entries",
                records_uploaded=len(result.inserted_ids),
                data=[{"team_name": entry["team_name"], "rank": entry["rank"]} for entry in entries[:5]]  # Preview with ranks
            )
        else:
            return ExcelUploadResponse(
                success=False,
                message="No valid entries found in the Excel file",
                records_uploaded=0
            )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process Excel file: {str(e)}"
        )
