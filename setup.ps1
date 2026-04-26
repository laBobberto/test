Write-Host "🚀 Настройка проекта В Потоке..." -ForegroundColor Green

# Backend setup
Write-Host ""
Write-Host "📦 Настройка Backend..." -ForegroundColor Cyan
Set-Location backend

# Create .env if not exists
if (-not (Test-Path .env)) {
    Write-Host "📝 Создание .env файла..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ .env создан из .env.example" -ForegroundColor Green
} else {
    Write-Host "✅ .env уже существует" -ForegroundColor Green
}

# Create virtual environment
if (-not (Test-Path venv)) {
    Write-Host "🐍 Создание виртуального окружения..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "✅ Виртуальное окружение создано" -ForegroundColor Green
} else {
    Write-Host "✅ Виртуальное окружение уже существует" -ForegroundColor Green
}

# Activate venv and install dependencies
Write-Host "📥 Установка зависимостей..." -ForegroundColor Yellow
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Initialize database
if (-not (Test-Path lifebalance.db)) {
    Write-Host "🗄️  Инициализация базы данных..." -ForegroundColor Yellow
    python init_db.py
    Write-Host "✅ База данных создана" -ForegroundColor Green
} else {
    Write-Host "✅ База данных уже существует" -ForegroundColor Green
}

# Create demo account
Write-Host "👤 Создание демо-аккаунта..." -ForegroundColor Yellow
python create_demo_account.py

Set-Location ..

# Frontend setup
Write-Host ""
Write-Host "📦 Настройка Frontend..." -ForegroundColor Cyan
Set-Location frontend

if (-not (Test-Path node_modules)) {
    Write-Host "📥 Установка npm зависимостей..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ Зависимости установлены" -ForegroundColor Green
} else {
    Write-Host "✅ node_modules уже существует" -ForegroundColor Green
}

Set-Location ..

Write-Host ""
Write-Host "✅ Настройка завершена!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Для запуска проекта:" -ForegroundColor Cyan
Write-Host "   Backend:  cd backend; .\venv\Scripts\Activate.ps1; python main.py"
Write-Host "   Frontend: cd frontend; npm run dev"
Write-Host ""
Write-Host "🔑 Демо-аккаунт:" -ForegroundColor Cyan
Write-Host "   Email: demo@vpotoke.ru"
Write-Host "   Password: demo2026"
Write-Host ""
