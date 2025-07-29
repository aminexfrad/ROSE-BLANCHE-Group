#!/usr/bin/env python
"""
Script pour créer un stage actif pour l'utilisateur de test
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from auth_service.models import User
from shared.models import Stage
from demande_service.models import Demande

def create_stage_for_test_user():
    print("🔧 Création d'un stage actif pour l'utilisateur de test...")
    
    # Trouver l'utilisateur de test
    test_user = User.objects.filter(email='test.dashboard@example.com').first()
    if not test_user:
        print("❌ Utilisateur de test non trouvé")
        return
    
    print(f"✅ Utilisateur trouvé: {test_user.email}")
    
    # Créer une demande si elle n'existe pas
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
    
    # Créer un stage actif
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
        print(f"   Statut: {stage.status}")
        print(f"   Progression: {stage.progress}%")
    else:
        print(f"✅ Stage existant: {stage.title}")
        print(f"   Statut: {stage.status}")
        print(f"   Progression: {stage.progress}%")
    
    # Vérifier que le stage est bien actif
    active_stages = Stage.objects.filter(stagiaire=test_user, status='active')
    print(f"\n📊 Résumé:")
    print(f"   Stages actifs pour {test_user.email}: {active_stages.count()}")

if __name__ == "__main__":
    create_stage_for_test_user() 