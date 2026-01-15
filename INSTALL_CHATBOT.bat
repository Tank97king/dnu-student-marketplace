@echo off
echo ========================================
echo   CAI DAT CHATBOT AI - GOOGLE GEMINI
echo ========================================
echo.

echo [1/2] Dang cai dat package @google/generative-ai...
cd backend
call npm install @google/generative-ai
if %errorlevel% neq 0 (
    echo.
    echo ❌ LOI: Khong the cai dat package!
    echo Vui long kiem tra ket noi internet va thu lai.
    pause
    exit /b 1
)

echo.
echo ✅ Da cai dat thanh cong!
echo.

cd ..

echo [2/2] Kiem tra file .env...
if not exist "backend\.env" (
    echo.
    echo ⚠️  CANH BAO: File backend\.env chua ton tai!
    echo.
    echo Vui long:
    echo 1. Copy file backend\env.example thanh backend\.env
    echo 2. Mo file backend\.env va them dong:
    echo    GEMINI_API_KEY=your_api_key_here
    echo 3. Thay your_api_key_here bang API key cua ban
    echo.
) else (
    echo ✅ File .env da ton tai
    echo.
    echo ⚠️  LUU Y: Neu chua co, vui long them dong sau vao file backend\.env:
    echo    GEMINI_API_KEY=your_api_key_here
    echo.
)

echo ========================================
echo   HOAN TAT!
echo ========================================
echo.
echo Cac buoc tiep theo:
echo 1. Mo file backend\.env
echo 2. Them dong: GEMINI_API_KEY=your_api_key_here
echo 3. Thay your_api_key_here bang API key cua ban
echo 4. Khoi dong lai backend server
echo.
echo Sau do ban co the su dung chatbot o goc duoi ben phai man hinh!
echo.
pause

