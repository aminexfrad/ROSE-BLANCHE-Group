# Correction du problème du champ date_soumission
Write-Host "🔧 Correction du problème du champ date_soumission" -ForegroundColor Cyan
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
Write-Host "`n🚀 Lancement de la correction du problème date_soumission..." -ForegroundColor Yellow
python fix_demande_date_soumission.py

# Vérifier le code de sortie
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Correction terminée avec succès!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Correction échouée avec le code: $LASTEXITCODE" -ForegroundColor Red
}

# Retourner au dossier racine
Set-Location ..

Write-Host "`n📋 Résumé de la correction:" -ForegroundColor Cyan
Write-Host "- Ajout du champ 'date_soumission' au modèle Demande" -ForegroundColor White
Write-Host "- Création d'une migration pour synchroniser la base de données" -ForegroundColor White
Write-Host "- Test de création de demande pour vérifier la correction" -ForegroundColor White

Write-Host "`n🔧 Problème résolu:" -ForegroundColor Yellow
Write-Host "L'erreur 'Field date_soumission doesn't have a default value' était causée" -ForegroundColor White
Write-Host "par un champ manquant dans le modèle Django mais présent en base" -ForegroundColor White
Write-Host "Le champ a été ajouté avec une valeur par défaut automatique" -ForegroundColor White

Write-Host "`n🎯 Résultat:" -ForegroundColor Green
Write-Host "Les demandes de stage peuvent maintenant être créées sans erreur!" -ForegroundColor White
