from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth.auth_routes import router as auth_router
from routes.upload_excel import router as upload_router
from routes.admin import router as admin_router  # Unified admin router
from routes.judge import router as judge_router
from routes.user import router as user_router


from datetime import datetime
from Schema import admin
from utils import helper



app = FastAPI(
    title="Hackathon Evaluation Backend",
    description="Backend API for GLA University Hackathon Evaluation System",
    version="1.0.0"
)

origin=[
    "http://localhost:3000"
]

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origin,  # Explicitly allow your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with proper prefixes and tags
app.include_router(auth_router, prefix="/auth", tags=["Team Auth"])
app.include_router(upload_router, prefix="/routes", tags=["Excel Upload"])
app.include_router(admin_router, prefix="/admin", tags=["Admin"])
app.include_router(judge_router, prefix="/judge", tags=["Judge"])
app.include_router(user_router, prefix="/user", tags=["User / Teams"])

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
