# MongoDB Setup Guide

## Issue
The application is failing to start because it cannot connect to MongoDB at `localhost:27017`.

## Solutions

### Option 1: Install MongoDB Locally (Recommended for Development)

1. **Download MongoDB Community Server:**
   - Go to: https://www.mongodb.com/try/download/community
   - Download the Windows MSI installer
   - Run the installer and follow the setup wizard

2. **Start MongoDB Service:**
   ```powershell
   # Start MongoDB service
   net start MongoDB
   
   # Or use the provided batch file
   start_mongodb.bat
   ```

3. **Verify MongoDB is running:**
   ```powershell
   # Check if MongoDB is listening on port 27017
   netstat -an | findstr 27017
   ```

### Option 2: Use MongoDB Atlas (Cloud Database)

1. **Create MongoDB Atlas Account:**
   - Go to: https://www.mongodb.com/atlas
   - Sign up for a free account
   - Create a new cluster

2. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

3. **Create .env file:**
   Create a `.env` file in the Backend directory with:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/hackathon_evaluation?retryWrites=true&w=majority
   MONGO_DB=hackathon_evaluation
   JWT_SECRET=your_secure_jwt_secret_key
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   ```

### Option 3: Use Docker (Alternative)

1. **Install Docker Desktop:**
   - Download from: https://www.docker.com/products/docker-desktop

2. **Run MongoDB in Docker:**
   ```bash
   docker run -d --name mongodb -p 27017:27017 mongo:latest
   ```

## Testing the Connection

After setting up MongoDB, test the connection:

1. **Start the backend:**
   ```bash
   cd Backend
   python -m uvicorn main:app --reload
   ```

2. **Check health endpoint:**
   - Open: http://localhost:8000/auth/health
   - Should return: `{"status": "healthy", "database": "connected"}`

## Troubleshooting

- **Port 27017 already in use:** Check if another MongoDB instance is running
- **Access denied:** Ensure MongoDB service has proper permissions
- **Connection timeout:** Check firewall settings and MongoDB configuration

## Next Steps

Once MongoDB is connected:
1. The application will start successfully
2. Database operations will work normally
3. You can access the API documentation at: http://localhost:8000/docs
