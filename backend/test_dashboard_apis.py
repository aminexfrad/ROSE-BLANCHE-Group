#!/usr/bin/env python
"""
Script complet pour tester tous les endpoints du dashboard
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
from shared.models import Stage, PFEReport, Testimonial, Notification
from demande_service.models import Demande

def test_all_dashboard_apis():
    print("🔍 Test complet de tous les endpoints du dashboard...")
    
    base_url = "http://localhost:8000/api"
    
    # Créer un utilisateur de test pour tous les tests
    test_user, created = User.objects.get_or_create(
        email='dashboard.test@example.com',
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
        print(f"✅ Utilisateur de test créé: {test_user.email}")
    else:
        print(f"✅ Utilisateur de test existant: {test_user.email}")
    
    # Login
    login_data = {
        'email': 'dashboard.test@example.com',
        'password': 'test1234'
    }
    
    try:
        login_response = requests.post(f"{base_url}/auth/login/", json=login_data)
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            token = login_result.get('token')
            print(f"✅ Login réussi pour {test_user.email}")
            
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }
            
            # Test 1: Dashboard Stats
            print("\n📊 1. Test Dashboard Stats...")
            stats_response = requests.get(f"{base_url}/dashboard/stats/", headers=headers)
            print(f"   Status: {stats_response.status_code}")
            if stats_response.status_code == 200:
                print("   ✅ Dashboard Stats OK")
            else:
                print(f"   ❌ Erreur: {stats_response.text}")
            
            # Test 2: Stages
            print("\n📋 2. Test Stages...")
            stages_response = requests.get(f"{base_url}/stages/", headers=headers)
            print(f"   Status: {stages_response.status_code}")
            if stages_response.status_code == 200:
                stages_data = stages_response.json()
                print(f"   ✅ Stages OK - {len(stages_data.get('results', []))} stages")
            else:
                print(f"   ❌ Erreur: {stages_response.text}")
            
            # Test 3: My Internship
            print("\n🎯 3. Test My Internship...")
            internship_response = requests.get(f"{base_url}/stages/my-internship/", headers=headers)
            print(f"   Status: {internship_response.status_code}")
            if internship_response.status_code == 200:
                print("   ✅ My Internship OK")
            else:
                print(f"   ❌ Erreur: {internship_response.text}")
            
            # Test 4: Steps
            print("\n📝 4. Test Steps...")
            steps_response = requests.get(f"{base_url}/steps/", headers=headers)
            print(f"   Status: {steps_response.status_code}")
            if steps_response.status_code == 200:
                steps_data = steps_response.json()
                print(f"   ✅ Steps OK - {len(steps_data.get('results', []))} steps")
            else:
                print(f"   ❌ Erreur: {steps_response.text}")
            
            # Test 5: Documents
            print("\n📄 5. Test Documents...")
            documents_response = requests.get(f"{base_url}/documents/", headers=headers)
            print(f"   Status: {documents_response.status_code}")
            if documents_response.status_code == 200:
                documents_data = documents_response.json()
                print(f"   ✅ Documents OK - {len(documents_data.get('results', []))} documents")
            else:
                print(f"   ❌ Erreur: {documents_response.text}")
            
            # Test 6: Evaluations
            print("\n📈 6. Test Evaluations...")
            evaluations_response = requests.get(f"{base_url}/evaluations/", headers=headers)
            print(f"   Status: {evaluations_response.status_code}")
            if evaluations_response.status_code == 200:
                evaluations_data = evaluations_response.json()
                print(f"   ✅ Evaluations OK - {len(evaluations_data.get('results', []))} evaluations")
            else:
                print(f"   ❌ Erreur: {evaluations_response.text}")
            
            # Test 7: Testimonials
            print("\n💬 7. Test Testimonials...")
            testimonials_response = requests.get(f"{base_url}/testimonials/", headers=headers)
            print(f"   Status: {testimonials_response.status_code}")
            if testimonials_response.status_code == 200:
                testimonials_data = testimonials_response.json()
                print(f"   ✅ Testimonials OK - {len(testimonials_data.get('results', []))} testimonials")
            else:
                print(f"   ❌ Erreur: {testimonials_response.text}")
            
            # Test 8: Notifications
            print("\n🔔 8. Test Notifications...")
            notifications_response = requests.get(f"{base_url}/notifications/", headers=headers)
            print(f"   Status: {notifications_response.status_code}")
            if notifications_response.status_code == 200:
                notifications_data = notifications_response.json()
                print(f"   ✅ Notifications OK - {len(notifications_data.get('results', []))} notifications")
            else:
                print(f"   ❌ Erreur: {notifications_response.text}")
            
            # Test 9: PFE Reports
            print("\n📚 9. Test PFE Reports...")
            pfe_response = requests.get(f"{base_url}/pfe-reports/", headers=headers)
            print(f"   Status: {pfe_response.status_code}")
            if pfe_response.status_code == 200:
                pfe_data = pfe_response.json()
                print(f"   ✅ PFE Reports OK - {len(pfe_data.get('results', []))} reports")
            else:
                print(f"   ❌ Erreur: {pfe_response.text}")
            
            # Test 10: Profile
            print("\n👤 10. Test Profile...")
            profile_response = requests.get(f"{base_url}/auth/profile/", headers=headers)
            print(f"   Status: {profile_response.status_code}")
            if profile_response.status_code == 200:
                print("   ✅ Profile OK")
            else:
                print(f"   ❌ Erreur: {profile_response.text}")
                
        else:
            print(f"❌ Échec du login: {login_response.status_code}")
            print(f"   Réponse: {login_response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Impossible de se connecter au serveur Django")
        print("   Assurez-vous que le serveur Django est démarré sur http://localhost:8000")
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    test_all_dashboard_apis() 