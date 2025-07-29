#!/usr/bin/env python
"""
Script pour corriger les problèmes d'authentification
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

def fix_authentication():
    print("🔧 Correction des problèmes d'authentification...")
    
    base_url = "http://localhost:8000/api"
    
    # Créer un utilisateur de test avec un stage actif
    test_user, created = User.objects.get_or_create(
        email='test.dashboard@example.com',
        defaults={
            'nom': 'Test',
            'prenom': 'Dashboard',
            'role': 'stagiaire',
            'is_active': True
        }
    )
    
    if created:
        test_user.set_password('test1234')
        test_user.save()
        print(f"✅ Utilisateur créé: {test_user.email}")
        
        # Créer une demande pour cet utilisateur
        demande, demande_created = Demande.objects.get_or_create(
            email=test_user.email,
            defaults={
                'nom': test_user.nom,
                'prenom': test_user.prenom,
                'telephone': '0123456789',
                'cin': 'AB123456',
                'institut': 'Institut Test',
                'specialite': 'Informatique',
                'type_stage': 'PFE',
                'niveau': 'Master',
                'date_debut': '2025-01-01',
                'date_fin': '2025-06-30',
                'stage_binome': False,
                'status': 'approved'
            }
        )
        
        if demande_created:
            print(f"✅ Demande créée pour {test_user.email}")
        else:
            print(f"✅ Demande existante pour {test_user.email}")
        
        # Créer un stage actif pour cet utilisateur
        stage, stage_created = Stage.objects.get_or_create(
            demande=demande,
            defaults={
                'stagiaire': test_user,
                'title': 'Stage Test Dashboard',
                'company': 'Entreprise Test',
                'location': 'Paris',
                'start_date': '2025-01-01',
                'end_date': '2025-06-30',
                'status': 'active',
                'progress': 50
            }
        )
        
        if stage_created:
            print(f"✅ Stage créé: {stage.title}")
        else:
            print(f"✅ Stage existant: {stage.title}")
    else:
        print(f"✅ Utilisateur existant: {test_user.email}")
    
    # Test de login avec token
    print("\n🔐 Test d'authentification...")
    
    login_data = {
        'email': 'test.dashboard@example.com',
        'password': 'test1234'
    }
    
    try:
        # Test 1: Login
        login_response = requests.post(f"{base_url}/auth/login/", json=login_data)
        print(f"Login status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            token = login_result.get('access')  # Changé de 'token' à 'access'
            print(f"✅ Login réussi")
            print(f"   Token: {token[:50]}...")
            
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }
            
            # Test 2: Profile
            print("\n👤 Test Profile...")
            profile_response = requests.get(f"{base_url}/auth/profile/", headers=headers)
            print(f"   Profile status: {profile_response.status_code}")
            if profile_response.status_code == 200:
                print("   ✅ Profile OK")
            else:
                print(f"   ❌ Profile error: {profile_response.text}")
            
            # Test 3: Dashboard Stats
            print("\n📊 Test Dashboard Stats...")
            stats_response = requests.get(f"{base_url}/stats/", headers=headers)
            print(f"   Stats status: {stats_response.status_code}")
            if stats_response.status_code == 200:
                print("   ✅ Stats OK")
            else:
                print(f"   ❌ Stats error: {stats_response.text}")
            
            # Test 4: My Internship
            print("\n🎯 Test My Internship...")
            internship_response = requests.get(f"{base_url}/stages/my-internship/", headers=headers)
            print(f"   Internship status: {internship_response.status_code}")
            if internship_response.status_code == 200:
                print("   ✅ My Internship OK")
            else:
                print(f"   ❌ Internship error: {internship_response.text}")
            
            # Test 5: PFE Reports
            print("\n📚 Test PFE Reports...")
            pfe_response = requests.get(f"{base_url}/pfe-reports/", headers=headers)
            print(f"   PFE Reports status: {pfe_response.status_code}")
            if pfe_response.status_code == 200:
                pfe_data = pfe_response.json()
                print(f"   ✅ PFE Reports OK - {len(pfe_data.get('results', []))} reports")
            else:
                print(f"   ❌ PFE Reports error: {pfe_response.text}")
                
        else:
            print(f"❌ Login failed: {login_response.status_code}")
            print(f"   Response: {login_response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Impossible de se connecter au serveur Django")
        print("   Assurez-vous que le serveur Django est démarré sur http://localhost:8000")
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    fix_authentication() 