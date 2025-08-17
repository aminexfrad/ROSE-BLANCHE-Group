# Start Celery Worker and Beat Scheduler for StageBloom
# This script starts the background task processing system

Write-Host "Starting StageBloom Celery Services..." -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "gateway\manage.py")) {
    Write-Host "Error: Please run this script from the backend directory" -ForegroundColor Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

# Check if Redis is running
Write-Host "Checking Redis connection..." -ForegroundColor Yellow
try {
    $redisTest = redis-cli ping
    if ($redisTest -eq "PONG") {
        Write-Host "✓ Redis is running" -ForegroundColor Green
    } else {
        Write-Host "✗ Redis connection failed" -ForegroundColor Red
        Write-Host "Please start Redis first" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "✗ Redis is not running. Please start Redis first." -ForegroundColor Red
    Write-Host "You can start Redis with: redis-server" -ForegroundColor Yellow
    exit 1
}

# Function to start Celery worker
function Start-CeleryWorker {
    Write-Host "Starting Celery Worker..." -ForegroundColor Yellow
    Start-Process -FilePath "python" -ArgumentList "-m", "celery", "-A", "gateway.stagebloom", "worker", "--loglevel=info" -WindowStyle Normal
    Start-Sleep -Seconds 2
}

# Function to start Celery beat scheduler
function Start-CeleryBeat {
    Write-Host "Starting Celery Beat Scheduler..." -ForegroundColor Yellow
    Start-Process -FilePath "python" -ArgumentList "-m", "celery", "-A", "gateway.stagebloom", "beat", "--loglevel=info" -WindowStyle Normal
    Start-Sleep -Seconds 2
}

# Function to start Celery monitor (optional)
function Start-CeleryMonitor {
    Write-Host "Starting Celery Monitor (Flower)..." -ForegroundColor Yellow
    Start-Process -FilePath "python" -ArgumentList "-m", "celery", "-A", "gateway.stagebloom", "flower", "--port=5555" -WindowStyle Normal
    Start-Sleep -Seconds 2
}

# Main execution
try {
    # Change to gateway directory
    Set-Location "gateway"
    
    # Start services
    Start-CeleryWorker
    Start-CeleryBeat
    
    # Ask if user wants to start monitor
    $startMonitor = Read-Host "Do you want to start Celery Monitor (Flower) on port 5555? (y/n)"
    if ($startMonitor -eq "y" -or $startMonitor -eq "Y") {
        Start-CeleryMonitor
        Write-Host "✓ Celery Monitor started at http://localhost:5555" -ForegroundColor Green
    }
    
    Write-Host "`n✓ All Celery services started successfully!" -ForegroundColor Green
    Write-Host "`nServices running:" -ForegroundColor Cyan
    Write-Host "- Celery Worker: Processing background tasks" -ForegroundColor White
    Write-Host "- Celery Beat: Scheduling periodic tasks" -ForegroundColor White
    if ($startMonitor -eq "y" -or $startMonitor -eq "Y") {
        Write-Host "- Celery Monitor: http://localhost:5555" -ForegroundColor White
    }
    
    Write-Host "`nPeriodic tasks configured:" -ForegroundColor Cyan
    Write-Host "- Candidate account deactivation: Every 7 days" -ForegroundColor White
    Write-Host "- Activity monitoring: Daily" -ForegroundColor White
    Write-Host "- Deactivation warnings: Every 7 days" -ForegroundColor White
    
    Write-Host "`nTo stop services, close the respective terminal windows." -ForegroundColor Yellow
    Write-Host "To test the system, use: python manage.py deactivate_inactive_candidates --dry-run" -ForegroundColor Cyan
    
} catch {
    Write-Host "Error starting Celery services: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    # Return to original directory
    Set-Location ".."
}
