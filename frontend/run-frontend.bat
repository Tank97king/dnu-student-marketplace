@echo off
echo ===================================
echo   DNU MARKETPLACE - FRONTEND
echo ===================================
echo.

echo Installing dependencies...
call npm install

echo.
echo Starting frontend development server...
echo Frontend will run at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause








