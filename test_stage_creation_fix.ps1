# Test de la correction de la création de stage et de l'assignation de tuteur
Write-Host "🧪 Test de la correction de la création de stage et de l'assignation de tuteur" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan

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
Write-Host "`n🚀 Lancement du test de création de stage et d'assignation..." -ForegroundColor Yellow
python test_stage_creation_fix.py

# Vérifier le code de sortie
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Test terminé avec succès!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Test échoué avec le code: $LASTEXITCODE" -ForegroundColor Red
}

# Retourner au dossier racine
Set-Location ..

Write-Host "`n📋 Résumé des corrections apportées:" -ForegroundColor Cyan
Write-Host "- RHCreateStageForStagiaireView: Correction de la gestion de l'entreprise" -ForegroundColor White
Write-Host "- Création automatique d'entreprise si nécessaire" -ForegroundColor White
Write-Host "- Liaison correcte stage-entreprise et demande-entreprise" -ForegroundColor White
Write-Host "- Script de test créé: test_stage_creation_fix.py" -ForegroundColor White

Write-Host "`n🔧 Problème résolu:" -ForegroundColor Yellow
Write-Host "L'erreur 'Aucun stage actif trouvé pour ce stagiaire' était causée par" -ForegroundColor White
Write-Host "une incohérence dans la création du stage (champ 'company' inexistant)" -ForegroundColor White
Write-Host "Maintenant, le stage est créé correctement avec l'entreprise avant l'assignation" -ForegroundColor White
