#!/bin/bash
echo "VocabBlitz Baslatiliyor..."

# Node.js kontrolu
if ! command -v node &> /dev/null
then
    echo "HATA: Node.js bilgisayarinizda yuklu degil!"
    echo "Lutfen once https://nodejs.org adresinden Node.js'i indirip kurun."
    exit
fi

# Paket kurulumu
if [ ! -d "node_modules" ]; then
    echo "Ilk kurulum yapiliyor (Paketler indiriliyor), bu biraz surebilir..."
    npm install
fi

# .env kontrolu
if [ ! -f .env ]; then
    echo "UYARI: .env dosyasi bulunamadi! Lutfen .env.example dosyasini kopyalayip asil API anahtarinizi iceren bir .env dosyasi olusturun."
fi

# Tarayiciyi ac (macOS/Linux)
echo "Tarayici aciliyor..."
if which xdg-open > /dev/null
then
  xdg-open http://localhost:3000 &
elif which open > /dev/null
then
  open http://localhost:3000 &
fi

# Sunucuyu baslat
echo "Sunucu calistiriliyor! Durdurmak isterseniz bu terminali kapatabilirsiniz (veya CTRL+C)."
npm run dev
