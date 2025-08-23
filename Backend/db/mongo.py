import os
from pymongo import MongoClient
from urllib.parse import quote_plus
from dotenv import load_dotenv

load_dotenv()

user = os.getenv("MONGO_USER")
password = os.getenv("MONGO_PASS")
cluster = os.getenv("MONGO_CLUSTER")
db_name = os.getenv("MONGO_DB")

if not all([user, password, cluster, db_name]):
    raise ValueError("Missing MongoDB environment variables")

user = quote_plus(user)
password = quote_plus(password)

MONGO_URI = f"mongodb+srv://{user}:{password}@{cluster}/{db_name}?retryWrites=true&w=majority"

try:
    client = MongoClient(MONGO_URI)
    db = client[db_name]   # ✅ always export db
    print("✅ MongoDB connected")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")
    client = None
    db = None   # ✅ still export db, so imports won’t crash
