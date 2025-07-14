"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

#!/usr/bin/env python3
"""
Script de test complet pour le workflow RH (création + assignation de tuteur)
"""

import os
import sys
import django
from datetime import datetime, timedelta

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from django.contrib.auth import get_user_model
from demande_service.models import Demande
from shared.models import Stage, User
from rh_service.views import RHCreerStagiaireView, RHTuteursDisponiblesView, RHAssignerTuteurView
from rest_framework.test import APIRequestFactory
from rest_framework.test import force_authenticate
from rest_framework import status

User = get_user_model()

def test_rh_complete_workflow():
    """Test du workflow complet RH"""
    print("🧪 Test du workflow complet RH (création + assignation)")
    
    # Créer un utilisateur RH pour le test
    rh_user, created = User.objects.get_or_create(
        email='rh.workflow@example.com',
        defaults={
            'password': 'testpass123',
            'prenom': 'RH',
            'nom': 'Workflow',
            'role': 'rh'
        }
    )
    if created:
        rh_user.set_password('testpass123')
        rh_user.save()
    
    # Créer quelques tuteurs avec des emails uniques
    import time
    timestamp = int(time.time())
    
    tuteur1, created = User.objects.get_or_create(
        email=f'tuteur1.{timestamp}@example.com',
        defaults={
            'password': 'testpass123',
            'prenom': 'Tuteur',
            'nom': 'Un',
            'role': 'tuteur',
            'specialite': 'Informatique'
        }
    )
    if created:
        tuteur1.set_password('testpass123')
        tuteur1.save()
    
    tuteur2, created = User.objects.get_or_create(
        email=f'tuteur2.{timestamp}@example.com',
        defaults={
            'password': 'testpass123',
            'prenom': 'Tuteur',
            'nom': 'Deux',
            'role': 'tuteur',
            'specialite': 'Marketing'
        }
    )
    if created:
        tuteur2.set_password('testpass123')
        tuteur2.save()
    
    factory = APIRequestFactory()
    
    # ÉTAPE 1: Créer un stagiaire
    print("\n📝 ÉTAPE 1: Création d'un stagiaire")
    
    stagiaire_data = {
        'prenom': 'Marie',
        'nom': 'Martin',
        'email': f'marie.martin.{timestamp}@example.com',
        'telephone': '+33 6 98 76 54 32',
        'institut': 'École Supérieure de Commerce',
        'specialite': 'Marketing Digital',
        'niveau': 'Master',
        'type_stage': 'Stage PFE',
        'date_debut': (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d'),
        'date_fin': (datetime.now() + timedelta(days=120)).strftime('%Y-%m-%d'),
        'description': 'Stage en marketing digital et réseaux sociaux'
    }
    
    request1 = factory.post('/rh/creer-stagiaire/', stagiaire_data, format='json')
    force_authenticate(request1, user=rh_user)
    view1 = RHCreerStagiaireView.as_view()
    response1 = view1(request1)
    
    if response1.status_code == status.HTTP_201_CREATED:
        print("✅ Stagiaire créé avec succès")
        stagiaire_id = response1.data['stagiaire']['id']
        stage_id = response1.data['stage']['id']
        print(f"   ID Stagiaire: {stagiaire_id}")
        print(f"   ID Stage: {stage_id}")
    else:
        print("❌ Échec de création du stagiaire")
        return
    
    # ÉTAPE 2: Vérifier les tuteurs disponibles
    print("\n👥 ÉTAPE 2: Vérification des tuteurs disponibles")
    
    request2 = factory.get('/rh/tuteurs-disponibles/')
    force_authenticate(request2, user=rh_user)
    view2 = RHTuteursDisponiblesView.as_view()
    response2 = view2(request2)
    
    if response2.status_code == status.HTTP_200_OK:
        print("✅ Tuteurs disponibles récupérés")
        tuteurs = response2.data['results']
        print(f"   Nombre de tuteurs: {len(tuteurs)}")
        for tuteur in tuteurs:
            print(f"   - {tuteur['first_name']} {tuteur['last_name']} ({tuteur['stagiaires_assignes']}/5)")
    else:
        print("❌ Échec de récupération des tuteurs")
        return
    
    # ÉTAPE 3: Assigner un tuteur
    print("\n🔗 ÉTAPE 3: Assignation d'un tuteur")
    
    # Choisir le premier tuteur disponible
    tuteur_disponible = None
    for tuteur in tuteurs:
        if tuteur['stagiaires_assignes'] < 5:
            tuteur_disponible = tuteur
            break
    
    if tuteur_disponible:
        request3 = factory.post(f'/rh/stagiaires/{stagiaire_id}/assigner-tuteur/', 
                              {'tuteur_id': tuteur_disponible['id']}, format='json')
        force_authenticate(request3, user=rh_user)
        view3 = RHAssignerTuteurView.as_view()
        # Correction : passer stagiaire_id dans l'appel à la vue
        response3 = view3(request3, stagiaire_id=stagiaire_id)
        
        if response3.status_code == status.HTTP_200_OK:
            print("✅ Tuteur assigné avec succès")
            print(f"   Tuteur: {tuteur_disponible['first_name']} {tuteur_disponible['last_name']}")
            print(f"   Stagiaire: {stagiaire_data['prenom']} {stagiaire_data['nom']}")
        else:
            print("❌ Échec d'assignation du tuteur")
            print(f"   Erreur: {response3.data}")
    else:
        print("⚠️ Aucun tuteur disponible")
    
    # ÉTAPE 4: Vérifier l'assignation
    print("\n✅ ÉTAPE 4: Vérification de l'assignation")
    
    # Récupérer le stage mis à jour
    stage = Stage.objects.get(id=stage_id)
    if stage.tuteur:
        print(f"✅ Stage assigné au tuteur: {stage.tuteur.prenom} {stage.tuteur.nom}")
    else:
        print("❌ Stage non assigné")
    
    # Vérifier le nombre de stagiaires du tuteur
    if tuteur_disponible:
        tuteur_user = User.objects.get(id=tuteur_disponible['id'])
        stagiaires_count = Stage.objects.filter(tuteur=tuteur_user, status='active').count()
        print(f"   Nombre de stagiaires du tuteur: {stagiaires_count}")
    
    print("\n🎉 Workflow complet terminé!")

if __name__ == '__main__':
    test_rh_complete_workflow() 