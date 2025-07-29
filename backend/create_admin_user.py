#!/usr/bin/env python
"""
Script pour créer un utilisateur admin
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from auth_service.models import User

def create_admin_user():
    print("👑 Création d'un utilisateur admin...")
    
    # Créer l'utilisateur admin
    admin_user, created = User.objects.get_or_create(
        email='admin@example.com',
        defaults={
            'nom': 'Admin',
            'prenom': 'Super',
            'role': 'admin',
            'is_active': True,
            'is_staff': True,
            'is_superuser': True
        }
    )
    
    if created:
        admin_user.set_password('admin')
        admin_user.save()
        print(f"✅ Utilisateur admin créé: {admin_user.get_full_name()}")
    else:
        # Mettre à jour le mot de passe
        admin_user.set_password('admin')
        admin_user.save()
        print(f"✅ Utilisateur admin existant mis à jour: {admin_user.get_full_name()}")
    
    print(f"   Email: {admin_user.email}")
    print(f"   Rôle: {admin_user.role}")
    print(f"   Mot de passe: admin")
    print(f"   Actif: {admin_user.is_active}")
    print(f"   Staff: {admin_user.is_staff}")
    print(f"   Superuser: {admin_user.is_superuser}")

if __name__ == "__main__":
    create_admin_user() 