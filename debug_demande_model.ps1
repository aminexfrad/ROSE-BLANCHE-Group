# Diagnostic du modèle Demande et de la base de données
Write-Host "🔍 Diagnostic du modèle Demande et de la base de données" -ForegroundColor Cyan
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

# Lancer le diagnostic
Write-Host "`n🚀 Lancement du diagnostic du modèle Demande..." -ForegroundColor Yellow
python debug_demande_model.py

# Vérifier le code de sortie
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Diagnostic terminé avec succès!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Diagnostic échoué avec le code: $LASTEXITCODE" -ForegroundColor Red
}

# Retourner au dossier racine
Set-Location ..

Write-Host "`n📋 Ce diagnostic va:" -ForegroundColor Cyan
Write-Host "- Vérifier les champs du modèle Django Demande" -ForegroundColor White
Write-Host "- Comparer avec la structure de la base de données" -ForegroundColor White
Write-Host "- Identifier le problème avec le champ 'date_soumission'" -ForegroundColor White
Write-Host "- Proposer des solutions de correction" -ForegroundColor White

Write-Host "`n🔧 Problème identifié:" -ForegroundColor Yellow
Write-Host "L'erreur 'Field date_soumission doesn't have a default value' indique" -ForegroundColor White
Write-Host "une incohérence entre le modèle Django et la base de données" -ForegroundColor White
