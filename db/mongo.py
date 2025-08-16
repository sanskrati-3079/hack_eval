# db/mongo.py

import os
from pymongo import MongoClient
from urllib.parse import quote_plus
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Read credentials
user = quote_plus(os.getenv("MONGO_USER"))
password = quote_plus(os.getenv("MONGO_PASS"))
cluster = os.getenv("MONGO_CLUSTER")
db_name = os.getenv("MONGO_DB")

# Build URI
MONGO_URI = f"mongodb+srv://{user}:{password}@{cluster}/?retryWrites=true&w=majority"

# Create Mongo client
client = MongoClient(MONGO_URI)
db = client[db_name]
