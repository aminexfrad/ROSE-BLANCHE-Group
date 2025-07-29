# Script PowerShell pour tester tous les boutons

Write-Host "🔘 Test complet des boutons..." -ForegroundColor Green

# Test backend
Write-Host "`n📡 Test des endpoints backend..." -ForegroundColor Yellow
python ../test_buttons.py

Write-Host "`n✅ Tests terminés !" -ForegroundColor Green
Write-Host "`n📱 Pour tester dans le navigateur:" -ForegroundColor Cyan
Write-Host "   1. Démarrez les serveurs: .\start_servers.ps1" -ForegroundColor White
Write-Host "   2. Allez sur: http://localhost:3000" -ForegroundColor White
Write-Host "   3. Testez les pages:" -ForegroundColor White
Write-Host "      - RH Digital Hub: http://localhost:3000/rh/pfe-digital-hub" -ForegroundColor White
Write-Host "      - Stagiaire PFE: http://localhost:3000/stagiaire/pfe-reports" -ForegroundColor White
Write-Host "   4. Connectez-vous avec:" -ForegroundColor White
Write-Host "      - RH: rh.complet@example.com / test1234" -ForegroundColor White
Write-Host "      - Stagiaire: stagiaire.complet@example.com / test1234" -ForegroundColor White
Write-Host "   5. Testez les boutons Télécharger et Voir" -ForegroundColor White 