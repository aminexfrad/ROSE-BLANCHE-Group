# Setup Script for Real-Time Notification System
# © 2025 Mohamed Amine FRAD. All rights reserved.

Write-Host "Setting up Real-Time Notification System for Stage-bloom..." -ForegroundColor Green

# Check if Redis is installed
Write-Host "Checking Redis installation..." -ForegroundColor Yellow
try {
    $redisVersion = redis-server --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Redis is installed" -ForegroundColor Green
    } else {
        Write-Host "✗ Redis not found. Please install Redis first." -ForegroundColor Red
        Write-Host "Download from: https://redis.io/download" -ForegroundColor Cyan
        exit 1
    }
} catch {
    Write-Host "✗ Redis not found. Please install Redis first." -ForegroundColor Red
    Write-Host "Download from: https://redis.io/download" -ForegroundColor Cyan
    exit 1
}

# Install Python dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
Set-Location "backend"
try {
    pip install -r requirements.txt
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Python dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to install Python dependencies" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Failed to install Python dependencies" -ForegroundColor Red
    exit 1
}

# Install Node.js dependencies
Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
Set-Location "../frontend"
try {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Node.js dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to install Node.js dependencies" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Failed to install Node.js dependencies" -ForegroundColor Red
    exit 1
}

# Run database migrations
Write-Host "Running database migrations..." -ForegroundColor Yellow
Set-Location "../backend/gateway"
try {
    python manage.py makemigrations notification_service
    python manage.py migrate
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database migrations completed" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to run migrations" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Failed to run migrations" -ForegroundColor Red
    exit 1
}

# Create sample notification templates
Write-Host "Creating sample notification templates..." -ForegroundColor Yellow
try {
    python manage.py shell -c "
from notification_service.models import NotificationTemplate

templates = [
    {
        'name': 'stage_update_notification',
        'title_template': 'Mise à jour du stage: {stage_title}',
        'message_template': 'Le stage "{stage_title}" a été mis à jour. Nouveau statut: {new_status}',
        'notification_type': 'info'
    },
    {
        'name': 'document_upload_notification',
        'title_template': 'Nouveau document: {document_name}',
        'message_template': 'Un nouveau document "{document_name}" a été uploadé pour le stage "{stage_title}"',
        'notification_type': 'success'
    },
    {
        'name': 'testimonial_notification',
        'title_template': 'Nouveau témoignage soumis',
        'message_template': 'Un nouveau témoignage a été soumis par {author_name} nécessitant votre validation.',
        'notification_type': 'info'
    },
    {
        'name': 'kpi_alert_notification',
        'title_template': 'Alerte KPI - {stagiaire_name}',
        'message_template': 'Score critique ({score}/5) pour le sondage \"{survey_title}\"',
        'notification_type': 'error'
    }
]

for template_data in templates:
    NotificationTemplate.objects.get_or_create(
        name=template_data['name'],
        defaults=template_data
    )

print('Sample templates created successfully')
"
    Write-Host "✓ Sample notification templates created" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to create sample templates" -ForegroundColor Red
}

# Start Redis server
Write-Host "Starting Redis server..." -ForegroundColor Yellow
try {
    Start-Process -FilePath "redis-server" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    Write-Host "✓ Redis server started" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to start Redis server" -ForegroundColor Red
    Write-Host "Please start Redis manually: redis-server" -ForegroundColor Cyan
}

# Create environment file for frontend
Write-Host "Creating frontend environment file..." -ForegroundColor Yellow
Set-Location "../../frontend"
$envContent = @"
# WebSocket Configuration
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8
Write-Host "✓ Frontend environment file created" -ForegroundColor Green

# Create startup script
Write-Host "Creating startup script..." -ForegroundColor Yellow
Set-Location ".."
$startupScript = @"
# Start Real-Time Notification System
# © 2025 Mohamed Amine FRAD. All rights reserved.

Write-Host "Starting Stage-bloom with Real-Time Notifications..." -ForegroundColor Green

# Start Redis (if not already running)
Write-Host "Starting Redis..." -ForegroundColor Yellow
Start-Process -FilePath "redis-server" -WindowStyle Hidden
Start-Sleep -Seconds 3

# Start Django backend with Daphne
Write-Host "Starting Django backend..." -ForegroundColor Yellow
Set-Location "backend/gateway"
Start-Process -FilePath "python" -ArgumentList "-m", "daphne", "-b", "0.0.0.0", "-p", "8000", "stagebloom.asgi:application" -WindowStyle Hidden

# Start Next.js frontend
Write-Host "Starting Next.js frontend..." -ForegroundColor Yellow
Set-Location "../../frontend"
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Hidden

Write-Host "✓ All services started!" -ForegroundColor Green
Write-Host "Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:8000/api/docs/" -ForegroundColor Cyan

Write-Host "Press any key to stop all services..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Stop all processes
Write-Host "Stopping services..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*python*" -or $_.ProcessName -like "*node*" -or $_.ProcessName -like "*redis*"} | Stop-Process -Force
Write-Host "✓ All services stopped" -ForegroundColor Green
"@

$startupScript | Out-File -FilePath "start_notifications.ps1" -Encoding UTF8
Write-Host "✓ Startup script created: start_notifications.ps1" -ForegroundColor Green

# Create test script
Write-Host "Creating test script..." -ForegroundColor Yellow
$testScript = @"
# Test Real-Time Notification System
# © 2025 Mohamed Amine FRAD. All rights reserved.

Write-Host "Testing Real-Time Notification System..." -ForegroundColor Green

# Test Redis connection
Write-Host "Testing Redis connection..." -ForegroundColor Yellow
try {
    $result = redis-cli ping
    if ($result -eq "PONG") {
        Write-Host "✓ Redis connection successful" -ForegroundColor Green
    } else {
        Write-Host "✗ Redis connection failed" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Redis connection failed" -ForegroundColor Red
}

# Test Django backend
Write-Host "Testing Django backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/docs/" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Django backend is running" -ForegroundColor Green
    } else {
        Write-Host "✗ Django backend is not responding" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Django backend is not running" -ForegroundColor Red
}

# Test WebSocket endpoint
Write-Host "Testing WebSocket endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/ws/notifications/" -UseBasicParsing
    Write-Host "✓ WebSocket endpoint is accessible" -ForegroundColor Green
} catch {
    Write-Host "✗ WebSocket endpoint is not accessible" -ForegroundColor Red
}

Write-Host "Test completed!" -ForegroundColor Green
"@

$testScript | Out-File -FilePath "test_notifications.ps1" -Encoding UTF8
Write-Host "✓ Test script created: test_notifications.ps1" -ForegroundColor Green

Write-Host "`n🎉 Real-Time Notification System setup completed!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Start the system: .\start_notifications.ps1" -ForegroundColor Cyan
Write-Host "2. Test the system: .\test_notifications.ps1" -ForegroundColor Cyan
Write-Host "3. Open http://localhost:3000 in your browser" -ForegroundColor Cyan
Write-Host "4. Check the notification bell in the navbar" -ForegroundColor Cyan
Write-Host "`nFor more information, see: docs/real-time-notifications.md" -ForegroundColor Cyan
