#!/usr/bin/env python
"""
Script pour tester l'API des rapports PFE
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
from shared.models import PFEReport, Stage

def test_pfe_reports_api():
    print("Test de l'API des rapports PFE...")
    
    base_url = "http://localhost:8000/api"
    
    # Test 1: Vérifier les rapports PFE dans la base de données
    print("\n1. Vérification des rapports PFE dans la base de données...")
    pfe_reports_count = PFEReport.objects.count()
    print(f"Nombre de rapports PFE: {pfe_reports_count}")
    
    if pfe_reports_count > 0:
        pfe_report = PFEReport.objects.first()
        print(f"Premier rapport: {pfe_report.title}")
        print(f"   Stagiaire: {pfe_report.stagiaire.get_full_name()}")
        print(f"   Statut: {pfe_report.status}")
    else:
        print("❌ Aucun rapport PFE trouvé dans la base de données")
    
    # Test 2: Vérifier les stages actifs
    print("\n2. Vérification des stages actifs...")
    stages_count = Stage.objects.filter(status='active').count()
    print(f"Nombre de stages actifs: {stages_count}")
    
    if stages_count > 0:
        stage = Stage.objects.filter(status='active').first()
        print(f"Premier stage actif: {stage.title}")
        print(f"   Stagiaire: {stage.stagiaire.get_full_name()}")
    
    # Test 3: Tester l'API avec authentification
    print("\n3. Test de l'API avec authentification...")
    
    # Créer un utilisateur de test pour les rapports PFE
    test_user, created = User.objects.get_or_create(
        email='pfe.test@example.com',
        defaults={
            'nom': 'Test',
            'prenom': 'PFE',
            'role': 'stagiaire',
            'is_active': True
        }
    )
    
    if created:
        test_user.set_password('test1234')
        test_user.save()
        print(f"✅ Utilisateur de test créé: {test_user.email}")
    else:
        print(f"✅ Utilisateur de test existant: {test_user.email}")
    
    # Login
    login_data = {
        'email': 'pfe.test@example.com',
        'password': 'test1234'
    }
    
    try:
        login_response = requests.post(f"{base_url}/auth/login/", json=login_data)
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            token = login_result.get('token')
            print(f"✅ Login réussi pour {test_user.email}")
            
            # Test de l'API des rapports PFE
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }
            
            pfe_response = requests.get(f"{base_url}/pfe-reports/", headers=headers)
            
            print(f"\n4. Test de l'API /pfe-reports/")
            print(f"Status code: {pfe_response.status_code}")
            
            if pfe_response.status_code == 200:
                pfe_data = pfe_response.json()
                print(f"✅ API fonctionnelle")
                print(f"   Nombre de rapports: {len(pfe_data.get('results', []))}")
                
                if pfe_data.get('results'):
                    first_report = pfe_data['results'][0]
                    print(f"   Premier rapport: {first_report.get('title', 'N/A')}")
                    print(f"   Statut: {first_report.get('status', 'N/A')}")
                else:
                    print("   Aucun rapport trouvé pour cet utilisateur")
            else:
                print(f"❌ Erreur API: {pfe_response.status_code}")
                print(f"   Réponse: {pfe_response.text}")
                
        else:
            print(f"❌ Échec du login: {login_response.status_code}")
            print(f"   Réponse: {login_response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Impossible de se connecter au serveur Django")
        print("   Assurez-vous que le serveur Django est démarré sur http://localhost:8000")
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    test_pfe_reports_api() 