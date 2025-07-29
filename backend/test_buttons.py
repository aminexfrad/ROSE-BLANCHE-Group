#!/usr/bin/env python
"""
Test des boutons de téléchargement et visualisation
"""

import os
import sys
import django
import requests

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

def test_buttons():
    print("🔘 Test des boutons de téléchargement et visualisation...")
    
    base_url = "http://localhost:8000/api"
    
    # Test avec différents utilisateurs
    users = [
        {'email': 'stagiaire.complet@example.com', 'password': 'test1234', 'role': 'Stagiaire'},
        {'email': 'tuteur.complet@example.com', 'password': 'test1234', 'role': 'Tuteur'},
    ]
    
    for user in users:
        print(f"\n👤 Test avec {user['role']}...")
        
        try:
            # Login
            login_response = requests.post(f"{base_url}/auth/login/", json={
                'email': user['email'],
                'password': user['password']
            })
            
            if login_response.status_code == 200:
                token = login_response.json().get('access')
                headers = {'Authorization': f'Bearer {token}'}
                
                # Test 1: GET PFE reports
                print("   📋 Récupération des rapports...")
                reports_response = requests.get(f"{base_url}/pfe-reports/", headers=headers)
                
                if reports_response.status_code == 200:
                    reports = reports_response.json().get('results', [])
                    print(f"   ✅ {len(reports)} rapport(s) trouvé(s)")
                    
                    if reports:
                        report_id = reports[0]['id']
                        print(f"   🎯 Test avec le rapport ID: {report_id}")
                        
                        # Test 2: Download report
                        print("   📥 Test téléchargement...")
                        download_response = requests.get(f"{base_url}/pfe-reports/{report_id}/download/", headers=headers)
                        
                        if download_response.status_code == 200:
                            download_data = download_response.json()
                            print(f"   ✅ Téléchargement OK - URL: {download_data.get('download_url', 'N/A')}")
                        else:
                            print(f"   ❌ Erreur téléchargement: {download_response.status_code}")
                            print(f"      Response: {download_response.text}")
                    else:
                        print("   ⚠️ Aucun rapport disponible pour le test")
                else:
                    print(f"   ❌ Erreur récupération rapports: {reports_response.status_code}")
            else:
                print(f"   ❌ Login failed: {login_response.status_code}")
        
        except Exception as e:
            print(f"   ❌ Erreur: {e}")
    
    print("\n✅ Test des boutons terminé !")

if __name__ == "__main__":
    test_buttons() 