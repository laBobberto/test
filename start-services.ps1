# Start Backend and Frontend services with logging

# Kill existing processes on ports
Write-Host "Stopping existing services..." -ForegroundColor Yellow
$backend = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($backend) {
    Stop-Process -Id $backend.OwningProcess -Force -ErrorAction SilentlyContinue
}
$frontend = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($frontend) {
    Stop-Process -Id $frontend.OwningProcess -Force -ErrorAction SilentlyContinue
}

Start-Sleep -Seconds 2

# Start Backend
Write-Host "Starting Backend..." -ForegroundColor Green
$backendJob = Start-Job -ScriptBlock {
    Set-Location "D:\Projects\DigitalSPB\backend"
    & .\venv\Scripts\activate.ps1
    py main.py
}

Start-Sleep -Seconds 5

# Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Green
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "D:\Projects\DigitalSPB\frontend"
    npm run dev
}

Start-Sleep -Seconds 8

# Check if services are running
Write-Host "`nChecking services..." -ForegroundColor Cyan
try {
    $backendHealth = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "✓ Backend is running on http://localhost:8000" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend failed to start" -ForegroundColor Red
    Write-Host "Backend logs:" -ForegroundColor Yellow
    Receive-Job -Job $backendJob
}

try {
    $frontendCheck = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 5
    Write-Host "✓ Frontend is running on http://localhost:5173" -ForegroundColor Green
} catch {
    Write-Host "✗ Frontend failed to start" -ForegroundColor Red
    Write-Host "Frontend logs:" -ForegroundColor Yellow
    Receive-Job -Job $frontendJob
}

Write-Host "`nServices are running. Press Ctrl+C to view logs or close." -ForegroundColor Cyan
Write-Host "To stop services, run: Stop-Job -Name * ; Remove-Job -Name *" -ForegroundColor Yellow

# Keep script running and show logs
while ($true) {
    Start-Sleep -Seconds 5
    $backendOutput = Receive-Job -Job $backendJob
    $frontendOutput = Receive-Job -Job $frontendJob
    
    if ($backendOutput) {
        Write-Host "`n[BACKEND] $backendOutput" -ForegroundColor Blue
    }
    if ($frontendOutput) {
        Write-Host "`n[FRONTEND] $frontendOutput" -ForegroundColor Magenta
    }
}
