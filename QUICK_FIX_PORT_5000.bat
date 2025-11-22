@echo off
setlocal enabledelayedexpansion
echo ===================================
echo   QUICK FIX: KILL PORT 5000
echo ===================================
echo.

echo Step 1: Finding processes on port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo   Killing PID: %%a
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo Step 2: Waiting 2 seconds...
timeout /t 2 /nobreak >nul

echo.
echo Step 3: Verifying port is free...
netstat -ano | findstr :5000 >nul
if %errorlevel% == 0 (
    echo   WARNING: Port still in use! Trying with admin rights...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
        taskkill /PID %%a /F
    )
    timeout /t 1 /nobreak >nul
)

netstat -ano | findstr :5000 >nul
if %errorlevel% == 0 (
    echo.
    echo ❌ Port 5000 is still in use.
    echo    Please close all backend terminal windows manually.
    echo    Or run this script as Administrator.
) else (
    echo.
    echo ✅ SUCCESS! Port 5000 is now free.
    echo    You can now start the backend server.
)

echo.
pause

