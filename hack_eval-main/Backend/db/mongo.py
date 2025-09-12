import os
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from urllib.parse import quote_plus
from dotenv import load_dotenv

load_dotenv()

# --- read env ---
user = os.getenv("MONGO_USER")
password = os.getenv("MONGO_PASS")
cluster = os.getenv("MONGO_CLUSTER")
db_name = os.getenv("MONGO_DB")

if not all([user, password, cluster, db_name]):
    raise ValueError("Missing MongoDB environment variables (MONGO_USER, MONGO_PASS, MONGO_CLUSTER, MONGO_DB)")

user = quote_plus(user)
password = quote_plus(password)
MONGO_URI = f"mongodb+srv://{user}:{password}@{cluster}/{db_name}?retryWrites=true&w=majority"

# --- create client immediately so 'db' is usable on import ---
try:
    client = AsyncIOMotorClient(MONGO_URI, tlsCAFile=certifi.where())
    db = client[db_name]
    print("Mongo client initialized")
except Exception as e:
    raise RuntimeError(f"Mongo client init failed: {e}")

# optional helpers
async def connect_to_mongo():
    try:
        await client.admin.command("ping")
        print("Mongo connection OK")
        return True
    except Exception as e:
        print(f"Mongo ping failed: {e}")
        return False

async def close_mongo_connection():
    client.close()
    print("Mongo connection closed")






# import os
# from motor.motor_asyncio import AsyncIOMotorClient
# from urllib.parse import quote_plus
# from dotenv import load_dotenv

# load_dotenv()

# user = os.getenv("MONGO_USER")
# password = os.getenv("MONGO_PASS")
# cluster = os.getenv("MONGO_CLUSTER")
# db_name = os.getenv("MONGO_DB")

# if not all([user, password, cluster, db_name]):
#     raise ValueError("Missing MongoDB environment variables")

# user = quote_plus(user)
# password = quote_plus(password)

# MONGO_URI = f"mongodb+srv://{user}:{password}@{cluster}/{db_name}?retryWrites=true&w=majority"

# # Initialize variables
# client = None
# db = None

# async def connect_to_mongo():
#     """Establish connection to MongoDB"""
#     global client, db
#     try:
#         client = AsyncIOMotorClient(MONGO_URI)
#         db = client[db_name]

#         # Test the connection
#         await client.admin.command('ping')
#         print("✅ MongoDB connected successfully")
#         return True
#     except Exception as e:
#         print(f"❌ MongoDB connection failed: {e}")
#         client = None
#         db = None
#         return False

# async def close_mongo_connection():
#     """Close MongoDB connection"""
#     global client
#     if client:
#         client.close()
#         print("✅ MongoDB connection closed")

# # Try to connect immediately (this will be called during startup)
# try:
#     # Create client but don't connect yet
#     client = AsyncIOMotorClient(MONGO_URI)
#     db = client[db_name]
#     print("✅ MongoDB client initialized")
# except Exception as e:
#     print(f"❌ MongoDB client initialization failed: {e}")
#     client = None
#     db = None
