#!/usr/bin/env python
"""
Script pour corriger le mot de passe d'un utilisateur spécifique
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from auth_service.models import User

def fix_user_password(email, new_password="test1234"):
    print(f"Correction du mot de passe pour {email}...")
    
    # Trouver l'utilisateur
    user = User.objects.filter(email=email).first()
    if not user:
        print(f"❌ Utilisateur {email} non trouvé")
        return None
    
    print(f"✅ Utilisateur trouvé: {user.prenom} {user.nom}")
    print(f"   Rôle: {user.role}")
    
    # Définir le nouveau mot de passe
    user.set_password(new_password)
    user.save()
    
    print(f"✅ Mot de passe mis à jour pour {email}")
    print(f"   Email: {email}")
    print(f"   Mot de passe: {new_password}")
    
    return user

def list_all_stagiaires():
    print("\n=== Liste de tous les stagiaires ===")
    
    stagiaires = User.objects.filter(role='stagiaire')
    for stagiaire in stagiaires:
        print(f"  - {stagiaire.prenom} {stagiaire.nom} ({stagiaire.email})")
    
    return stagiaires

if __name__ == '__main__':
    print("=== Correction des mots de passe ===")
    
    # Liste des utilisateurs populaires à corriger
    popular_users = [
        "frad.amine2025@gmail.com",
        "stagiaire.test@example.com",
        "stagiaire@test.com",
        "stagiaire1@test.com",
        "stagiaire2@test.com",
        "stagiaire3@test.com",
        "test@example.com",
        "stagiaire1@stagebloom.com",
        "stagiaire2@stagebloom.com",
        "stagiaire3@stagebloom.com",
        "stagiaire4@stagebloom.com",
        "stagiaire5@stagebloom.com"
    ]
    
    for email in popular_users:
        fix_user_password(email)
    
    print("\n=== Instructions ===")
    print("Vous pouvez maintenant vous connecter avec n'importe lequel de ces utilisateurs:")
    print("Mot de passe: test1234")
    print("\nExemples d'emails:")
    print("  - frad.amine2025@gmail.com")
    print("  - stagiaire.test@example.com")
    print("  - stagiaire1@test.com")
    print("  - stagiaire1@stagebloom.com")
    print("\nTous ces utilisateurs ont maintenant un stage actif !") 