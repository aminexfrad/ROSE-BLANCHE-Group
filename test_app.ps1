# Script PowerShell pour tester l'application StageBloom

Write-Host "🧪 Test de l'application StageBloom..." -ForegroundColor Green

# 1. Tester la création de rapport PFE
Write-Host "`n📝 1. Test de création de rapport PFE..." -ForegroundColor Yellow
python ../test_pfe_creation.py

# 2. Tester le système complet
Write-Host "`n🔍 2. Test du système complet..." -ForegroundColor Yellow
python ../test_complete_system.py

Write-Host "`n✅ Tests terminés !" -ForegroundColor Green
Write-Host "`n📱 Pour tester dans le navigateur:" -ForegroundColor Cyan
Write-Host "   1. Démarrez les serveurs: .\start_servers.ps1" -ForegroundColor White
Write-Host "   2. Allez sur: http://localhost:3000" -ForegroundColor White
Write-Host "   3. Connectez-vous avec:" -ForegroundColor White
Write-Host "      - Stagiaire: stagiaire.complet@example.com / test1234" -ForegroundColor White
Write-Host "      - Tuteur: tuteur.complet@example.com / test1234" -ForegroundColor White
Write-Host "   4. Testez les pages PFE Reports" -ForegroundColor White 