#!/usr/bin/env python
"""
Vérification de l'utilisateur admin
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from auth_service.models import User

def check_admin_user():
    print("👑 Vérification de l'utilisateur admin...")
    
    # Vérifier si l'admin existe
    admin_user = User.objects.filter(email='admin@example.com').first()
    
    if admin_user:
        print(f"✅ Utilisateur admin trouvé:")
        print(f"   Email: {admin_user.email}")
        print(f"   Nom: {admin_user.nom}")
        print(f"   Prénom: {admin_user.prenom}")
        print(f"   Rôle: {admin_user.role}")
        print(f"   Actif: {admin_user.is_active}")
        print(f"   Staff: {admin_user.is_staff}")
        print(f"   Superuser: {admin_user.is_superuser}")
        
        # Tester le mot de passe
        if admin_user.check_password('admin'):
            print(f"   ✅ Mot de passe correct")
        else:
            print(f"   ❌ Mot de passe incorrect")
            # Corriger le mot de passe
            admin_user.set_password('admin')
            admin_user.save()
            print(f"   🔧 Mot de passe corrigé")
    else:
        print("❌ Utilisateur admin non trouvé")
        # Créer l'admin
        admin_user = User.objects.create(
            email='admin@example.com',
            nom='Admin',
            prenom='Super',
            role='admin',
            is_active=True,
            is_staff=True,
            is_superuser=True
        )
        admin_user.set_password('admin')
        admin_user.save()
        print("✅ Utilisateur admin créé")

if __name__ == "__main__":
    check_admin_user() 