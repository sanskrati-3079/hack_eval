from dotenv import load_dotenv
import os
from pathlib import Path
from urllib.parse import quote_plus

# Get the directory containing this file
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env file
load_dotenv(BASE_DIR / '.env')
GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")
FROM_EMAIL = os.getenv("FROM_EMAIL")

# Get MongoDB credentials from environment variables
mongo_user = os.getenv("MONGO_USER", "")
mongo_pass = os.getenv("MONGO_PASS", "")  # Changed from MONGO_PASSWORD to match .env
mongo_cluster = os.getenv("MONGO_CLUSTER", "")

# Construct MongoDB URI with properly escaped username and password for MongoDB Atlas
if mongo_user and mongo_pass and mongo_cluster:
    MONGO_URI = f"mongodb+srv://{quote_plus(mongo_user)}:{quote_plus(mongo_pass)}@{mongo_cluster}/?retryWrites=true&w=majority"
else:
    MONGO_URI =  os.getenv("MONGODB_URI"),
MONGO_DB = os.getenv("DB_NAME", "hackathon_evaluation")
JWT_SECRET = os.getenv("JWT_SECRET", "your_jwt_secret_key")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL")
