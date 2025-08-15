# Test complet du processus de demande de stage
Write-Host "🧪 Test complet du processus de demande de stage" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan

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

# Lancer le test complet
Write-Host "`n🚀 Lancement du test complet du processus de demande de stage..." -ForegroundColor Yellow
python test_demande_stage_complete.py

# Vérifier le code de sortie
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Test complet terminé avec succès!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Test complet échoué avec le code: $LASTEXITCODE" -ForegroundColor Red
}

# Retourner au dossier racine
Set-Location ..

Write-Host "`n📋 Ce test complet va:" -ForegroundColor Cyan
Write-Host "- Vérifier que toutes les corrections sont en place" -ForegroundColor White
Write-Host "- Tester la validation des noms avec différents formats" -ForegroundColor White
Write-Host "- Tester la création de demandes avec noms internationaux" -ForegroundColor White
Write-Host "- Tester spécifiquement le nom Warda" -ForegroundColor White
Write-Host "- Vérifier la cohérence des données créées" -ForegroundColor White

Write-Host "`n🌟 Test spécial Warda:" -ForegroundColor Yellow
Write-Host "Le test inclut un cas spécial avec le nom Warda pour vérifier" -ForegroundColor White
Write-Host "que le système accepte les noms internationaux et fonctionne" -ForegroundColor White
Write-Host "correctement avec l'entreprise Warda Technologies" -ForegroundColor White

Write-Host "`n🔧 Corrections testées:" -ForegroundColor Yellow
Write-Host "1. Champ date_soumission ajouté au modèle Demande" -ForegroundColor White
Write-Host "2. Pattern de validation des noms amélioré" -ForegroundColor White
Write-Host "3. Support des noms avec accents et caractères spéciaux" -ForegroundColor White
Write-Host "4. Processus complet de création de demande" -ForegroundColor White
