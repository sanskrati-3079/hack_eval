from fastapi import APIRouter, Depends
from typing import List

from db.mongo import db
from auth.auth_routes import get_current_user
from Schema.user_schema import Notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[Notification])
async def get_team_notifications(current_user=Depends(get_current_user)):
    """
    Get all notifications for the currently logged-in team.
    (Replaces GET /team/:teamId from notifications.js and existing /notifications)
    """
    team_id = current_user["team_id"]
    notifications = await db.notifications.find({"team_id": team_id}).sort("timestamp", -1).to_list(None)
    return notifications
