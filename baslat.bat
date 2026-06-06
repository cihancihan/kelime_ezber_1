@echo off
cd /d "%~dp0"
echo VocabBlitz Baslatiliyor...

:: Node.js'in yuklu olup olmadigini kontrol et
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ========================================================
    echo HATA: Node.js bilgisayarinizda yuklu degil!
    echo Lutfen once https://nodejs.org adresinden indirip kurun.
    echo ========================================================
    pause
    exit /b
)

:: Gerekli paketler yuklu degilse kur
if not exist "node_modules\" (
    echo Ilk kurulum yapiliyor (Paketler indiriliyor), bu biraz surebilir...
    call npm install
)

:: .env dosyasi yoksa uyar
if not exist ".env" (
    echo UYARI: .env dosyasi bulunamadi! Lutfen .env.example dosyasinin kopyalayip adini .env yapin ve icine GEMINI_API_KEY bilginizi yazin.
)

echo Sunucu calistiriliyor! Lutfen acilan yeni siyah pencereyi kapatmayin.
start "VocabBlitz Sunucusu" cmd /k "npm run dev"

echo Sunucunun hazir olmasi icin birkac saniye bekleniyor...
timeout /t 5 /nobreak >nul

echo Tarayici aciliyor...
start http://localhost:3000


