@echo off
echo ============================================
echo    DNU Marketplace - Generate Embeddings
echo    Tao vector embedding cho San Pham (AI)
echo ============================================
echo.
cd /d "%~dp0backend"
echo Dang ket noi MongoDB va tao embeddings...
echo (Co the mat vai phut neu co nhieu san pham)
echo.
node scripts/generateEmbeddings.js
echo.
pause
