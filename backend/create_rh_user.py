#!/usr/bin/env python
"""
Script pour créer un utilisateur RH
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from auth_service.models import User

def create_rh_user():
    print("👤 Création d'un utilisateur RH...")
    
    # Créer l'utilisateur RH
    rh_user, created = User.objects.get_or_create(
        email='rh.complet@example.com',
        defaults={
            'nom': 'RH',
            'prenom': 'Complet',
            'role': 'rh',
            'is_active': True
        }
    )
    
    if created:
        rh_user.set_password('test1234')
        rh_user.save()
        print(f"✅ Utilisateur RH créé: {rh_user.get_full_name()}")
    else:
        # Mettre à jour le mot de passe
        rh_user.set_password('test1234')
        rh_user.save()
        print(f"✅ Utilisateur RH existant mis à jour: {rh_user.get_full_name()}")
    
    print(f"   Email: {rh_user.email}")
    print(f"   Rôle: {rh_user.role}")
    print(f"   Mot de passe: test1234")
    print(f"   Actif: {rh_user.is_active}")

if __name__ == "__main__":
    create_rh_user() 