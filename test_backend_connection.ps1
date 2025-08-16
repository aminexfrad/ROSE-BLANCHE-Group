# Test Backend Connection Script
Write-Host "🔍 Testing Backend Connection..." -ForegroundColor Cyan

# Test if backend is running on port 8000
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend is running and accessible!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is not accessible on http://localhost:8000/api/" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 To fix this issue:" -ForegroundColor Yellow
    Write-Host "1. Open a new terminal" -ForegroundColor White
    Write-Host "2. Navigate to the backend directory:" -ForegroundColor White
    Write-Host "   cd backend/gateway" -ForegroundColor Gray
    Write-Host "3. Start the Django server:" -ForegroundColor White
    Write-Host "   python manage.py runserver" -ForegroundColor Gray
    Write-Host "4. Keep the server running and try submitting the form again" -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
