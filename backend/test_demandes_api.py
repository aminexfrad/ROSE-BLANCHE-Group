#!/usr/bin/env python
"""
Script pour tester l'endpoint des demandes
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

def test_demandes_api():
    print("Test de l'endpoint des demandes...")
    
    base_url = "http://localhost:8000/api"
    
    # Test 1: Vérifier les demandes dans la base de données
    print("\n1. Vérification des demandes dans la base de données...")
    demandes_count = Demande.objects.count()
    print(f"Nombre de demandes: {demandes_count}")
    
    if demandes_count > 0:
        demandes = Demande.objects.all()[:5]  # Afficher les 5 premières
        for demande in demandes:
            print(f"  - Demande {demande.id}: {demande.prenom} {demande.nom}")
            print(f"    Email: {demande.email}")
            print(f"    Statut: {demande.status}")
            print(f"    Type: {demande.type_stage}")
    
    # Test 2: Créer un utilisateur RH pour tester l'API
    print("\n2. Création d'un utilisateur RH de test...")
    rh_user, created = User.objects.get_or_create(
        email='rh.test@example.com',
        defaults={
            'nom': 'Test',
            'prenom': 'RH',
            'role': 'rh',
            'is_active': True
        }
    )
    
    if created:
        rh_user.set_password('test1234')
        rh_user.save()
        print(f"  ✅ Utilisateur RH créé: {rh_user.email}")
    else:
        print(f"  ℹ️  Utilisateur RH existant: {rh_user.email}")
    
    # Test 3: Test de l'API avec authentification
    print("\n3. Test de l'API avec authentification...")
    
    # Login
    login_data = {
        "email": "rh.test@example.com",
        "password": "test1234"
    }
    
    try:
        response = requests.post(f"{base_url}/auth/login/", json=login_data)
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get('access')
            print(f"  ✅ Login réussi")
            
            # Test de l'endpoint des demandes
            headers = {"Authorization": f"Bearer {access_token}"}
            demandes_response = requests.get(f"{base_url}/demandes/", headers=headers)
            
            if demandes_response.status_code == 200:
                demandes_data = demandes_response.json()
                print(f"  ✅ Demandes récupérées avec succès:")
                print(f"    - Nombre de demandes: {demandes_data.get('count', 0)}")
                print(f"    - Résultats: {len(demandes_data.get('results', []))}")
                
                # Afficher quelques demandes
                for i, demande in enumerate(demandes_data.get('results', [])[:3]):
                    print(f"    - Demande {i+1}: {demande.get('prenom')} {demande.get('nom')}")
                    print(f"      Email: {demande.get('email')}")
                    print(f"      Statut: {demande.get('status')}")
                    
            elif demandes_response.status_code == 403:
                print(f"  ❌ Permission refusée (403)")
                print(f"    Réponse: {demandes_response.text}")
            elif demandes_response.status_code == 404:
                print(f"  ❌ Endpoint non trouvé (404)")
                print(f"    Réponse: {demandes_response.text}")
            else:
                print(f"  ❌ Erreur API: {demandes_response.status_code}")
                print(f"    Réponse: {demandes_response.text}")
                
        else:
            print(f"  ❌ Échec du login: {response.status_code}")
            print(f"    Réponse: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print(f"  ❌ Impossible de se connecter au serveur Django")
        print(f"    Assurez-vous que le serveur Django fonctionne sur http://localhost:8000")
    except Exception as e:
        print(f"  ❌ Erreur lors du test: {str(e)}")

def check_demandes_data():
    print("\n=== Vérification des données de demandes ===")
    
    # Compter les demandes par statut
    demandes_pending = Demande.objects.filter(status='pending').count()
    demandes_approved = Demande.objects.filter(status='approved').count()
    demandes_rejected = Demande.objects.filter(status='rejected').count()
    
    print(f"Demandes en attente: {demandes_pending}")
    print(f"Demandes approuvées: {demandes_approved}")
    print(f"Demandes rejetées: {demandes_rejected}")
    
    # Vérifier les utilisateurs RH
    rh_users = User.objects.filter(role='rh')
    print(f"\nUtilisateurs RH: {rh_users.count()}")
    for user in rh_users:
        print(f"  - {user.prenom} {user.nom} ({user.email})")

if __name__ == '__main__':
    print("=== Test de l'endpoint des demandes ===")
    
    check_demandes_data()
    test_demandes_api()
    
    print("\n=== Test terminé ===") 