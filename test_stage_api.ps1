# Test de l'API des stages
Write-Host "🧪 Test de l'API des stages" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Gray

# Test 1: Vérifier si le serveur backend fonctionne
Write-Host "`n1️⃣ Test de connexion au serveur backend..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/" -Method GET -TimeoutSec 10
    Write-Host "✅ Serveur backend accessible" -ForegroundColor Green
    Write-Host "   - Réponse: $($response | ConvertTo-Json -Depth 1)" -ForegroundColor White
} catch {
    Write-Host "❌ Serveur backend inaccessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Vérifiez que le serveur Django est démarré sur le port 8000" -ForegroundColor Yellow
}

# Test 2: Tester l'endpoint des stages
Write-Host "`n2️⃣ Test de l'endpoint des stages..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/stages/" -Method GET -TimeoutSec 10
    Write-Host "✅ Endpoint des stages accessible" -ForegroundColor Green
    Write-Host "   - Nombre de stages: $($response.count)" -ForegroundColor White
} catch {
    Write-Host "❌ Endpoint des stages inaccessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Tester l'endpoint my-internship
Write-Host "`n3️⃣ Test de l'endpoint my-internship..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/stages/my-internship/" -Method GET -TimeoutSec 10
    Write-Host "✅ Endpoint my-internship accessible" -ForegroundColor Green
    Write-Host "   - Stage trouvé: $($response.title)" -ForegroundColor White
} catch {
    Write-Host "❌ Endpoint my-internship inaccessible: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Message -like "*404*") {
        Write-Host "   - Erreur 404: Endpoint non trouvé" -ForegroundColor Yellow
    } elseif ($_.Exception.Message -like "*500*") {
        Write-Host "   - Erreur 500: Erreur serveur interne" -ForegroundColor Red
    }
}

# Test 4: Tester l'endpoint stagiaire
Write-Host "`n4️⃣ Test de l'endpoint stagiaire..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/stagiaire/internship/" -Method GET -TimeoutSec 10
    Write-Host "✅ Endpoint stagiaire accessible" -ForegroundColor Green
    Write-Host "   - Stage trouvé: $($response.title)" -ForegroundColor White
} catch {
    Write-Host "❌ Endpoint stagiaire inaccessible: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Message -like "*404*") {
        Write-Host "   - Erreur 404: Endpoint non trouvé" -ForegroundColor Yellow
    } elseif ($_.Exception.Message -like "*500*") {
        Write-Host "   - Erreur 500: Erreur serveur interne" -ForegroundColor Red
    }
}

Write-Host "`n🏁 Tests terminés" -ForegroundColor Cyan
Write-Host "Si vous voyez des erreurs, vérifiez:" -ForegroundColor Yellow
Write-Host "1. Que le serveur Django est démarré (python manage.py runserver)" -ForegroundColor White
Write-Host "2. Que les migrations sont appliquées (python manage.py migrate)" -ForegroundColor White
Write-Host "3. Que la base de données contient des données de test" -ForegroundColor White
