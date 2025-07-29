#!/usr/bin/env python
"""
Debug de l'endpoint PFE
"""

import os
import sys
import django
import requests

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

def debug_pfe_endpoint():
    print("🔍 Debug de l'endpoint PFE...")
    
    base_url = "http://localhost:8000/api"
    
    # Test 1: Vérifier si le serveur répond
    try:
        response = requests.get(f"{base_url}/")
        print(f"✅ Serveur répond: {response.status_code}")
    except Exception as e:
        print(f"❌ Serveur ne répond pas: {e}")
        return
    
    # Test 2: Login
    login_data = {
        'email': 'stagiaire.complet@example.com',
        'password': 'test1234'
    }
    
    try:
        login_response = requests.post(f"{base_url}/auth/login/", json=login_data)
        print(f"Login status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            token = login_response.json().get('access')
            print(f"✅ Token obtenu: {token[:20]}...")
            
            headers = {'Authorization': f'Bearer {token}'}
            
            # Test 3: GET PFE reports
            print("\n📋 Test GET /pfe-reports/")
            get_response = requests.get(f"{base_url}/pfe-reports/", headers=headers)
            print(f"   Status: {get_response.status_code}")
            if get_response.status_code != 200:
                print(f"   Erreur: {get_response.text}")
            
            # Test 4: POST PFE report (sans fichier)
            print("\n📝 Test POST /pfe-reports/create/")
            pfe_data = {
                'title': 'Test Debug PFE',
                'abstract': 'Test abstract',
                'keywords': 'test, debug',
                'speciality': 'Informatique',
                'year': 2025
            }
            
            create_response = requests.post(
                f"{base_url}/pfe-reports/create/",
                data=pfe_data,
                headers={'Authorization': f'Bearer {token}'}
            )
            
            print(f"   Status: {create_response.status_code}")
            print(f"   Response: {create_response.text}")
            
        else:
            print(f"❌ Login failed: {login_response.text}")
    
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    debug_pfe_endpoint() 