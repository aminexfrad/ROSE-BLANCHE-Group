# Script PowerShell pour tester le système complet des rapports archivés

Write-Host "📦 Test complet du système des rapports archivés..." -ForegroundColor Green

# Test backend
Write-Host "`n📡 Test des rapports archivés..." -ForegroundColor Yellow
python ../test_archived_reports.py

Write-Host "`n✅ Tests terminés !" -ForegroundColor Green
Write-Host "`n📱 Pour tester dans le navigateur:" -ForegroundColor Cyan
Write-Host "   1. Démarrez les serveurs: .\start_servers.ps1" -ForegroundColor White
Write-Host "   2. Allez sur: http://localhost:3000" -ForegroundColor White
Write-Host "   3. Testez les pages:" -ForegroundColor White
Write-Host "      - RH Digital Hub: http://localhost:3000/rh/pfe-digital-hub" -ForegroundColor White
Write-Host "      - Admin Django: http://localhost:8000/admin/" -ForegroundColor White
Write-Host "   4. Connectez-vous avec:" -ForegroundColor White
Write-Host "      - RH: rh.complet@example.com / test1234" -ForegroundColor White
Write-Host "      - Admin Django: admin / admin" -ForegroundColor White
Write-Host "   5. Vérifiez que les rapports archivés sont visibles" -ForegroundColor White
Write-Host "   6. Testez les filtres par statut (Archivé)" -ForegroundColor White 