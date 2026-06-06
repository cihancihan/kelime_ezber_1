@echo off
title VocabBlitz Baslatici
cd /d "%~dp0"

echo VocabBlitz Baslatiliyor... lutfen bekleyin.
echo.

node -v >nul 2>&1
if errorlevel 1 goto nonode

if not exist "node_modules\nul" (
    if not exist "node_modules\" (
        echo Ilk kurulum yapiliyor, paketler indiriliyor...
        call npm install
    )
)

if not exist ".env" (
    echo UYARI: .env dosyasi bulunamadi! Lutfen .env.example dosyasini .env olarak kopyalayin.
    echo Icerisindeki GEMINI_API_KEY kismina anahtarinizi yazmayi unutmayin.
    echo.
)

start http://localhost:3000
echo Sunucu calistiriliyor... Kapatmak icin CTRL+C yapabilir veya bu pencereyi kapatabilirsiniz.
call npm run dev

pause
exit /b

:nonode
echo ========================================================
echo HATA: Node.js bilgisayarinizda kurulu degil!
echo Lutfen once https://nodejs.org adresinden indirip kurun.
echo ========================================================
pause
exit /b
