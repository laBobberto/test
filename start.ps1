# LifeBalance SPb - Скрипт запуска

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  LifeBalance SPb - Запуск проекта" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Проверка Python
Write-Host "Проверка Python..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Python установлен: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Python не найден. Установите Python 3.11+" -ForegroundColor Red
    exit 1
}

# Проверка Node.js
Write-Host "Проверка Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Node.js установлен: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js не найден. Установите Node.js 20+" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Настройка Backend" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Backend setup
Set-Location backend

# Проверка виртуального окружения
if (-not (Test-Path "venv")) {
    Write-Host "Создание виртуального окружения..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "✓ Виртуальное окружение создано" -ForegroundColor Green
}

# Активация виртуального окружения
Write-Host "Активация виртуального окружения..." -ForegroundColor Yellow
.\venv\Scripts\Activate.ps1

# Установка зависимостей
Write-Host "Установка зависимостей..." -ForegroundColor Yellow
pip install -r requirements.txt -q

# Проверка .env файла
if (-not (Test-Path ".env")) {
    Write-Host "Создание .env файла..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✓ .env файл создан" -ForegroundColor Green
    Write-Host "⚠ Не забудьте настроить переменные окружения в .env" -ForegroundColor Yellow
}

# Инициализация базы данных
Write-Host "Инициализация базы данных..." -ForegroundColor Yellow
python init_db.py

Write-Host "✓ Backend настроен" -ForegroundColor Green

Set-Location ..

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Настройка Frontend" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Frontend setup
Set-Location frontend

# Установка зависимостей
if (-not (Test-Path "node_modules")) {
    Write-Host "Установка зависимостей..." -ForegroundColor Yellow
    npm install
    Write-Host "✓ Зависимости установлены" -ForegroundColor Green
}

Set-Location ..

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Запуск серверов" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend будет доступен на: http://localhost:8000" -ForegroundColor Green
Write-Host "Frontend будет доступен на: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Для остановки нажмите Ctrl+C" -ForegroundColor Yellow
Write-Host ""

# Запуск backend в фоне
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\Activate.ps1; uvicorn main:app --reload --host 0.0.0.0 --port 8000"

# Небольшая задержка
Start-Sleep -Seconds 2

# Запуск frontend
Set-Location frontend
npm run dev
