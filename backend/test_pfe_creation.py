#!/usr/bin/env python
"""
Test de création de rapport PFE
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
from shared.models import Stage, PFEReport

def test_pfe_creation():
    print("🧪 Test de création de rapport PFE...")
    
    base_url = "http://localhost:8000/api"
    
    # Login stagiaire
    stagiaire_login = {
        'email': 'stagiaire.complet@example.com',
        'password': 'test1234'
    }
    
    try:
        login_response = requests.post(f"{base_url}/auth/login/", json=stagiaire_login)
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            token = login_result.get('access')
            print(f"✅ Login réussi")
            
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }
            
            # Test 1: Vérifier les rapports existants
            print("\n📋 1. Vérification des rapports existants...")
            pfe_response = requests.get(f"{base_url}/pfe-reports/", headers=headers)
            print(f"   Status: {pfe_response.status_code}")
            if pfe_response.status_code == 200:
                pfe_data = pfe_response.json()
                print(f"   ✅ Rapports trouvés: {len(pfe_data.get('results', []))}")
            else:
                print(f"   ❌ Erreur: {pfe_response.text}")
            
            # Test 2: Créer un nouveau rapport PFE
            print("\n📝 2. Test de création de rapport PFE...")
            
            # Créer un FormData simulé
            pfe_data = {
                'title': 'Test Rapport PFE - API',
                'abstract': 'Ceci est un test de création de rapport PFE via API',
                'keywords': 'Test, API, PFE, Rapport',
                'speciality': 'Informatique - Test',
                'year': 2025
            }
            
            # Utiliser multipart/form-data pour simuler FormData
            files = {}
            data = pfe_data
            
            create_response = requests.post(
                f"{base_url}/pfe-reports/create/",
                data=data,
                files=files,
                headers={
                    'Authorization': f'Bearer {token}'
                }
            )
            
            print(f"   Status: {create_response.status_code}")
            if create_response.status_code == 201:
                print("   ✅ Rapport PFE créé avec succès")
                created_report = create_response.json()
                print(f"   ID: {created_report.get('id')}")
                print(f"   Titre: {created_report.get('title')}")
            else:
                print(f"   ❌ Erreur: {create_response.text}")
            
            # Test 3: Vérifier que le rapport a été créé
            print("\n📋 3. Vérification après création...")
            pfe_response = requests.get(f"{base_url}/pfe-reports/", headers=headers)
            if pfe_response.status_code == 200:
                pfe_data = pfe_response.json()
                print(f"   ✅ Rapports après création: {len(pfe_data.get('results', []))}")
            else:
                print(f"   ❌ Erreur: {pfe_response.text}")
        
        else:
            print(f"❌ Login failed: {login_response.status_code}")
            print(f"   Response: {login_response.text}")
    
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    test_pfe_creation() 