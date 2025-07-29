# Script PowerShell pour tester le dashboard admin

Write-Host "🏛️ Test du Dashboard Admin..." -ForegroundColor Green

# Test backend
Write-Host "`n📡 Test des rapports archivés pour admin..." -ForegroundColor Yellow
python ../test_archived_reports.py

Write-Host "`n✅ Tests terminés !" -ForegroundColor Green
Write-Host "`n📱 Pour tester le dashboard admin dans le navigateur:" -ForegroundColor Cyan
Write-Host "   1. Démarrez les serveurs: .\start_servers.ps1" -ForegroundColor White
Write-Host "   2. Allez sur: http://localhost:3000" -ForegroundColor White
Write-Host "   3. Testez les pages admin:" -ForegroundColor White
Write-Host "      - Dashboard Admin: http://localhost:3000/admin" -ForegroundColor White
Write-Host "      - Rapports PFE Admin: http://localhost:3000/admin/pfe-reports" -ForegroundColor White
Write-Host "   4. Connectez-vous avec:" -ForegroundColor White
Write-Host "      - Admin: admin@example.com / admin" -ForegroundColor White
Write-Host "   5. Vérifiez les fonctionnalités:" -ForegroundColor White
Write-Host "      - Section rapports PFE archivés" -ForegroundColor White
Write-Host "      - Statistiques des rapports" -ForegroundColor White
Write-Host "      - Filtres et recherche" -ForegroundColor White
Write-Host "      - Boutons de téléchargement et visualisation" -ForegroundColor White
Write-Host "      - Navigation vers la page dédiée" -ForegroundColor White 