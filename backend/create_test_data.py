#!/usr/bin/env python
"""
Script pour créer des données de test pour les témoignages
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from auth_service.models import User
from demande_service.models import Demande
from shared.models import Stage
from datetime import date, timedelta

def create_test_data():
    print("Création des données de test...")
    
    # Créer un utilisateur stagiaire
    stagiaire, created = User.objects.get_or_create(
        email='stagiaire@test.com',
        defaults={
            'nom': 'Test',
            'prenom': 'Stagiaire',
            'role': 'stagiaire',
            'is_active': True
        }
    )
    
    # Always set the password (for new or existing users)
    stagiaire.set_password('test1234')
    stagiaire.save()
    if created:
        print(f"Utilisateur stagiaire créé: {stagiaire.email}")
    else:
        print(f"Utilisateur stagiaire existant: {stagiaire.email}")
    
    # Créer une demande de stage
    demande, created = Demande.objects.get_or_create(
        email='stagiaire@test.com',
        defaults={
            'nom': 'Test',
            'prenom': 'Stagiaire',
            'telephone': '0123456789',
            'cin': 'AB123456',
            'institut': 'Institut Test',
            'specialite': 'Informatique',
            'type_stage': 'PFE',
            'niveau': 'Master',
            'date_debut': date.today(),
            'date_fin': date.today() + timedelta(days=90),
            'stage_binome': False,
            'status': 'approved'
        }
    )
    
    if created:
        print(f"Demande de stage créée: {demande.id}")
    else:
        print(f"Demande de stage existante: {demande.id}")
    
    # Créer un stage
    stage, created = Stage.objects.get_or_create(
        demande=demande,
        defaults={
            'stagiaire': stagiaire,
            'title': 'Stage Test',
            'description': 'Description du stage test',
            'company': 'Entreprise Test',
            'location': 'Casablanca',
            'start_date': date.today(),
            'end_date': date.today() + timedelta(days=90),
            'status': 'active',
            'progress': 50
        }
    )
    
    if created:
        print(f"Stage créé: {stage.id}")
    else:
        print(f"Stage existant: {stage.id}")
    
    print("\nDonnées de test créées avec succès!")
    print(f"Email: stagiaire@test.com")
    print(f"Mot de passe: test123")
    print(f"Stage ID: {stage.id}")
    
    return stagiaire, stage

if __name__ == '__main__':
    create_test_data() 