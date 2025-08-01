#!/usr/bin/env python
"""
Script simple pour créer des rapports PFE de test
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from auth_service.models import User
from shared.models import Stage, PFEReport
from demande_service.models import Demande
from django.utils import timezone
from datetime import timedelta

def create_simple_pfe_data():
    print("Création de données PFE simples...")
    
    # Créer un utilisateur RH pour tester
    rh_user, created = User.objects.get_or_create(
        email='rh@test.com',
        defaults={
            'nom': 'RH',
            'prenom': 'Test',
            'role': 'rh',
            'is_active': True
        }
    )
    if created:
        rh_user.set_password('rh123')
        rh_user.save()
        print(f"✅ Utilisateur RH créé: {rh_user.email}")
    
    # Créer un stagiaire de test
    stagiaire, created = User.objects.get_or_create(
        email='stagiaire@test.com',
        defaults={
            'nom': 'Stagiaire',
            'prenom': 'Test',
            'role': 'stagiaire',
            'is_active': True,
            'institut': 'ESI',
            'specialite': 'Informatique'
        }
    )
    if created:
        stagiaire.set_password('stagiaire123')
        stagiaire.save()
        print(f"✅ Stagiaire créé: {stagiaire.email}")
    
    # Créer un tuteur de test
    tuteur, created = User.objects.get_or_create(
        email='tuteur@test.com',
        defaults={
            'nom': 'Tuteur',
            'prenom': 'Test',
            'role': 'tuteur',
            'is_active': True
        }
    )
    if created:
        tuteur.set_password('tuteur123')
        tuteur.save()
        print(f"✅ Tuteur créé: {tuteur.email}")
    
    # Utiliser un stage existant ou en créer un nouveau
    existing_stage = Stage.objects.filter(stagiaire=stagiaire).first()
    if existing_stage:
        stage = existing_stage
        print(f"✅ Utilisation du stage existant: {stage.title}")
    else:
        # Créer d'abord une demande
        demande, created = Demande.objects.get_or_create(
            email=stagiaire.email,
            defaults={
                'nom': stagiaire.nom,
                'prenom': stagiaire.prenom,
                'telephone': '0123456789',
                'cin': 'AB123456',
                'institut': stagiaire.institut,
                'specialite': stagiaire.specialite,
                'type_stage': 'PFE',
                'niveau': 'Master',
                'date_debut': '2024-01-01',
                'date_fin': '2024-06-30',
                'stage_binome': False,
                'status': 'approved'
            }
        )
        if created:
            print(f"✅ Demande créée pour {stagiaire.email}")
        
        # Créer un stage de test avec un titre unique
        stage = Stage.objects.create(
            demande=demande,
            stagiaire=stagiaire,
            tuteur=tuteur,
            title='Stage PFE Test - ' + str(timezone.now().strftime('%Y%m%d_%H%M%S')),
            description='Stage pour tester les rapports PFE',
            company='Rose Blanche Group',
            location='Tunis',
            start_date='2024-01-01',
            end_date='2024-06-30',
            status='active',
            progress=75
        )
        print(f"✅ Stage créé: {stage.title}")
    
    # Créer quelques rapports PFE de test
    pfe_reports_data = [
        {
            'title': 'Système de gestion des ressources humaines',
            'abstract': 'Développement d\'un système moderne de gestion RH avec interface web responsive.',
            'keywords': 'PFE, développement, web, RH, gestion',
            'speciality': 'Informatique',
            'year': 2024,
            'status': 'approved',
            'version': 1,
            'download_count': 25,
            'view_count': 150,
            'tuteur_feedback': 'Excellent travail, bien structuré et documenté.',
            'stagiaire_comment': 'Projet très enrichissant qui m\'a permis d\'acquérir de nouvelles compétences.',
        },
        {
            'title': 'Application mobile de e-commerce',
            'abstract': 'Création d\'une application mobile complète pour la vente en ligne.',
            'keywords': 'PFE, mobile, e-commerce, React Native',
            'speciality': 'Informatique',
            'year': 2024,
            'status': 'submitted',
            'version': 2,
            'download_count': 15,
            'view_count': 80,
            'tuteur_feedback': '',
            'stagiaire_comment': 'Développement passionnant avec les technologies mobiles.',
        },
        {
            'title': 'Plateforme de gestion de projets',
            'abstract': 'Système web pour la gestion collaborative de projets d\'entreprise.',
            'keywords': 'PFE, gestion, projets, collaboration, web',
            'speciality': 'Informatique',
            'year': 2023,
            'status': 'archived',
            'version': 1,
            'download_count': 45,
            'view_count': 200,
            'tuteur_feedback': 'Projet de qualité, bien réalisé.',
            'stagiaire_comment': 'Expérience très enrichissante en développement web.',
        }
    ]
    
    created_count = 0
    for i, report_data in enumerate(pfe_reports_data):
        # Vérifier si le rapport existe déjà
        if PFEReport.objects.filter(title=report_data['title']).exists():
            print(f"Rapport PFE existe déjà: {report_data['title']}")
            continue
        
        try:
            report = PFEReport.objects.create(
                stage=stage,
                stagiaire=stagiaire,
                tuteur=tuteur,
                **report_data
            )
            
            # Définir les dates selon le statut
            if report.status in ['submitted', 'under_review', 'approved', 'rejected']:
                report.submitted_at = timezone.now() - timedelta(days=30)
                if report.status in ['under_review', 'approved', 'rejected']:
                    report.reviewed_at = report.submitted_at + timedelta(days=5)
                    if report.status == 'approved':
                        report.approved_at = report.reviewed_at + timedelta(days=2)
                report.save()
            
            created_count += 1
            print(f"✅ Rapport PFE créé: {report.title}")
            
        except Exception as e:
            print(f"❌ Erreur lors de la création du rapport PFE: {e}")
    
    print(f"\n🎉 {created_count} rapports PFE créés avec succès!")
    print(f"\n📋 Informations de connexion:")
    print(f"RH: rh@test.com / rh123")
    print(f"Stagiaire: stagiaire@test.com / stagiaire123")
    print(f"Tuteur: tuteur@test.com / tuteur123")

if __name__ == '__main__':
    create_simple_pfe_data() 