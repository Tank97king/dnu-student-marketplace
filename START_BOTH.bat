@echo off
echo ===================================
echo   DNU MARKETPLACE - START BOTH
echo ===================================
echo.

echo Starting BACKEND in new window...
start "DNU Marketplace - BACKEND" cmd /k "cd /d %~dp0backend && npm run dev"

echo.
echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting FRONTEND in new window...
start "DNU Marketplace - FRONTEND" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ===================================
echo   DONE!
echo ===================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000 (or http://localhost:5173)
echo.
echo Default Login Credentials:
echo   Admin: admin@dnu.edu.vn / admin123456
echo   User: 1671020292@dnu.edu.vn / 123456789
echo.
echo Two windows have been opened
echo Press any key to exit this window...
pause > nul


