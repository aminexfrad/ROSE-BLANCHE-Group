# Script PowerShell pour démarrer les serveurs Django et Next.js

Write-Host "🚀 Démarrage des serveurs StageBloom..." -ForegroundColor Green

# Démarrer le serveur Django
Write-Host "📡 Démarrage du serveur Django (port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend/gateway; python manage.py runserver 8000" -WindowStyle Normal

# Attendre un peu pour que Django démarre
Start-Sleep -Seconds 3

# Démarrer le serveur Next.js
Write-Host "🌐 Démarrage du serveur Next.js (port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Write-Host "✅ Serveurs démarrés !" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "📚 API Docs: http://localhost:8000/api/docs/" -ForegroundColor Cyan

Write-Host "`n🔑 Comptes de test:" -ForegroundColor Magenta
Write-Host "   Stagiaire: stagiaire.complet@example.com / test1234" -ForegroundColor White
Write-Host "   Tuteur: tuteur.complet@example.com / test1234" -ForegroundColor White 