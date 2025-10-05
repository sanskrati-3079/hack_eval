from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth.auth_routes import router as auth_router
from routes.upload_excel import router as upload_router
from routes.admin import router as admin_router
from routes.judge import router as judge_router
from routes.judge_eval import router as judge_eval_router
from routes.user import router as user_router
from routes.leaderboard import router as leaderboard_router
from routes.team_ps_upload import router as team_ps_router
from routes.round_state import router as round_state_router
from routes.ppt_upload import router as ppt_upload_router
from datetime import datetime
from contextlib import asynccontextmanager
from db.mongo import connect_to_mongo, close_mongo_connection, get_database_async

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    success = await connect_to_mongo()
    if success:
        print("✅ Database connection established during startup")
    else:
        print("⚠️ Database connection failed during startup")
    
    yield
    
    # Shutdown
    await close_mongo_connection()
    print("✅ MongoDB connection closed during shutdown")

app = FastAPI(
    title="Hackathon Evaluation Backend",
    description="Backend API for GLA University Hackathon Evaluation System",
    version="1.0.0",
    lifespan=lifespan
)

origin = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:5173",
    "http://localhost:5174"
]

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origin,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, tags=["Team Auth"])
app.include_router(upload_router, prefix="/routes", tags=["Excel Upload"])
app.include_router(admin_router, prefix="/admin", tags=["Admin"])
app.include_router(judge_router, prefix="/judge", tags=["Judge"])
app.include_router(judge_eval_router, prefix="/judge/evaluation", tags=["Judge Evaluation"])
app.include_router(user_router, prefix="/user", tags=["User / Teams"])
app.include_router(team_ps_router, prefix="/team-ps", tags=["Team and Problem Statement Details"])
app.include_router(ppt_upload_router, tags=["PPT Upload"])
app.include_router(leaderboard_router)
app.include_router(round_state_router)

@app.get("/")
async def root():
    return {
        "message": "Hackathon Evaluation Backend is running!",
        "version": "1.0.0",
        "docs_url": "/docs",
        "swagger_ui_url": "/docs",
        "redoc_url": "/redoc",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/test-db")
async def test_database():
    """Test database connection"""
    try:
        db = await get_database_async()
        if db is None:
            return {
                "status": "error",
                "message": "Database connection not available",
                "database": "disconnected"
            }
            
        judge_count = await db.judges.count_documents({})
        return {
            "status": "success",
            "message": "Database connection working",
            "judge_count": judge_count,
            "database": "connected"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Database test failed: {str(e)}",
            "database": "error"
        }

@app.get("/test-db-connection")
async def test_db_connection():
    """Test database connection"""
    try:
        db = await get_database_async()
        if db is None:
            return {"status": "error", "message": "Database connection failed"}
        
        # Test by counting documents in rounds collection
        count = await db.rounds.count_documents({})
        return {
            "status": "success", 
            "message": "Database connection working",
            "rounds_count": count
        }
    except Exception as e:
        return {"status": "error", "message": f"Database test failed: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)