#!/usr/bin/env python
"""
Script pour tester les endpoints de l'API et vérifier les stages actifs
"""

import os
import sys
import django
import requests
import json

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from auth_service.models import User
from shared.models import Stage
from demande_service.models import Demande

def test_api_endpoints():
    print("Test des endpoints de l'API...")
    
    base_url = "http://localhost:8000/api"
    
    # Test 1: Vérifier les utilisateurs stagiaires
    print("\n1. Vérification des utilisateurs stagiaires...")
    stagiaires = User.objects.filter(role='stagiaire')
    print(f"Nombre de stagiaires: {stagiaires.count()}")
    
    for stagiaire in stagiaires:
        print(f"  - {stagiaire.prenom} {stagiaire.nom} ({stagiaire.email})")
    
    # Test 2: Vérifier les stages actifs
    print("\n2. Vérification des stages actifs...")
    stages_actifs = Stage.objects.filter(status='active')
    print(f"Nombre de stages actifs: {stages_actifs.count()}")
    
    for stage in stages_actifs:
        print(f"  - Stage {stage.id}: {stage.title}")
        print(f"    Stagiaire: {stage.stagiaire.prenom} {stage.stagiaire.nom}")
        print(f"    Entreprise: {stage.company}")
        print(f"    Progression: {stage.progress}%")
        print(f"    Tuteur: {stage.tuteur.prenom + ' ' + stage.tuteur.nom if stage.tuteur else 'Non assigné'}")
    
    # Test 3: Vérifier les demandes approuvées
    print("\n3. Vérification des demandes approuvées...")
    demandes_approuvees = Demande.objects.filter(status='approved')
    print(f"Nombre de demandes approuvées: {demandes_approuvees.count()}")
    
    for demande in demandes_approuvees:
        print(f"  - Demande {demande.id}: {demande.prenom} {demande.nom}")
        print(f"    Email: {demande.email}")
        print(f"    Type: {demande.type_stage}")
    
    # Test 4: Test de l'API avec authentification
    print("\n4. Test de l'API avec authentification...")
    
    # Trouver l'utilisateur avec le stage actif
    stage_actif = Stage.objects.filter(status='active').first()
    if not stage_actif:
        print("  ❌ Aucun stage actif trouvé")
        return
    
    test_user = stage_actif.stagiaire
    print(f"  Utilisateur de test: {test_user.email}")
    
    # Login
    login_data = {
        "email": test_user.email,
        "password": "test1234"
    }
    
    try:
        response = requests.post(f"{base_url}/auth/login/", json=login_data)
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get('access')
            print(f"  ✅ Login réussi")
            
            # Test de l'endpoint du stage actif
            headers = {"Authorization": f"Bearer {access_token}"}
            stage_response = requests.get(f"{base_url}/stagiaire/internship/", headers=headers)
            
            if stage_response.status_code == 200:
                stage_data = stage_response.json()
                print(f"  ✅ Stage actif trouvé:")
                print(f"    - Titre: {stage_data.get('title')}")
                print(f"    - Entreprise: {stage_data.get('company')}")
                print(f"    - Progression: {stage_data.get('progress')}%")
                print(f"    - Statut: {stage_data.get('status')}")
            elif stage_response.status_code == 404:
                print(f"  ❌ Aucun stage actif trouvé pour {test_user.email}")
                print(f"    Réponse: {stage_response.text}")
            else:
                print(f"  ❌ Erreur API: {stage_response.status_code}")
                print(f"    Réponse: {stage_response.text}")
                
        else:
            print(f"  ❌ Échec du login: {response.status_code}")
            print(f"    Réponse: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print(f"  ❌ Impossible de se connecter au serveur Django")
        print(f"    Assurez-vous que le serveur Django fonctionne sur http://localhost:8000")
    except Exception as e:
        print(f"  ❌ Erreur lors du test: {str(e)}")

def check_database_state():
    print("\n=== État de la base de données ===")
    
    # Compter les objets
    users_count = User.objects.count()
    stages_count = Stage.objects.count()
    demandes_count = Demande.objects.count()
    
    print(f"Utilisateurs: {users_count}")
    print(f"Stages: {stages_count}")
    print(f"Demandes: {demandes_count}")
    
    # Détails par rôle
    print("\nUtilisateurs par rôle:")
    for role in ['stagiaire', 'tuteur', 'rh', 'admin']:
        count = User.objects.filter(role=role).count()
        print(f"  {role}: {count}")
    
    # Stages par statut
    print("\nStages par statut:")
    for status in ['active', 'completed', 'suspended', 'cancelled']:
        count = Stage.objects.filter(status=status).count()
        print(f"  {status}: {count}")

if __name__ == '__main__':
    print("=== Test des endpoints de l'API StageBloom ===")
    
    check_database_state()
    test_api_endpoints()
    
    print("\n=== Test terminé ===") 