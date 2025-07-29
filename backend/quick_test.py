#!/usr/bin/env python
"""
Test rapide de l'endpoint PFE
"""

import requests

def quick_test():
    print("⚡ Test rapide de l'endpoint PFE...")
    
    base_url = "http://localhost:8000/api"
    
    # Login
    login_data = {
        'email': 'stagiaire.complet@example.com',
        'password': 'test1234'
    }
    
    try:
        login_response = requests.post(f"{base_url}/auth/login/", json=login_data)
        if login_response.status_code == 200:
            token = login_response.json().get('access')
            
            # Test création rapport PFE
            pfe_data = {
                'title': 'Test Correction PFE',
                'abstract': 'Test de la correction',
                'keywords': 'test, correction',
                'speciality': 'Informatique',
                'year': 2025
            }
            
            create_response = requests.post(
                f"{base_url}/pfe-reports/create/",
                data=pfe_data,
                headers={'Authorization': f'Bearer {token}'}
            )
            
            print(f"Status: {create_response.status_code}")
            if create_response.status_code == 200 or create_response.status_code == 201:
                print("✅ SUCCÈS - Plus d'erreur 500 !")
            else:
                print(f"❌ Erreur: {create_response.text}")
        else:
            print(f"❌ Login failed: {login_response.status_code}")
    
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    quick_test() 