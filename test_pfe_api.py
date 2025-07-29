#!/usr/bin/env python
"""
Script de test pour l'API PFE
"""

import requests
import json

def test_pfe_api():
    base_url = "http://localhost:8000/api"
    
    # Test sans authentification d'abord
    try:
        response = requests.get(f"{base_url}/pfe-reports/")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 401:
            print("✅ API accessible mais authentification requise")
        elif response.status_code == 200:
            print("✅ API accessible et fonctionnelle")
        else:
            print(f"❌ Erreur: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Impossible de se connecter au serveur. Assurez-vous que le serveur Django est en cours d'exécution.")
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == '__main__':
    test_pfe_api() 