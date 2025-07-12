#!/usr/bin/env python3
"""
Script de test pour la fonctionnalité d'assignation de tuteurs
"""

import os
import sys
import django
from django.conf import settings

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from auth_service.models import User
from shared.models import Stage, Demande
from demande_service.models import Demande as DemandeModel

def create_test_data():
    """Créer des données de test pour l'assignation de tuteurs"""
    
    print("🔧 Création des données de test...")
    
    # Créer des tuteurs de test
    tuteurs = []
    for i in range(3):
        tuteur, created = User.objects.get_or_create(
            email=f'tuteur{i+1}@example.com',
            defaults={
                'prenom': f'Tuteur{i+1}',
                'nom': f'Nom{i+1}',
                'role': 'tuteur',
                'departement': f'Département {i+1}',
                'telephone': f'012345678{i}'
            }
        )
        tuteurs.append(tuteur)
        print(f"✅ Tuteur créé: {tuteur.prenom} {tuteur.nom}")
    
    # Créer des stagiaires de test
    stagiaires = []
    for i in range(5):
        stagiaire, created = User.objects.get_or_create(
            email=f'stagiaire{i+1}@example.com',
            defaults={
                'prenom': f'Stagiaire{i+1}',
                'nom': f'Nom{i+1}',
                'role': 'stagiaire',
                'institut': f'Institut {i+1}',
                'specialite': f'Spécialité {i+1}',
                'telephone': f'098765432{i}'
            }
        )
        stagiaires.append(stagiaire)
        print(f"✅ Stagiaire créé: {stagiaire.prenom} {stagiaire.nom}")
    
    # Créer des demandes et stages pour les stagiaires
    for i, stagiaire in enumerate(stagiaires):
        demande, _ = DemandeModel.objects.get_or_create(
            email=stagiaire.email,
            defaults={
                'nom': stagiaire.nom,
                'prenom': stagiaire.prenom,
                'telephone': stagiaire.telephone,
                'institut': stagiaire.institut,
                'specialite': stagiaire.specialite,
                'cin': f'CIN{i+1:06d}',
                'type_stage': 'Stage PFE',
                'niveau': 'Master',
                'date_debut': '2024-01-01',
                'date_fin': '2024-06-30',
                'stage_binome': False,
                'status': 'approved'
            }
        )
        demande.save()
        # Supprimer tout stage existant pour ce stagiaire (nettoyage)
        Stage.objects.filter(stagiaire=stagiaire).delete()
        # Créer un stage pour ce stagiaire
        stage = Stage.objects.create(
            stagiaire=stagiaire,
            demande=demande,
            title=f'Stage {i+1}',
            description=f'Description du stage {i+1}',
            company=f'Entreprise {i+1}',
            location=f'Localisation {i+1}',
            start_date='2024-01-01',
            end_date='2024-06-30',
            status='active',
            progress=0
        )
        stage.refresh_from_db()
        print(f"✅ Stage créé pour {stagiaire.prenom}: {stage.title}")
    
    return tuteurs, stagiaires

def test_tuteur_assignment():
    """Tester l'assignation de tuteurs"""
    
    print("\n🧪 Test d'assignation de tuteurs...")
    
    # Récupérer les tuteurs et stagiaires
    tuteurs = User.objects.filter(role='tuteur')
    stagiaires = User.objects.filter(role='stagiaire')
    
    print(f"📊 Tuteurs disponibles: {tuteurs.count()}")
    print(f"📊 Stagiaires: {stagiaires.count()}")
    
    # Afficher les tuteurs avec leur charge actuelle
    print("\n📋 État des tuteurs:")
    for tuteur in tuteurs:
        stagiaires_assignes = Stage.objects.filter(tuteur=tuteur, status='active').count()
        print(f"  - {tuteur.prenom} {tuteur.nom}: {stagiaires_assignes}/5 stagiaires")
    
    # Afficher les stagiaires sans tuteur
    stagiaires_sans_tuteur = []
    for stagiaire in stagiaires:
        stage_actif = Stage.objects.filter(stagiaire=stagiaire, status='active').first()
        if stage_actif and not stage_actif.tuteur:
            stagiaires_sans_tuteur.append(stagiaire)
    
    print(f"\n📋 Stagiaires sans tuteur: {len(stagiaires_sans_tuteur)}")
    for stagiaire in stagiaires_sans_tuteur:
        print(f"  - {stagiaire.prenom} {stagiaire.nom}")
    
    # Simuler l'assignation de tuteurs
    print("\n🔗 Simulation d'assignation...")
    for i, stagiaire in enumerate(stagiaires_sans_tuteur):
        if i < len(tuteurs):
            tuteur = tuteurs[i]
            stage_actif = Stage.objects.filter(stagiaire=stagiaire, status='active').first()
            
            if stage_actif:
                # Vérifier la charge du tuteur
                stagiaires_assignes = Stage.objects.filter(tuteur=tuteur, status='active').count()
                
                if stagiaires_assignes < 5:
                    stage_actif.tuteur = tuteur
                    stage_actif.save()
                    print(f"✅ {stagiaire.prenom} {stagiaire.nom} assigné à {tuteur.prenom} {tuteur.nom}")
                else:
                    print(f"❌ {tuteur.prenom} {tuteur.nom} a déjà 5 stagiaires")
            else:
                print(f"❌ Aucun stage actif pour {stagiaire.prenom} {stagiaire.nom}")
    
    # Afficher l'état final
    print("\n📊 État final:")
    for tuteur in tuteurs:
        stagiaires_assignes = Stage.objects.filter(tuteur=tuteur, status='active').count()
        print(f"  - {tuteur.prenom} {tuteur.nom}: {stagiaires_assignes}/5 stagiaires")
    
    stagiaires_sans_tuteur_final = []
    for stagiaire in stagiaires:
        stage_actif = Stage.objects.filter(stagiaire=stagiaire, status='active').first()
        if stage_actif and not stage_actif.tuteur:
            stagiaires_sans_tuteur_final.append(stagiaire)
    
    print(f"📋 Stagiaires sans tuteur restants: {len(stagiaires_sans_tuteur_final)}")

if __name__ == '__main__':
    print("🚀 Démarrage du test d'assignation de tuteurs")
    
    try:
        # Créer les données de test
        tuteurs, stagiaires = create_test_data()
        
        # Tester l'assignation
        test_tuteur_assignment()
        
        print("\n✅ Test terminé avec succès!")
        
    except Exception as e:
        print(f"❌ Erreur lors du test: {e}")
        import traceback
        traceback.print_exc() 