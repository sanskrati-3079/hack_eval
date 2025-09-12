from fastapi import FastAPI
from db.mongo import connect_to_mongo, close_mongo_connection
# existing router imports...

app = FastAPI()

@app.on_event("startup")
async def _startup():
    ok = await connect_to_mongo()
    if not ok:
        raise RuntimeError("Mongo connection failed")

@app.on_event("shutdown")
async def _shutdown():
    await close_mongo_connection()

app.include_router(auth_router, prefix="/auth", tags=["Team Auth"])
app.include_router(upload_router, prefix="/routes", tags=["Excel Upload"])