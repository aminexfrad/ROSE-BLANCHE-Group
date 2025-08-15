# Test du filtrage par entreprise dans les vues RH
Write-Host "🧪 Test du filtrage par entreprise dans les vues RH" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Aller dans le dossier backend
Set-Location backend

# Vérifier que Python est disponible
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python détecté: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

# Vérifier que Django est installé
try {
    python -c "import django; print('Django version:', django.get_version())" 2>&1
    Write-Host "✅ Django est installé" -ForegroundColor Green
} catch {
    Write-Host "❌ Django n'est pas installé" -ForegroundColor Red
    Write-Host "Installez les dépendances avec: pip install -r requirements.txt" -ForegroundColor Yellow
    exit 1
}

# Lancer le test
Write-Host "`n🚀 Lancement du test de filtrage par entreprise..." -ForegroundColor Yellow
python test_rh_entreprise_filtering.py

# Vérifier le code de sortie
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Test terminé avec succès!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Test échoué avec le code: $LASTEXITCODE" -ForegroundColor Red
}

# Retourner au dossier racine
Set-Location ..

Write-Host "`n📋 Résumé des modifications apportées:" -ForegroundColor Cyan
Write-Host "- RHTuteursDisponiblesView: Filtrage par entreprise" -ForegroundColor White
Write-Host "- RHStagiairesView: Filtrage par entreprise" -ForegroundColor White  
Write-Host "- RHStagesView: Filtrage par entreprise" -ForegroundColor White
Write-Host "- RHAssignerTuteurView: Vérification d'entreprise" -ForegroundColor White
Write-Host "- Script de test créé: test_rh_entreprise_filtering.py" -ForegroundColor White
