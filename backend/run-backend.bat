@echo off
echo ===================================
echo   DNU MARKETPLACE - BACKEND
echo ===================================
echo.

REM Check if MongoDB is running
echo Checking MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo MongoDB is running...
) else (
    echo [WARNING] MongoDB is NOT running!
    echo Please start MongoDB service or use MongoDB Atlas
    echo.
    pause
)

echo.
echo Installing dependencies...
call npm install

echo.
echo Starting backend server...
echo Server will run at: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause



