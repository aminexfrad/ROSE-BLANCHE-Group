# PowerShell script to create .env.local file
# Run this script from the frontend directory

Write-Host "Creating .env.local file..." -ForegroundColor Green

$envContent = @"
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# App Configuration
NEXT_PUBLIC_APP_NAME=StageBloom
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_VERSION=1.0.0

# Development Settings
NODE_ENV=development
"@

# Create the .env.local file
$envContent | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host ".env.local file created successfully!" -ForegroundColor Green
Write-Host "Please restart your Next.js development server." -ForegroundColor Yellow
Write-Host "Run: npm run dev" -ForegroundColor Cyan 