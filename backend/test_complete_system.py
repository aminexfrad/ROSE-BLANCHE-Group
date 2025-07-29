#!/usr/bin/env python
"""
Test complet du système pour stagiaires et tuteurs
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

def test_complete_system():
    print("🧪 Test complet du système...")
    
    base_url = "http://localhost:8000/api"
    
    # Créer des utilisateurs de test
    print("\n👥 1. Création des utilisateurs de test...")
    
    # Tuteur
    tuteur, tuteur_created = User.objects.get_or_create(
        email='tuteur.complet@example.com',
        defaults={
            'nom': 'Tuteur',
            'prenom': 'Complet',
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
    
    # Stagiaire
    stagiaire, stagiaire_created = User.objects.get_or_create(
        email='stagiaire.complet@example.com',
        defaults={
            'nom': 'Stagiaire',
            'prenom': 'Complet',
            'role': 'stagiaire',
            'is_active': True
        }
    )
    
    if stagiaire_created:
        stagiaire.set_password('test1234')
        stagiaire.save()
        print(f"   ✅ Stagiaire créé: {stagiaire.email}")
        
        # Créer demande et stage
        demande, demande_created = Demande.objects.get_or_create(
            email=stagiaire.email,
            defaults={
                'nom': stagiaire.nom,
                'prenom': stagiaire.prenom,
                'telephone': '0123456789',
                'cin': 'EF123456',
                'institut': 'Institut Complet',
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
            print(f"   ✅ Demande créée")
        
        stage, stage_created = Stage.objects.get_or_create(
            demande=demande,
            defaults={
                'stagiaire': stagiaire,
                'tuteur': tuteur,
                'title': 'Stage Complet Test',
                'company': 'Entreprise Complet',
                'location': 'Paris',
                'start_date': '2025-01-01',
                'end_date': '2025-06-30',
                'status': 'active',
                'progress': 80
            }
        )
        
        if stage_created:
            print(f"   ✅ Stage créé: {stage.title}")
        
        # Créer rapport PFE
        pfe_report, pfe_created = PFEReport.objects.get_or_create(
            stage=stage,
            defaults={
                'stagiaire': stagiaire,
                'tuteur': tuteur,
                'title': 'Rapport PFE - Système complet de gestion',
                'abstract': 'Ce projet présente un système complet de gestion avec toutes les fonctionnalités modernes.',
                'keywords': 'Système, Gestion, Complet, Moderne',
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
    
    # 2. Test des APIs pour stagiaire
    print("\n👨‍🎓 2. Test des APIs pour stagiaire...")
    
    stagiaire_login = {
        'email': 'stagiaire.complet@example.com',
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
            
            # Test PFE Reports
            pfe_response = requests.get(f"{base_url}/pfe-reports/", headers=stagiaire_headers)
            print(f"   PFE Reports: {pfe_response.status_code}")
            if pfe_response.status_code == 200:
                pfe_data = pfe_response.json()
                print(f"   ✅ PFE Reports OK - {len(pfe_data.get('results', []))} reports")
            
            # Test My Internship
            internship_response = requests.get(f"{base_url}/stages/my-internship/", headers=stagiaire_headers)
            print(f"   My Internship: {internship_response.status_code}")
            if internship_response.status_code == 200:
                print(f"   ✅ My Internship OK")
            
            # Test Dashboard Stats
            stats_response = requests.get(f"{base_url}/stats/", headers=stagiaire_headers)
            print(f"   Dashboard Stats: {stats_response.status_code}")
            if stats_response.status_code == 200:
                print(f"   ✅ Dashboard Stats OK")
        
        else:
            print(f"   ❌ Login stagiaire failed: {login_response.status_code}")
    
    except Exception as e:
        print(f"   ❌ Erreur stagiaire: {e}")
    
    # 3. Test des APIs pour tuteur
    print("\n👨‍🏫 3. Test des APIs pour tuteur...")
    
    tuteur_login = {
        'email': 'tuteur.complet@example.com',
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
            
            # Test PFE Reports
            pfe_response = requests.get(f"{base_url}/pfe-reports/", headers=tuteur_headers)
            print(f"   PFE Reports: {pfe_response.status_code}")
            if pfe_response.status_code == 200:
                pfe_data = pfe_response.json()
                print(f"   ✅ PFE Reports OK - {len(pfe_data.get('results', []))} reports")
            
            # Test Stages
            stages_response = requests.get(f"{base_url}/stages/", headers=tuteur_headers)
            print(f"   Stages: {stages_response.status_code}")
            if stages_response.status_code == 200:
                stages_data = stages_response.json()
                print(f"   ✅ Stages OK - {len(stages_data.get('results', []))} stages")
        
        else:
            print(f"   ❌ Login tuteur failed: {login_response.status_code}")
    
    except Exception as e:
        print(f"   ❌ Erreur tuteur: {e}")
    
    # 4. Résumé final
    print("\n📋 4. Résumé final...")
    print(f"   Rapports PFE: {PFEReport.objects.count()}")
    print(f"   Stages actifs: {Stage.objects.filter(status='active').count()}")
    print(f"   Stagiaires: {User.objects.filter(role='stagiaire').count()}")
    print(f"   Tuteurs: {User.objects.filter(role='tuteur').count()}")
    
    print("\n🎉 Test complet terminé !")
    print("\n📝 Instructions pour tester:")
    print("   1. Connectez-vous avec stagiaire.complet@example.com / test1234")
    print("   2. Allez sur http://localhost:3000/stagiaire/pfe-reports")
    print("   3. Connectez-vous avec tuteur.complet@example.com / test1234")
    print("   4. Allez sur http://localhost:3000/tuteur/pfe-reports")

if __name__ == "__main__":
    test_complete_system() 