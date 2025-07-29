# Clear Cache Script for Next.js Development
Write-Host "🧹 Clearing all caches..." -ForegroundColor Green

# Stop any running Next.js processes
Write-Host "Stopping any running Next.js processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Clear Next.js cache
Write-Host "Clearing Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✅ Next.js cache cleared" -ForegroundColor Green
}

# Clear TypeScript cache
Write-Host "Clearing TypeScript cache..." -ForegroundColor Yellow
if (Test-Path "tsconfig.tsbuildinfo") {
    Remove-Item "tsconfig.tsbuildinfo"
    Write-Host "✅ TypeScript cache cleared" -ForegroundColor Green
}

# Clear node_modules cache (optional - uncomment if needed)
# Write-Host "Clearing node_modules..." -ForegroundColor Yellow
# if (Test-Path "node_modules") {
#     Remove-Item -Recurse -Force "node_modules"
#     npm install
#     Write-Host "✅ node_modules reinstalled" -ForegroundColor Green
# }

# Clear npm cache
Write-Host "Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force
Write-Host "✅ npm cache cleared" -ForegroundColor Green

# Clear browser cache instructions
Write-Host "`n🌐 Browser Cache Instructions:" -ForegroundColor Cyan
Write-Host "1. Open Developer Tools (F12)" -ForegroundColor White
Write-Host "2. Right-click the refresh button" -ForegroundColor White
Write-Host "3. Select 'Empty Cache and Hard Reload'" -ForegroundColor White
Write-Host "4. Or use Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)" -ForegroundColor White

Write-Host "`n🚀 Ready to start development server!" -ForegroundColor Green
Write-Host "Run: npm run dev" -ForegroundColor Yellow 