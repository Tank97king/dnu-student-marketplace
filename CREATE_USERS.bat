@echo off
chcp 65001 >nul
echo ========================================
echo   TẠO 20 NGƯỜI DÙNG MỚI
echo ========================================
echo.

cd /d "%~dp0backend"

node createMultipleUsers.js

echo.
echo Hoàn thành!
pause
