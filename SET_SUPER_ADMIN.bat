@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul 2>&1
echo ========================================
echo   SET SUPER ADMIN
echo ========================================
echo.
echo Performing:
echo   1. Remove Super Admin from: 1671020292@dnu.edu.vn
echo   2. Set Super Admin for: admin@dnu.edu.vn
echo.

cd /d "%~dp0backend"
if not exist "setSuperAdmin.js" (
    echo [ERROR] File setSuperAdmin.js not found
    echo Please ensure you are running script from project root directory
    pause
    exit /b 1
)

if not exist "removeSuperAdmin.js" (
    echo [ERROR] File removeSuperAdmin.js not found
    echo Please ensure you are running script from project root directory
    pause
    exit /b 1
)

echo.
echo [Step 1/2] Removing Super Admin from 1671020292@dnu.edu.vn...
echo.
node removeSuperAdmin.js 1671020292@dnu.edu.vn

if !ERRORLEVEL! NEQ 0 (
    echo.
    echo [WARNING] Error removing Super Admin. Continuing with next step...
    echo.
)

echo.
echo [Step 2/2] Setting Super Admin for admin@dnu.edu.vn...
echo.
node setSuperAdmin.js admin@dnu.edu.vn

if !ERRORLEVEL! EQU 0 (
    echo.
    echo ========================================
    echo [SUCCESS] COMPLETED!
    echo ========================================
    echo.
    echo Completed:
    echo   + Removed Super Admin from: 1671020292@dnu.edu.vn
    echo   + Set Super Admin for: admin@dnu.edu.vn
    echo.
    echo Please LOGOUT and LOGIN again to apply changes.
    echo.
) else (
    echo.
    echo [ERROR] Error setting Super Admin. Please check again.
    echo.
)

cd /d "%~dp0"
pause
