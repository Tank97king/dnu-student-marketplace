@echo off
chcp 65001 >nul
echo ========================================
echo   KIEM TRA DANH SACH MODEL GEMINI
echo ========================================
echo.
echo Script nay se kiem tra cac model ma API key
echo cua ban co quyen truy cap.
echo.
echo Dang chay...
echo.

cd /d "%~dp0backend"

if not exist "list_models.js" (
    echo ❌ Khong tim thay file list_models.js!
    pause
    exit /b 1
)

if not exist ".env" (
    echo ❌ Khong tim thay file .env!
    echo Vui long tao file .env va them GEMINI_API_KEY
    pause
    exit /b 1
)

node list_models.js

echo.
pause


