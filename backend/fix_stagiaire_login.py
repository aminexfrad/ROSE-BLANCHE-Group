#!/usr/bin/env python
"""
Script pour corriger le problème de login du stagiaire
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from auth_service.models import User

def fix_stagiaire_login():
    print("🔧 Correction du problème de login du stagiaire...")
    
    # Trouver le stagiaire
    stagiaire = User.objects.filter(email='stagiaire.complet@example.com').first()
    if not stagiaire:
        print("❌ Stagiaire non trouvé")
        return
    
    print(f"✅ Stagiaire trouvé: {stagiaire.email}")
    print(f"   Nom: {stagiaire.nom} {stagiaire.prenom}")
    print(f"   Rôle: {stagiaire.role}")
    print(f"   Actif: {stagiaire.is_active}")
    
    # Vérifier le mot de passe
    if stagiaire.check_password('test1234'):
        print("✅ Mot de passe correct")
    else:
        print("❌ Mot de passe incorrect, correction...")
        stagiaire.set_password('test1234')
        stagiaire.save()
        print("✅ Mot de passe corrigé")
    
    # Vérifier que l'utilisateur est actif
    if not stagiaire.is_active:
        print("❌ Utilisateur inactif, activation...")
        stagiaire.is_active = True
        stagiaire.save()
        print("✅ Utilisateur activé")
    
    print(f"\n📋 Résumé:")
    print(f"   Email: {stagiaire.email}")
    print(f"   Mot de passe: test1234")
    print(f"   Actif: {stagiaire.is_active}")
    print(f"   Rôle: {stagiaire.role}")

if __name__ == "__main__":
    fix_stagiaire_login() 