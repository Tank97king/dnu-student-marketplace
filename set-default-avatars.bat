@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
cls

echo.
echo =====================================================
echo   DNU Marketplace - Gan Avatar Mac Dinh Sinh Vien
echo =====================================================
echo.

:: Kiem tra Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [LOI] Khong tim thay Node.js!
    echo Vui long cai dat Node.js tu: https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: Lay thu muc goc du an (cung thu muc voi file .bat nay)
set SCRIPT_DIR=%~dp0
set BACKEND_DIR=%SCRIPT_DIR%backend
set SCRIPT_FILE=scripts\set-default-avatars.js

:: Kiem tra thu muc backend
if not exist "!BACKEND_DIR!" (
    echo [LOI] Khong tim thay thu muc backend tai: !BACKEND_DIR!
    echo.
    pause
    exit /b 1
)

:: Kiem tra file script
if not exist "!BACKEND_DIR!\!SCRIPT_FILE!" (
    echo [LOI] Khong tim thay file: !BACKEND_DIR!\!SCRIPT_FILE!
    echo.
    pause
    exit /b 1
)

:: Kiem tra node_modules
if not exist "!BACKEND_DIR!\node_modules" (
    echo [CANH BAO] Chua co node_modules - dang chay npm install...
    echo.
    cd /d "!BACKEND_DIR!"
    npm install
    echo.
)

echo [*] Dang quet database va cap nhat avatar...
echo -----------------------------------------------------
echo.

:: Chay script
cd /d "!BACKEND_DIR!"
node !SCRIPT_FILE!
set EXIT_CODE=!errorlevel!

echo.
echo -----------------------------------------------------
if !EXIT_CODE! equ 0 (
    echo [OK] Hoan tat! Tat ca tai khoan da duoc cap nhat.
) else (
    echo [LOI] Co loi xay ra. Xem thong bao phia tren de biet them.
)
echo -----------------------------------------------------
echo.

pause
endlocal
