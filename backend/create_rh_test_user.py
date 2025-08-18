#!/usr/bin/env python3
"""
Script pour créer un utilisateur RH de test avec une entreprise
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from auth_service.models import User
from shared.models import Entreprise

def create_rh_test_user():
    """Créer un utilisateur RH de test avec une entreprise"""
    
    print("🔧 Création d'un utilisateur RH de test...")
    
    try:
        # 1. Créer ou récupérer une entreprise de test
        entreprise, created = Entreprise.objects.get_or_create(
            nom="Entreprise Test Frontend",
            defaults={
                "description": "Entreprise de test pour le frontend RH",
                "secteur_activite": "Technologie",
                "ville": "Sousse",
                "pays": "Tunisie"
            }
        )
        
        if created:
            print(f"   ✅ Entreprise créée: {entreprise.nom}")
        else:
            print(f"   ✅ Entreprise existante: {entreprise.nom}")
        
        # 2. Créer ou récupérer l'utilisateur RH
        rh_user, created = User.objects.get_or_create(
            email="rh.test@frontend.com",
            defaults={
                "prenom": "RH",
                "nom": "Test",
                "role": "rh",
                "entreprise": entreprise,
                "telephone": "0123456789"
            }
        )
        
        if created:
            # Définir le mot de passe
            rh_user.set_password("rh123456")
            rh_user.save()
            print(f"   ✅ Utilisateur RH créé: {rh_user.email}")
        else:
            # Mettre à jour le mot de passe
            rh_user.set_password("rh123456")
            rh_user.save()
            print(f"   ✅ Utilisateur RH existant mis à jour: {rh_user.email}")
        
        # 3. Créer quelques stagiaires de test
        stagiaire1, created = User.objects.get_or_create(
            email="stagiaire1.test@frontend.com",
            defaults={
                "prenom": "Stagiaire",
                "nom": "Test1",
                "role": "stagiaire",
                "entreprise": entreprise,
                "institut": "Institut Test",
                "specialite": "Informatique",
                "telephone": "0987654321"
            }
        )
        
        if created:
            stagiaire1.set_password("stagiaire123")
            stagiaire1.save()
            print(f"   ✅ Stagiaire 1 créé: {stagiaire1.email}")
        else:
            print(f"   ✅ Stagiaire 1 existant: {stagiaire1.email}")
        
        stagiaire2, created = User.objects.get_or_create(
            email="stagiaire2.test@frontend.com",
            defaults={
                "prenom": "Stagiaire",
                "nom": "Test2",
                "role": "stagiaire",
                "entreprise": entreprise,
                "institut": "Institut Test",
                "specialite": "Finance",
                "telephone": "0555666777"
            }
        )
        
        if created:
            stagiaire2.set_password("stagiaire123")
            stagiaire2.save()
            print(f"   ✅ Stagiaire 2 créé: {stagiaire2.email}")
        else:
            print(f"   ✅ Stagiaire 2 existant: {stagiaire2.email}")
        
        # 4. Afficher les informations de connexion
        print(f"\n" + "=" * 60)
        print("📋 INFORMATIONS DE CONNEXION POUR LE TEST FRONTEND")
        print("=" * 60)
        print(f"🌐 URL Frontend: http://localhost:3000")
        print(f"🔑 Connexion RH:")
        print(f"   Email: {rh_user.email}")
        print(f"   Mot de passe: rh123456")
        print(f"   Rôle: {rh_user.role}")
        print(f"   Entreprise: {rh_user.entreprise.nom}")
        print(f"\n👥 Stagiaires de test:")
        print(f"   - {stagiaire1.email} (mot de passe: stagiaire123)")
        print(f"   - {stagiaire2.email} (mot de passe: stagiaire123)")
        print(f"\n📱 Pages RH à tester:")
        print(f"   - Dashboard: /rh")
        print(f"   - Stagiaires: /rh/stagiaires")

        print(f"   - Témoignages: /rh/temoignages")
        
        print(f"\n🎉 Utilisateur RH de test créé avec succès!")
        print(f"   Vous pouvez maintenant tester le frontend RH.")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERREUR lors de la création: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚀 Démarrage de la création de l'utilisateur RH de test...")
    success = create_rh_test_user()
    
    if success:
        print(f"\n✅ Création terminée avec succès!")
        sys.exit(0)
    else:
        print(f"\n❌ Création terminée avec des erreurs!")
        sys.exit(1)
