from fastapi import FastAPI
from auth.auth_routes import router as auth_router
from routes.upload_excel import router as upload_router

app = FastAPI(title="Hackathon Evaluation Backend")

@app.get("/")
async def root():
    return {"message": "Hackathon Evaluation Backend is running!"}

app.include_router(auth_router, prefix="/auth", tags=["Team Auth"])
app.include_router(upload_router, prefix="/routes", tags=["Excel Upload"])