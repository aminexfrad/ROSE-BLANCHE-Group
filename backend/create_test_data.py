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
    
    # Créer un utilisateur stagiaire avec un email unique
    test_email = 'stagiaire.test@example.com'
    stagiaire, created = User.objects.get_or_create(
        email=test_email,
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
    
    # Vérifier s'il existe déjà une demande pour cet utilisateur
    existing_demande = Demande.objects.filter(email=test_email).first()
    if existing_demande:
        print(f"Demande existante trouvée: {existing_demande.id}")
        demande = existing_demande
    else:
        # Créer une nouvelle demande de stage
        demande = Demande.objects.create(
            nom='Test',
            prenom='Stagiaire',
            email=test_email,
            telephone='0123456789',
            cin='AB123456',
            institut='Institut Test',
            specialite='Informatique',
            type_stage='Stage PFE',
            niveau='Master',
            date_debut=date.today(),
            date_fin=date.today() + timedelta(days=90),
            stage_binome=False,
            status='approved',
            user_created=stagiaire
        )
        print(f"Demande de stage créée: {demande.id}")
    
    # Vérifier s'il existe déjà un stage pour cette demande
    existing_stage = Stage.objects.filter(demande=demande).first()
    if existing_stage:
        print(f"Stage existant trouvé: {existing_stage.id}")
        stage = existing_stage
    else:
        # Créer un nouveau stage
        stage = Stage.objects.create(
            demande=demande,
            stagiaire=stagiaire,
            title='Stage Test',
            description='Description du stage test',
            company='Rose Blanche Group',
            location='Tunis',
            start_date=date.today(),
            end_date=date.today() + timedelta(days=90),
            status='active',
            progress=50
        )
        print(f"Stage créé: {stage.id}")
    
    print("\nDonnées de test créées avec succès!")
    print(f"Email: {test_email}")
    print(f"Mot de passe: test1234")
    print(f"Stage ID: {stage.id}")
    
    return stagiaire, stage

if __name__ == '__main__':
    create_test_data() 