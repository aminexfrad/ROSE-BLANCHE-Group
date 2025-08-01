#!/usr/bin/env python
"""
Script pour créer un stage actif pour un utilisateur spécifique
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

def create_stage_for_user(email):
    print(f"Création d'un stage actif pour {email}...")
    
    # Trouver l'utilisateur
    user = User.objects.filter(email=email, role='stagiaire').first()
    if not user:
        print(f"❌ Utilisateur {email} non trouvé ou n'est pas un stagiaire")
        return None
    
    print(f"✅ Utilisateur trouvé: {user.prenom} {user.nom}")
    
    # Vérifier s'il a déjà un stage actif
    existing_stage = Stage.objects.filter(stagiaire=user, status='active').first()
    if existing_stage:
        print(f"ℹ️  L'utilisateur a déjà un stage actif: {existing_stage.title}")
        return existing_stage
    
    # Créer une demande de stage
    demande = Demande.objects.create(
        nom=user.nom,
        prenom=user.prenom,
        email=user.email,
        telephone=user.telephone or '0123456789',
        cin=f"CIN{user.id:06d}",
        institut=user.institut or 'Institut Test',
        specialite=user.specialite or 'Informatique',
        type_stage='Stage PFE',
        niveau='Master',
        date_debut=date.today(),
        date_fin=date.today() + timedelta(days=90),
        stage_binome=False,
        status='approved',
        user_created=user
    )
    
    print(f"✅ Demande créée: {demande.id}")
    
    # Créer un stage actif
    stage = Stage.objects.create(
        demande=demande,
        stagiaire=user,
        title=f'Stage {user.prenom} {user.nom}',
        description=f'Stage de {user.prenom} {user.nom}',
        company='Rose Blanche Group',
        location='Tunis',
        start_date=date.today(),
        end_date=date.today() + timedelta(days=90),
        status='active',
        progress=30
    )
    
    print(f"✅ Stage créé: {stage.id}")
    print(f"   Titre: {stage.title}")
    print(f"   Entreprise: {stage.company}")
    print(f"   Progression: {stage.progress}%")
    
    return stage

def list_users_without_stages():
    print("\n=== Utilisateurs sans stage actif ===")
    
    stagiaires = User.objects.filter(role='stagiaire')
    users_without_stages = []
    
    for stagiaire in stagiaires:
        has_active_stage = Stage.objects.filter(stagiaire=stagiaire, status='active').exists()
        if not has_active_stage:
            users_without_stages.append(stagiaire)
            print(f"  - {stagiaire.prenom} {stagiaire.nom} ({stagiaire.email})")
    
    print(f"\nTotal: {len(users_without_stages)} utilisateurs sans stage actif")
    return users_without_stages

def create_stages_for_all_users():
    print("\n=== Création de stages pour tous les utilisateurs sans stage ===")
    
    users_without_stages = list_users_without_stages()
    
    if not users_without_stages:
        print("✅ Tous les utilisateurs ont déjà un stage actif")
        return
    
    for user in users_without_stages:
        print(f"\nCréation de stage pour {user.email}...")
        create_stage_for_user(user.email)

if __name__ == '__main__':
    print("=== Création de stages actifs ===")
    
    # Option 1: Créer un stage pour un utilisateur spécifique
    # email = "votre.email@example.com"  # Remplacez par votre email
    # create_stage_for_user(email)
    
    # Option 2: Créer des stages pour tous les utilisateurs sans stage
    create_stages_for_all_users()
    
    print("\n=== Instructions ===")
    print("1. Connectez-vous avec l'utilisateur de test:")
    print("   Email: stagiaire.test@example.com")
    print("   Mot de passe: test1234")
    print("2. Ou utilisez votre email si un stage a été créé pour vous")
    print("3. Vous devriez maintenant voir votre stage actif dans le tableau de bord") 