#!/usr/bin/env python
"""
Script pour corriger le mot de passe de l'utilisateur de test et vérifier l'API
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

def fix_test_user():
    print("Correction de l'utilisateur de test...")
    
    # Trouver l'utilisateur avec le stage actif
    stage_actif = Stage.objects.filter(status='active').first()
    if not stage_actif:
        print("❌ Aucun stage actif trouvé")
        return
    
    stagiaire = stage_actif.stagiaire
    print(f"Utilisateur trouvé: {stagiaire.email}")
    
    # Définir un mot de passe simple
    password = "test1234"
    stagiaire.set_password(password)
    stagiaire.save()
    
    print(f"✅ Mot de passe mis à jour pour {stagiaire.email}")
    print(f"   Email: {stagiaire.email}")
    print(f"   Mot de passe: {password}")
    print(f"   Stage ID: {stage_actif.id}")
    print(f"   Stage titre: {stage_actif.title}")
    print(f"   Entreprise: {stage_actif.company}")
    
    return stagiaire, stage_actif

def test_login():
    print("\nTest de connexion...")
    
    stage_actif = Stage.objects.filter(status='active').first()
    if not stage_actif:
        print("❌ Aucun stage actif trouvé")
        return
    
    stagiaire = stage_actif.stagiaire
    
    # Test de connexion avec Django
    from django.contrib.auth import authenticate
    
    user = authenticate(email=stagiaire.email, password="test1234")
    if user:
        print(f"✅ Authentification réussie pour {user.email}")
        print(f"   Rôle: {user.role}")
        print(f"   Nom: {user.prenom} {user.nom}")
    else:
        print(f"❌ Échec de l'authentification pour {stagiaire.email}")

if __name__ == '__main__':
    print("=== Correction de l'utilisateur de test ===")
    
    fix_test_user()
    test_login()
    
    print("\n=== Instructions pour tester ===")
    print("1. Assurez-vous que le serveur Django fonctionne: python manage.py runserver")
    print("2. Connectez-vous avec:")
    print("   Email: stagiaire.test@example.com")
    print("   Mot de passe: test1234")
    print("3. Vous devriez voir votre stage actif dans le tableau de bord") 