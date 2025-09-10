# # # import os
# # # import certifi
# # # from motor.motor_asyncio import AsyncIOMotorClient
# # # from urllib.parse import quote_plus
# # # from dotenv import load_dotenv

# # # load_dotenv()

# # # # Read environment variables
# # # user = os.getenv("MONGO_USER")
# # # password = os.getenv("MONGO_PASS")
# # # cluster = os.getenv("MONGO_CLUSTER")
# # # db_name = os.getenv("MONGO_DB")

# # # if not all([user, password, cluster, db_name]):
# # #     raise ValueError("❌ Missing MongoDB environment variables")

# # # # Encode credentials to handle special characters
# # # user = quote_plus(user)
# # # password = quote_plus(password)

# # # # Build MongoDB connection URI
# # # MONGO_URI = (
# # #     f"mongodb+srv://{user}:{password}@{cluster}/{db_name}"
# # #     "?retryWrites=true&w=majority"
# # # )

# # # # Initialize variables
# # # client = None
# # # db = None

# # # async def connect_to_mongo():
# # #     """Establish connection to MongoDB Atlas"""
# # #     global client, db
# # #     try:
# # #         # ✅ Use certifi CA bundle for SSL verification
# # #         client = AsyncIOMotorClient(MONGO_URI, tlsCAFile=certifi.where())
# # #         db = client[db_name]

# # #         # Test the connection
# # #         await client.admin.command("ping")
# # #         print("✅ Successfully connected to MongoDB Atlas")
# # #         return True
# # #     except Exception as e:
# # #         print(f"❌ MongoDB connection failed: {e}")
# # #         client = None
# # #         db = None
# # #         return False

# # # async def close_mongo_connection():
# # #     """Close MongoDB connection"""
# # #     global client
# # #     if client:
# # #         client.close()
# # #         print("✅ MongoDB connection closed")








# # # # import os
# # # # from motor.motor_asyncio import AsyncIOMotorClient
# # # # from urllib.parse import quote_plus
# # # # from dotenv import load_dotenv

# # # # load_dotenv()

# # # # user = os.getenv("MONGO_USER")
# # # # password = os.getenv("MONGO_PASS")
# # # # cluster = os.getenv("MONGO_CLUSTER")
# # # # db_name = os.getenv("MONGO_DB")

# # # # if not all([user, password, cluster, db_name]):
# # # #     raise ValueError("Missing MongoDB environment variables")

# # # # user = quote_plus(user)
# # # # password = quote_plus(password)

# # # # MONGO_URI = f"mongodb+srv://{user}:{password}@{cluster}/{db_name}?retryWrites=true&w=majority"

# # # # # Initialize variables
# # # # client = None
# # # # db = None

# # # # async def connect_to_mongo():
# # # #     """Establish connection to MongoDB"""
# # # #     global client, db
# # # #     try:
# # # #         client = AsyncIOMotorClient(MONGO_URI)
# # # #         db = client[db_name]

# # # #         # Test the connection
# # # #         await client.admin.command('ping')
# # # #         print("✅ MongoDB connected successfully")
# # # #         return True
# # # #     except Exception as e:
# # # #         print(f"❌ MongoDB connection failed: {e}")
# # # #         client = None
# # # #         db = None
# # # #         return False

# # # # async def close_mongo_connection():
# # # #     """Close MongoDB connection"""
# # # #     global client
# # # #     if client:
# # # #         client.close()
# # # #         print("✅ MongoDB connection closed")

# # # # # Try to connect immediately (this will be called during startup)
# # # # try:
# # # #     # Create client but don't connect yet
# # # #     client = AsyncIOMotorClient(MONGO_URI)
# # # #     db = client[db_name]
# # # #     print("✅ MongoDB client initialized")
# # # # except Exception as e:
# # # #     print(f"❌ MongoDB client initialization failed: {e}")
# # # #     client = None
# # # #     db = None




# # import os
# # import certifi
# # from motor.motor_asyncio import AsyncIOMotorClient
# # from pymongo import MongoClient  # Add this for sync access
# # from urllib.parse import quote_plus
# # from dotenv import load_dotenv

