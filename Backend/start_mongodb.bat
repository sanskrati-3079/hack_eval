@echo off
echo Starting MongoDB Service...
echo.

REM Try to start MongoDB service
net start MongoDB 2>nul
if %errorlevel% equ 0 (
    echo MongoDB service started successfully!
    echo MongoDB is now running on localhost:27017
) else (
    echo Failed to start MongoDB service.
    echo.
    echo Please ensure MongoDB is installed:
    echo 1. Download from: https://www.mongodb.com/try/download/community
    echo 2. Install MongoDB Community Server
    echo 3. Run this script again
    echo.
    echo Alternative: Use MongoDB Atlas (cloud database)
    echo.
    pause
)
