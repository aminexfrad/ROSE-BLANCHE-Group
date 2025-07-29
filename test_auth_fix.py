#!/usr/bin/env python
"""
Test de la correction de l'authentification
"""

import os
import sys
import django
import requests

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from auth_service.models import User

def test_auth_fix():
    print("🔐 Test de la correction de l'authentification...")
    
    base_url = "http://localhost:8000/api"
    
    # Test 1: Login avec stagiaire
    print("\n1️⃣ Test login stagiaire...")
    try:
        login_response = requests.post(f"{base_url}/auth/login/", json={
            'email': 'stagiaire.complet@example.com',
            'password': 'test1234'
        })
        
        if login_response.status_code == 200:
            token = login_response.json().get('access')
            headers = {'Authorization': f'Bearer {token}'}
            print(f"   ✅ Login réussi - Token obtenu")
            
            # Test 2: Appel API avec token
            print("\n2️⃣ Test appel API avec token...")
            profile_response = requests.get(f"{base_url}/auth/profile/", headers=headers)
            
            if profile_response.status_code == 200:
                profile = profile_response.json()
                print(f"   ✅ Profile récupéré - {profile.get('prenom')} {profile.get('nom')}")
                
                # Test 3: Appel API PFE reports
                print("\n3️⃣ Test appel API PFE reports...")
                reports_response = requests.get(f"{base_url}/pfe-reports/", headers=headers)
                
                if reports_response.status_code == 200:
                    reports_data = reports_response.json()
                    reports = reports_data.get('results', [])
                    print(f"   ✅ Rapports PFE récupérés - {len(reports)} rapport(s)")
                else:
                    print(f"   ❌ Erreur PFE reports: {reports_response.status_code}")
                    print(f"      Response: {reports_response.text}")
            else:
                print(f"   ❌ Erreur profile: {profile_response.status_code}")
                print(f"      Response: {profile_response.text}")
        else:
            print(f"   ❌ Login failed: {login_response.status_code}")
            print(f"      Response: {login_response.text}")
    
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
    
    # Test 4: Login avec admin
    print("\n4️⃣ Test login admin...")
    try:
        login_response = requests.post(f"{base_url}/auth/login/", json={
            'email': 'admin@example.com',
            'password': 'admin'
        })
        
        if login_response.status_code == 200:
            token = login_response.json().get('access')
            headers = {'Authorization': f'Bearer {token}'}
            print(f"   ✅ Login admin réussi")
            
            # Test 5: Appel API admin
            print("\n5️⃣ Test appel API admin...")
            users_response = requests.get(f"{base_url}/users/", headers=headers)
            
            if users_response.status_code == 200:
                users_data = users_response.json()
                users = users_data.get('results', [])
                print(f"   ✅ Utilisateurs récupérés - {len(users)} utilisateur(s)")
            else:
                print(f"   ❌ Erreur users: {users_response.status_code}")
        else:
            print(f"   ❌ Login admin failed: {login_response.status_code}")
    
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
    
    print("\n✅ Test terminé !")

if __name__ == "__main__":
    test_auth_fix() 