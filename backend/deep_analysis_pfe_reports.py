#!/usr/bin/env python
"""
Analyse approfondie des problèmes des rapports PFE pour tuteurs et stagiaires
"""

import os
import sys
import django
import requests
import json

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from auth_service.models import User
from shared.models import Stage, PFEReport
from demande_service.models import Demande

def deep_analysis_pfe_reports():
    print("🔍 Analyse approfondie des rapports PFE...")
    
    base_url = "http://localhost:8000/api"
    
    # 1. Vérifier les données dans la base
    print("\n📊 1. Vérification des données dans la base...")
    
    # Utilisateurs
    stagiaires = User.objects.filter(role='stagiaire')
    tuteurs = User.objects.filter(role='tuteur')
    print(f"   Stagiaires: {stagiaires.count()}")
    print(f"   Tuteurs: {tuteurs.count()}")
    
    # Stages
    stages = Stage.objects.all()
    active_stages = Stage.objects.filter(status='active')
    print(f"   Stages total: {stages.count()}")
    print(f"   Stages actifs: {active_stages.count()}")
    
    # Rapports PFE
    pfe_reports = PFEReport.objects.all()
    print(f"   Rapports PFE total: {pfe_reports.count()}")
    
    for report in pfe_reports:
        print(f"     - {report.title} ({report.stagiaire.email}) - {report.status}")
    
    # 2. Créer des données de test complètes
    print("\n🔧 2. Création de données de test complètes...")
    
    # Créer un tuteur
    tuteur, tuteur_created = User.objects.get_or_create(
        email='tuteur.test@example.com',
        defaults={
            'nom': 'Tuteur',
            'prenom': 'Test',
            'role': 'tuteur',
            'is_active': True
        }
    )
    
    if tuteur_created:
        tuteur.set_password('test1234')
        tuteur.save()
        print(f"   ✅ Tuteur créé: {tuteur.email}")
    else:
        print(f"   ✅ Tuteur existant: {tuteur.email}")
    
    # Créer un stagiaire avec stage et rapport PFE
    stagiaire, stagiaire_created = User.objects.get_or_create(
        email='stagiaire.pfe@example.com',
        defaults={
            'nom': 'Stagiaire',
            'prenom': 'PFE',
            'role': 'stagiaire',
            'is_active': True
        }
    )
    
    if stagiaire_created:
        stagiaire.set_password('test1234')
        stagiaire.save()
        print(f"   ✅ Stagiaire créé: {stagiaire.email}")
        
        # Créer une demande
        demande, demande_created = Demande.objects.get_or_create(
            email=stagiaire.email,
            defaults={
                'nom': stagiaire.nom,
                'prenom': stagiaire.prenom,
                'telephone': '0123456789',
                'cin': 'CD123456',
                'institut': 'Institut PFE',
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
            print(f"   ✅ Demande créée pour {stagiaire.email}")
        
        # Créer un stage
        stage, stage_created = Stage.objects.get_or_create(
            demande=demande,
            defaults={
                'stagiaire': stagiaire,
                'tuteur': tuteur,
                'title': 'Stage PFE Test',
                'company': 'Entreprise PFE',
                'location': 'Paris',
                'start_date': '2025-01-01',
                'end_date': '2025-06-30',
                'status': 'active',
                'progress': 75
            }
        )
        
        if stage_created:
            print(f"   ✅ Stage créé: {stage.title}")
        
        # Créer un rapport PFE
        pfe_report, pfe_created = PFEReport.objects.get_or_create(
            stage=stage,
            defaults={
                'stagiaire': stagiaire,
                'tuteur': tuteur,
                'title': 'Rapport PFE - Analyse approfondie des systèmes',
                'abstract': 'Ce projet présente une analyse approfondie des systèmes de gestion modernes avec une approche innovante.',
                'keywords': 'Systèmes, Gestion, Innovation, Analyse',
                'speciality': 'Informatique - Systèmes',
                'year': 2025,
                'status': 'submitted',
                'version': 1,
                'is_final': False
            }
        )
        
        if pfe_created:
            print(f"   ✅ Rapport PFE créé: {pfe_report.title}")
        else:
            print(f"   ✅ Rapport PFE existant: {pfe_report.title}")
    
    else:
        print(f"   ✅ Stagiaire existant: {stagiaire.email}")
    
    # 3. Test des APIs pour stagiaire
    print("\n👨‍🎓 3. Test des APIs pour stagiaire...")
    
    # Login stagiaire
    stagiaire_login = {
        'email': 'stagiaire.pfe@example.com',
        'password': 'test1234'
    }
    
    try:
        login_response = requests.post(f"{base_url}/auth/login/", json=stagiaire_login)
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            stagiaire_token = login_result.get('access')
            print(f"   ✅ Login stagiaire réussi")
            
            stagiaire_headers = {
                'Authorization': f'Bearer {stagiaire_token}',
                'Content-Type': 'application/json'
            }
            
            # Test PFE Reports pour stagiaire
            pfe_response = requests.get(f"{base_url}/pfe-reports/", headers=stagiaire_headers)
            print(f"   PFE Reports status: {pfe_response.status_code}")
            if pfe_response.status_code == 200:
                pfe_data = pfe_response.json()
                print(f"   ✅ PFE Reports OK - {len(pfe_data.get('results', []))} reports")
                for report in pfe_data.get('results', []):
                    print(f"     - {report.get('title', 'N/A')} ({report.get('status', 'N/A')})")
            else:
                print(f"   ❌ PFE Reports error: {pfe_response.text}")
        else:
            print(f"   ❌ Login stagiaire failed: {login_response.status_code}")
    
    except Exception as e:
        print(f"   ❌ Erreur stagiaire: {e}")
    
    # 4. Test des APIs pour tuteur
    print("\n👨‍🏫 4. Test des APIs pour tuteur...")
    
    # Login tuteur
    tuteur_login = {
        'email': 'tuteur.test@example.com',
        'password': 'test1234'
    }
    
    try:
        login_response = requests.post(f"{base_url}/auth/login/", json=tuteur_login)
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            tuteur_token = login_result.get('access')
            print(f"   ✅ Login tuteur réussi")
            
            tuteur_headers = {
                'Authorization': f'Bearer {tuteur_token}',
                'Content-Type': 'application/json'
            }
            
            # Test PFE Reports pour tuteur
            pfe_response = requests.get(f"{base_url}/pfe-reports/", headers=tuteur_headers)
            print(f"   PFE Reports status: {pfe_response.status_code}")
            if pfe_response.status_code == 200:
                pfe_data = pfe_response.json()
                print(f"   ✅ PFE Reports OK - {len(pfe_data.get('results', []))} reports")
                for report in pfe_data.get('results', []):
                    print(f"     - {report.get('title', 'N/A')} ({report.get('status', 'N/A')})")
            else:
                print(f"   ❌ PFE Reports error: {pfe_response.text}")
        else:
            print(f"   ❌ Login tuteur failed: {login_response.status_code}")
    
    except Exception as e:
        print(f"   ❌ Erreur tuteur: {e}")
    
    # 5. Résumé final
    print("\n📋 5. Résumé final...")
    print(f"   Rapports PFE dans la base: {PFEReport.objects.count()}")
    print(f"   Stages actifs: {Stage.objects.filter(status='active').count()}")
    print(f"   Stagiaires: {User.objects.filter(role='stagiaire').count()}")
    print(f"   Tuteurs: {User.objects.filter(role='tuteur').count()}")

if __name__ == "__main__":
    deep_analysis_pfe_reports() 