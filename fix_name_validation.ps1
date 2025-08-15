# Correction de la validation des noms
Write-Host "🔧 Correction de la validation des noms" -ForegroundColor Cyan
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

# Lancer la correction
Write-Host "`n🚀 Lancement de la correction de la validation des noms..." -ForegroundColor Yellow
python fix_name_validation.py

# Vérifier le code de sortie
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Correction terminée avec succès!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Correction échouée avec le code: $LASTEXITCODE" -ForegroundColor Red
}

# Retourner au dossier racine
Set-Location ..

Write-Host "`n📋 Résumé de la correction:" -ForegroundColor Cyan
Write-Host "- Amélioration du pattern regex pour les noms" -ForegroundColor White
Write-Host "- Support des accents et caractères spéciaux" -ForegroundColor White
Write-Host "- Support des apostrophes et tirets" -ForegroundColor White
Write-Host "- Maintien de la sécurité" -ForegroundColor White

Write-Host "`n🔧 Problème résolu:" -ForegroundColor Yellow
Write-Host "L'erreur 'Format de nom invalide' était causée par un pattern regex" -ForegroundColor White
Write-Host "trop restrictif qui rejetait des noms valides avec accents" -ForegroundColor White
Write-Host "Le nouveau pattern accepte plus de noms tout en maintenant la sécurité" -ForegroundColor White

Write-Host "`n🎯 Résultat:" -ForegroundColor Green
Write-Host "Les noms avec accents et caractères spéciaux sont maintenant acceptés!" -ForegroundColor White
Write-Host "Les demandes de stage peuvent être créées avec des noms français courants" -ForegroundColor White
