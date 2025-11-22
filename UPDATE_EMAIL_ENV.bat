@echo off
chcp 65001 >nul
echo ========================================
echo   CẬP NHẬT CẤU HÌNH EMAIL GMAIL
echo ========================================
echo.

cd /d "%~dp0backend"

if not exist ".env" (
    echo Đang tạo file .env từ env.example...
    copy env.example .env >nul
)

echo Đang cập nhật cấu hình Gmail...
echo.

REM Cập nhật EMAIL_HOST
powershell -Command "(Get-Content .env) -replace 'EMAIL_HOST=smtp-mail.outlook.com', 'EMAIL_HOST=smtp.gmail.com' | Set-Content .env"

REM Cập nhật EMAIL_USER
powershell -Command "(Get-Content .env) -replace 'EMAIL_USER=.*', 'EMAIL_USER=dinhthethanh73@gmail.com' | Set-Content .env"

REM Cập nhật EMAIL_PASSWORD
powershell -Command "(Get-Content .env) -replace 'EMAIL_PASSWORD=.*', 'EMAIL_PASSWORD=fmjyuupzvouraxwd' | Set-Content .env"

echo ✅ Đã cập nhật file .env thành công!
echo.
echo Cấu hình hiện tại:
echo   EMAIL_HOST=smtp.gmail.com
echo   EMAIL_USER=dinhthethanh73@gmail.com
echo   EMAIL_PASSWORD=fmjyuupzvouraxwd
echo   EMAIL_PORT=587
echo.
echo ⚠️  QUAN TRỌNG: Khởi động lại backend để áp dụng thay đổi!
echo.

cd /d "%~dp0"
pause

