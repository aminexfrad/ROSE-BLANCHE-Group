# Start Backend Server Script
Write-Host "🚀 Starting Django Backend Server..." -ForegroundColor Cyan

# Navigate to backend directory
Set-Location -Path "backend/gateway"

# Check if Python is available
try {
    $pythonVersion = python --version
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python and try again." -ForegroundColor Red
    exit 1
}

# Check if Django is installed
try {
    python -c "import django; print('Django version:', django.get_version())"
    Write-Host "✅ Django is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Django not found. Installing requirements..." -ForegroundColor Yellow
    pip install -r ../../requirements.txt
}

# Start the server
Write-Host "🌐 Starting Django server on http://localhost:8000..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

python manage.py runserver
