#!/bin/bash

echo "🚀 Настройка проекта В Потоке..."

# Backend setup
echo ""
echo "📦 Настройка Backend..."
cd backend

# Create .env if not exists
if [ ! -f .env ]; then
    echo "📝 Создание .env файла..."
    cp .env.example .env
    echo "✅ .env создан из .env.example"
else
    echo "✅ .env уже существует"
fi

# Create virtual environment
if [ ! -d venv ]; then
    echo "🐍 Создание виртуального окружения..."
    python3 -m venv venv
    echo "✅ Виртуальное окружение создано"
else
    echo "✅ Виртуальное окружение уже существует"
fi

# Activate venv and install dependencies
echo "📥 Установка зависимостей..."
source venv/bin/activate
pip install -r requirements.txt

# Initialize database
if [ ! -f lifebalance.db ]; then
    echo "🗄️  Инициализация базы данных..."
    python init_db.py
    echo "✅ База данных создана"
else
    echo "✅ База данных уже существует"
fi

# Create demo account
echo "👤 Создание демо-аккаунта..."
python create_demo_account.py

cd ..

# Frontend setup
echo ""
echo "📦 Настройка Frontend..."
cd frontend

if [ ! -d node_modules ]; then
    echo "📥 Установка npm зависимостей..."
    npm install
    echo "✅ Зависимости установлены"
else
    echo "✅ node_modules уже существует"
fi

cd ..

echo ""
echo "✅ Настройка завершена!"
echo ""
echo "🎯 Для запуска проекта:"
echo "   Backend:  cd backend && source venv/bin/activate && python main.py"
echo "   Frontend: cd frontend && npm run dev"
echo ""
echo "🔑 Демо-аккаунт:"
echo "   Email: demo@vpotoke.ru"
echo "   Password: demo2026"
echo ""
