# Test script for checking server status
# © 2025 Mohamed Amine FRAD. All rights reserved.

Write-Host "=== Server Status Test ===" -ForegroundColor Green
Write-Host "Testing at: $(Get-Date)" -ForegroundColor Gray

# Test Backend Server
Write-Host "`n🔍 Testing Backend Server (http://localhost:8000)..." -ForegroundColor Yellow
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/" -TimeoutSec 5 -ErrorAction Stop
    if ($backendResponse.StatusCode -eq 200) {
        Write-Host "✅ Backend server is running" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend server returned status $($backendResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Backend server is not running or not accessible" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Test Frontend Server
Write-Host "`n🔍 Testing Frontend Server (http://localhost:3000)..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000/" -TimeoutSec 5 -ErrorAction Stop
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend server is running" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend server returned status $($frontendResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Frontend server is not running or not accessible" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host "`n=== Test completed ===" -ForegroundColor Green
Write-Host "If servers are not running, start them with:" -ForegroundColor Yellow
Write-Host "  Backend: cd backend/gateway && python manage.py runserver" -ForegroundColor Cyan
Write-Host "  Frontend: cd frontend && npm run dev" -ForegroundColor Cyan
