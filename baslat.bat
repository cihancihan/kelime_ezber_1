@echo off
echo VocabBlitz Baslatiliyor...

:: Node.js'in yuklu olup olmadigini kontrol et
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo HATA: Node.js bilgisayarinizda yuklu degil!
    echo Lutfen once https://nodejs.org adresinden Node.js'i indirip kurun.
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
    echo UYARI: .env dosyasi bulunamadi!
    echo Lutfen .env.example dosyasinin adini .env yapip icine GEMINI_API_KEY bilginizi girin.
    echo Yine de devam ediliyor...
)

:: Tarayiciyi otomatik olarak ac
echo Tarayici aciliyor...
start http://localhost:3000

:: Uygulama sunucusunu baslat
echo Sunucu calistiriliyor! Sunucuyu durdurmak isterseniz bu siyah pencereyi kapatabilirsiniz.
call npm run dev

pause