# # load_dotenv()

# # # Read environment variables
# # user = os.getenv("MONGO_USER")
# # password = os.getenv("MONGO_PASS")
# # cluster = os.getenv("MONGO_CLUSTER")
# # db_name = os.getenv("MONGO_DB")

# # if not all([user, password, cluster, db_name]):
# #     raise ValueError("❌ Missing MongoDB environment variables")

# # # Encode credentials to handle special characters
# # user = quote_plus(user)
# # password = quote_plus(password)

# # # Build MongoDB connection URI
# # MONGO_URI = (
# #     f"mongodb+srv://{user}:{password}@{cluster}/{db_name}"
# #     "?retryWrites=true&w=majority"
# # )

# # # Initialize variables
# # client = None
# # db = None

# # async def connect_to_mongo():
# #     """Establish async connection to MongoDB Atlas"""
# #     global client, db
# #     try:
# #         client = AsyncIOMotorClient(MONGO_URI, tlsCAFile=certifi.where())
# #         db = client[db_name]
# #         await client.admin.command("ping")
# #         print("✅ Successfully connected to MongoDB Atlas (async)")
# #         return True
# #     except Exception as e:
# #         print(f"❌ MongoDB async connection failed: {e}")
# #         client = None
# #         db = None
# #         return False

# # # Create synchronous connection for schema imports
# # try:
# #     sync_client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
# #     db = sync_client[db_name]
# #     # Test sync connection
# #     sync_client.admin.command('ping')
# #     print("✅ MongoDB sync client initialized for schema access")
# # except Exception as e:
# #     print(f"❌ MongoDB sync client initialization failed: {e}")
# #     db = None

# # async def close_mongo_connection():
# #     """Close MongoDB connection"""
# #     global client
# #     if client:
# #         client.close()
# #         print("✅ MongoDB connection closed")





# import os
# from motor.motor_asyncio import AsyncIOMotorClient
# from pymongo.errors import ConnectionFailure, OperationFailure
# from dotenv import load_dotenv

# load_dotenv()

# # MongoDB connection details
# MONGO_URI = os.getenv("MONGODB_URI")
# DB_NAME = os.getenv("DB_NAME", "hackathon_evaluation")

# client = None
# db = None

# async def connect_to_mongo():
#     """Connect to MongoDB with error handling"""
#     global client, db
#     try:
#         if not MONGO_URI:
#             print("❌ MONGODB_URI environment variable not set")
#             return False
            
#         client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        
#         # Test the connection
#         await client.admin.command('ping')
        
#         db = client[DB_NAME]
#         print(f"✅ Connected to MongoDB: {DB_NAME}")
#         return True
        
#     except ConnectionFailure as e:
#         print(f"❌ MongoDB connection failed: {e}")
#         return False
#     except OperationFailure as e:
#         print(f"❌ MongoDB authentication failed: {e}")
#         return False
#     except Exception as e:
#         print(f"❌ Unexpected MongoDB error: {e}")
#         return False

# async def close_mongo_connection():
#     """Close MongoDB connection"""
#     global client
#     if client:
#         client.close()
#         print("✅ MongoDB connection closed")

# def get_database():
#     """Get database instance"""
#     return db





import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure, OperationFailure
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection details
MONGO_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME", "hackathon_evaluation")

client = None
db = None

async def connect_to_mongo():
    """Connect to MongoDB with error handling"""
    global client, db
    try:
        if not MONGO_URI:
            print("❌ MONGODB_URI environment variable not set")
            return False
            
        client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        
        # Test the connection
        await client.admin.command('ping')
        
        db = client[DB_NAME]
        print(f"✅ Connected to MongoDB: {DB_NAME}")
        return True
        
    except ConnectionFailure as e:
        print(f"❌ MongoDB connection failed: {e}")
        return False
    except OperationFailure as e:
        print(f"❌ MongoDB authentication failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected MongoDB error: {e}")
        return False

async def close_mongo_connection():
    """Close MongoDB connection"""
    global client
    if client:
        client.close()
        print("✅ MongoDB connection closed")

def get_database():
    """Get database instance"""
    return db