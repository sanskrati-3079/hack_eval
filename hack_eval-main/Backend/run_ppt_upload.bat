@echo off
echo ========================================
echo    PPT Report Upload Script Runner
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.7+ and try again
    pause
    exit /b 1
)

echo ✅ Python found
echo.

REM Check if requirements are installed
echo 📦 Checking dependencies...
pip show pandas >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Installing required dependencies...
    pip install -r requirements_ppt_upload.txt
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
) else (
    echo ✅ Dependencies already installed
)

echo.

REM Check if Excel file exists
if not exist "PPt_Report.xlsx" (
    echo ❌ PPt_Report.xlsx not found in current directory
    echo Please make sure the file is in the same directory as this script
    pause
    exit /b 1
)

echo ✅ Excel file found
echo.

REM Run the test script first
echo 🔍 Running file examination...
python test_ppt_file.py
echo.

REM Ask user if they want to proceed
echo Do you want to proceed with the upload? (Y/N)
set /p choice=
if /i "%choice%"=="Y" (
    echo.
    echo 🚀 Starting upload process...
    python upload_ppt_report.py
) else (
    echo Upload cancelled by user
)

echo.
echo Press any key to exit...
pause >nul

