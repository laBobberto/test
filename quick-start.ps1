# Quick Start Script for LifeBalance SPb

Write-Host "Starting LifeBalance SPb..." -ForegroundColor Cyan

# Start Backend
Write-Host "`nStarting Backend on http://localhost:8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python -m venv venv; .\venv\Scripts\Activate.ps1; pip install -r requirements.txt; python init_db.py; uvicorn main:app --reload --host 0.0.0.0 --port 8000"

# Wait for backend to start
Start-Sleep -Seconds 5

# Start Frontend
Write-Host "Starting Frontend on http://localhost:5173..." -ForegroundColor Yellow
Set-Location frontend
npm run dev
