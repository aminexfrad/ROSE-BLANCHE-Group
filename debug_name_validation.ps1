# Diagnostic de la validation des noms
Write-Host "🔍 Diagnostic de la validation des noms" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan

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

# Lancer le diagnostic
Write-Host "`n🚀 Lancement du diagnostic de validation des noms..." -ForegroundColor Yellow
python debug_name_validation.py

# Vérifier le code de sortie
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Diagnostic terminé avec succès!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Diagnostic échoué avec le code: $LASTEXITCODE" -ForegroundColor Red
}

# Retourner au dossier racine
Set-Location ..

Write-Host "`n📋 Ce diagnostic va:" -ForegroundColor Cyan
Write-Host "- Tester le pattern actuel de validation des noms" -ForegroundColor White
Write-Host "- Identifier les noms qui sont rejetés" -ForegroundColor White
Write-Host "- Proposer un pattern amélioré" -ForegroundColor White
Write-Host "- Tester l'amélioration proposée" -ForegroundColor White

Write-Host "`n🔧 Problème identifié:" -ForegroundColor Yellow
Write-Host "L'erreur 'Format de nom invalide' indique que le SecurityValidator" -ForegroundColor White
Write-Host "rejette des noms valides à cause d'un pattern regex trop restrictif" -ForegroundColor White
