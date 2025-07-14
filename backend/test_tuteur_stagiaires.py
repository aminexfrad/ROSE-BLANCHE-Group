"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

#!/usr/bin/env python3
"""
Script de test pour vérifier que les tuteurs peuvent voir leurs stagiaires assignés
"""

import os
import sys
import django
from datetime import datetime, timedelta

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from django.contrib.auth import get_user_model
from shared.models import Stage, User
from demande_service.models import Demande
from tuteur_service.views import TuteurStagiairesView
from rest_framework.test import APIRequestFactory
from rest_framework.test import force_authenticate
from rest_framework import status

User = get_user_model()

def test_tuteur_stagiaires():
    """Test de récupération des stagiaires par un tuteur"""
    print("🧪 Test de récupération des stagiaires par un tuteur")
    
    # Créer un tuteur
    tuteur, created = User.objects.get_or_create(
        email='tuteur.test@example.com',
        defaults={
            'password': 'testpass123',
            'prenom': 'Tuteur',
            'nom': 'Test',
            'role': 'tuteur',
            'specialite': 'Informatique'
        }
    )
    if created:
        tuteur.set_password('testpass123')
        tuteur.save()
    
    # Créer quelques stagiaires
    import time
    timestamp = int(time.time())
    
    stagiaire1, created = User.objects.get_or_create(
        email=f'stagiaire1.{timestamp}@example.com',
        defaults={
            'password': 'testpass123',
            'prenom': 'Stagiaire',
            'nom': 'Un',
            'role': 'stagiaire',
            'institut': 'ISET Sousse',
            'specialite': 'Informatique'
        }
    )
    if created:
        stagiaire1.set_password('testpass123')
        stagiaire1.save()
    
    stagiaire2, created = User.objects.get_or_create(
        email=f'stagiaire2.{timestamp}@example.com',
        defaults={
            'password': 'testpass123',
            'prenom': 'Stagiaire',
            'nom': 'Deux',
            'role': 'stagiaire',
            'institut': 'ISET Nabeul',
            'specialite': 'Marketing'
        }
    )
    if created:
        stagiaire2.set_password('testpass123')
        stagiaire2.save()
    
    # Créer des demandes pour les stages
    demande1, created = Demande.objects.get_or_create(
        email=stagiaire1.email,
        defaults={
            'nom': stagiaire1.nom,
            'prenom': stagiaire1.prenom,
            'telephone': stagiaire1.telephone,
            'cin': f"CIN{stagiaire1.id:06d}",
            'institut': stagiaire1.institut,
            'specialite': stagiaire1.specialite,
            'niveau': 'Master',
            'type_stage': 'Stage PFE',
            'date_debut': datetime.now().date(),
            'date_fin': (datetime.now() + timedelta(days=90)).date(),
            'stage_binome': False,
            'status': 'approved',
            'user_created': stagiaire1
        }
    )
    
    demande2, created = Demande.objects.get_or_create(
        email=stagiaire2.email,
        defaults={
            'nom': stagiaire2.nom,
            'prenom': stagiaire2.prenom,
            'telephone': stagiaire2.telephone,
            'cin': f"CIN{stagiaire2.id:06d}",
            'institut': stagiaire2.institut,
            'specialite': stagiaire2.specialite,
            'niveau': 'Master',
            'type_stage': 'Stage Marketing',
            'date_debut': datetime.now().date(),
            'date_fin': (datetime.now() + timedelta(days=120)).date(),
            'stage_binome': False,
            'status': 'approved',
            'user_created': stagiaire2
        }
    )
    
    # Créer des stages assignés au tuteur
    stage1, created = Stage.objects.get_or_create(
        demande=demande1,
        defaults={
            'stagiaire': stagiaire1,
            'title': f'Stage PFE - {stagiaire1.prenom} {stagiaire1.nom}',
            'company': 'Entreprise Test 1',
            'location': 'Sousse',
            'start_date': datetime.now().date(),
            'end_date': (datetime.now() + timedelta(days=90)).date(),
            'status': 'active',
            'progress': 25,
            'tuteur': tuteur
        }
    )
    if created:
        stage1.tuteur = tuteur
        stage1.save()
    
    stage2, created = Stage.objects.get_or_create(
        demande=demande2,
        defaults={
            'stagiaire': stagiaire2,
            'title': f'Stage Marketing - {stagiaire2.prenom} {stagiaire2.nom}',
            'company': 'Entreprise Test 2',
            'location': 'Nabeul',
            'start_date': datetime.now().date(),
            'end_date': (datetime.now() + timedelta(days=120)).date(),
            'status': 'active',
            'progress': 60,
            'tuteur': tuteur
        }
    )
    if created:
        stage2.tuteur = tuteur
        stage2.save()
    
    # Tester l'API
    factory = APIRequestFactory()
    request = factory.get('/tuteur/stagiaires/')
    force_authenticate(request, user=tuteur)
    view = TuteurStagiairesView.as_view()
    response = view(request)
    
    print(f"📊 Statut de la réponse: {response.status_code}")
    
    if response.status_code == status.HTTP_200_OK:
        print("✅ Stagiaires récupérés avec succès")
        data = response.data
        print(f"   Nombre de stagiaires: {data['count']}")
        
        for stagiaire in data['results']:
            print(f"   - {stagiaire['stagiaire']['first_name']} {stagiaire['stagiaire']['last_name']}")
            print(f"     Email: {stagiaire['stagiaire']['email']}")
            print(f"     Institut: {stagiaire['stagiaire']['institut']}")
            print(f"     Progression: {stagiaire['progress']}%")
            print(f"     Note: {stagiaire['note']}/5")
            print(f"     Documents en attente: {stagiaire['documentsEnAttente']}")
            print()
    else:
        print("❌ Échec de récupération des stagiaires")
        print(f"   Erreur: {response.data}")
    
    # Test avec un utilisateur non-tuteur
    print("\n🧪 Test avec un utilisateur non-tuteur...")
    stagiaire_user = User.objects.create_user(
        email='stagiaire.test@example.com',
        password='testpass123',
        prenom='Stagiaire',
        nom='Test',
        role='stagiaire'
    )
    
    request2 = factory.get('/tuteur/stagiaires/')
    force_authenticate(request2, user=stagiaire_user)
    response2 = view(request2)
    
    if response2.status_code == status.HTTP_403_FORBIDDEN:
        print("✅ Permission correctement refusée pour utilisateur non-tuteur")
    else:
        print("❌ Permission incorrectement accordée")
    
    print("\n🎉 Tests terminés!")

if __name__ == '__main__':
    test_tuteur_stagiaires() 