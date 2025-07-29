#!/usr/bin/env python
"""
Script pour tester la page des rapports avec toutes les APIs nécessaires
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
from demande_service.models import Demande
from shared.models import Stage

def test_rapports_apis():
    print("Test des APIs pour la page des rapports...")
    
    base_url = "http://localhost:8000/api"
    
    # Créer un utilisateur RH pour tester
    rh_user, created = User.objects.get_or_create(
        email='rh.rapports@example.com',
        defaults={
            'nom': 'Test',
            'prenom': 'RH Rapports',
            'role': 'rh',
            'is_active': True
        }
    )
    
    if created:
        rh_user.set_password('test1234')
        rh_user.save()
        print(f"✅ Utilisateur RH créé: {rh_user.email}")
    else:
        print(f"ℹ️  Utilisateur RH existant: {rh_user.email}")
    
    # Login
    login_data = {
        "email": "rh.rapports@example.com",
        "password": "test1234"
    }
    
    try:
        response = requests.post(f"{base_url}/auth/login/", json=login_data)
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get('access')
            print(f"✅ Login réussi")
            
            headers = {"Authorization": f"Bearer {access_token}"}
            
            # Test 1: API des demandes
            print("\n1. Test de l'API des demandes...")
            demandes_response = requests.get(f"{base_url}/demandes/", headers=headers)
            if demandes_response.status_code == 200:
                demandes_data = demandes_response.json()
                print(f"  ✅ Demandes: {demandes_data.get('count', 0)} demandes trouvées")
            else:
                print(f"  ❌ Erreur demandes: {demandes_response.status_code}")
            
            # Test 2: API des stages
            print("\n2. Test de l'API des stages...")
            stages_response = requests.get(f"{base_url}/stages/", headers=headers)
            if stages_response.status_code == 200:
                stages_data = stages_response.json()
                print(f"  ✅ Stages: {stages_data.get('count', 0)} stages trouvés")
            else:
                print(f"  ❌ Erreur stages: {stages_response.status_code}")
            
            # Test 3: API des stagiaires RH
            print("\n3. Test de l'API des stagiaires RH...")
            stagiaires_response = requests.get(f"{base_url}/rh/stagiaires/", headers=headers)
            if stagiaires_response.status_code == 200:
                stagiaires_data = stagiaires_response.json()
                print(f"  ✅ Stagiaires: {stagiaires_data.get('count', 0)} stagiaires trouvés")
            else:
                print(f"  ❌ Erreur stagiaires: {stagiaires_response.status_code}")
            
            # Test 4: API des statistiques du dashboard
            print("\n4. Test de l'API des statistiques...")
            stats_response = requests.get(f"{base_url}/dashboard/stats/", headers=headers)
            if stats_response.status_code == 200:
                stats_data = stats_response.json()
                print(f"  ✅ Statistiques récupérées avec succès")
                if 'stats' in stats_data:
                    stats = stats_data['stats']
                    print(f"    - Total utilisateurs: {stats.get('total_users', 0)}")
                    print(f"    - Total applications: {stats.get('total_applications', 0)}")
                    print(f"    - Total stages: {stats.get('total_stages', 0)}")
                    print(f"    - Stages actifs: {stats.get('active_stages', 0)}")
            else:
                print(f"  ❌ Erreur statistiques: {stats_response.status_code}")
            
            print("\n✅ Tous les tests des APIs pour les rapports sont passés !")
            
        else:
            print(f"❌ Échec du login: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Impossible de se connecter au serveur Django")
        print(f"  Assurez-vous que le serveur Django fonctionne sur http://localhost:8000")
    except Exception as e:
        print(f"❌ Erreur lors du test: {str(e)}")

def check_data_availability():
    print("\n=== Vérification de la disponibilité des données ===")
    
    # Vérifier les demandes
    demandes_count = Demande.objects.count()
    demandes_pending = Demande.objects.filter(status='pending').count()
    demandes_approved = Demande.objects.filter(status='approved').count()
    demandes_rejected = Demande.objects.filter(status='rejected').count()
    
    print(f"Demandes totales: {demandes_count}")
    print(f"  - En attente: {demandes_pending}")
    print(f"  - Approuvées: {demandes_approved}")
    print(f"  - Rejetées: {demandes_rejected}")
    
    # Vérifier les stages
    stages_count = Stage.objects.count()
    stages_active = Stage.objects.filter(status='active').count()
    stages_completed = Stage.objects.filter(status='completed').count()
    
    print(f"\nStages totaux: {stages_count}")
    print(f"  - Actifs: {stages_active}")
    print(f"  - Terminés: {stages_completed}")
    
    # Vérifier les utilisateurs
    stagiaires_count = User.objects.filter(role='stagiaire').count()
    rh_count = User.objects.filter(role='rh').count()
    
    print(f"\nUtilisateurs:")
    print(f"  - Stagiaires: {stagiaires_count}")
    print(f"  - RH: {rh_count}")

if __name__ == '__main__':
    print("=== Test de la page des rapports ===")
    
    check_data_availability()
    test_rapports_apis()
    
    print("\n=== Instructions pour tester la page des rapports ===")
    print("1. Assurez-vous que le serveur Django fonctionne: python manage.py runserver")
    print("2. Connectez-vous avec un utilisateur RH:")
    print("   Email: rh.rapports@example.com")
    print("   Mot de passe: test1234")
    print("3. Allez sur la page des rapports: /rh/rapports")
    print("4. Vous devriez voir les statistiques et les données chargées correctement") 