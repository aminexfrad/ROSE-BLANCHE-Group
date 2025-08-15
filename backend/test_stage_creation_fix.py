#!/usr/bin/env python3
"""
Test script pour vérifier la création de stage et l'assignation de tuteur
"""

import os
import sys
import django
from django.test import RequestFactory
from django.contrib.auth import get_user_model
from rest_framework.test import force_authenticate
from rest_framework import status

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from auth_service.models import User
from shared.models import Entreprise, Stage
from rh_service.views import RHCreateStageForStagiaireView, RHAssignerTuteurView

User = get_user_model()

def test_stage_creation_and_assignment():
    """Test de la création de stage et de l'assignation de tuteur"""
    
    print("🧪 Test de la création de stage et de l'assignation de tuteur")
    print("=" * 70)
    
    # Créer les données de test
    print("\n📝 Création des données de test...")
    
    # Créer une entreprise
    entreprise = Entreprise.objects.create(
        nom="Entreprise Test Stage",
        description="Entreprise de test pour la création de stage",
        secteur_activite="Technologie"
    )
    
    print(f"✅ Entreprise créée: {entreprise.nom}")
    
    # Créer un utilisateur RH
    rh_user = User.objects.create_user(
        email="rh@entreprisetest.com",
        password="testpass123",
        nom="RH",
        prenom="Responsable",
        role="rh",
        entreprise=entreprise
    )
    
    print(f"✅ RH créé: {rh_user.email}")
    
    # Créer un tuteur
    tuteur = User.objects.create_user(
        email="tuteur@entreprisetest.com",
        password="testpass123",
        nom="Tuteur",
        prenom="Jean",
        role="tuteur",
        entreprise=entreprise
    )
    
    print(f"✅ Tuteur créé: {tuteur.email}")
    
    # Créer un stagiaire
    stagiaire = User.objects.create_user(
        email="stagiaire@entreprisetest.com",
        password="testpass123",
        nom="Stagiaire",
        prenom="Paul",
        role="stagiaire",
        entreprise=entreprise
    )
    
    print(f"✅ Stagiaire créé: {stagiaire.email}")
    
    # Test des vues RH
    factory = RequestFactory()
    
    print("\n🔍 Test 1: Création d'un stage pour le stagiaire")
    
    # Données du stage
    stage_data = {
        'title': 'Stage Test PFE',
        'description': 'Stage de test pour vérifier la création',
        'company': entreprise.nom,
        'location': 'Paris',
        'start_date': '2024-01-01',
        'end_date': '2024-06-30',
        'niveau': 'Bac+5',
        'type_stage': 'Stage PFE'
    }
    
    request1 = factory.post(f'/rh/stagiaires/{stagiaire.id}/create-stage/', stage_data, format='json')
    force_authenticate(request1, user=rh_user)
    view1 = RHCreateStageForStagiaireView.as_view()
    response1 = view1(request1, pk=stagiaire.id)
    
    if response1.status_code == status.HTTP_201_CREATED:
        print("✅ Stage créé avec succès")
        stage_info = response1.data.get('stage', {})
        print(f"   - ID: {stage_info.get('id')}")
        print(f"   - Titre: {stage_info.get('title')}")
        print(f"   - Entreprise: {stage_info.get('company')}")
        print(f"   - Statut: {stage_info.get('status')}")
        
        # Récupérer le stage créé
        stage = Stage.objects.get(id=stage_info['id'])
        print(f"   - Stage ID en base: {stage.id}")
        print(f"   - Entreprise en base: {stage.company_entreprise.nom if stage.company_entreprise else 'None'}")
        
    else:
        print(f"❌ Échec de création du stage: {response1.status_code}")
        print(f"   Erreur: {response1.data}")
        return
    
    print("\n🔍 Test 2: Assignation du tuteur au stage")
    
    # Assigner le tuteur
    request2 = factory.post(f'/rh/stagiaires/{stagiaire.id}/assigner-tuteur/', 
                          {'tuteur_id': tuteur.id}, format='json')
    force_authenticate(request2, user=rh_user)
    view2 = RHAssignerTuteurView.as_view()
    response2 = view2(request2, pk=stagiaire.id)
    
    if response2.status_code == status.HTTP_200_OK:
        print("✅ Tuteur assigné avec succès")
        assignment_info = response2.data
        print(f"   - Stagiaire: {assignment_info['stagiaire']['first_name']} {assignment_info['stagiaire']['last_name']}")
        print(f"   - Tuteur: {assignment_info['tuteur']['first_name']} {assignment_info['tuteur']['last_name']}")
        print(f"   - Stage: {assignment_info['stage']['title']}")
        
        # Vérifier en base
        stage.refresh_from_db()
        if stage.tuteur:
            print(f"   - Tuteur en base: {stage.tuteur.prenom} {stage.tuteur.nom}")
        else:
            print("   ❌ Tuteur non assigné en base")
            
    else:
        print(f"❌ Échec d'assignation du tuteur: {response2.status_code}")
        print(f"   Erreur: {response2.data}")
    
    print("\n🔍 Test 3: Vérification de la cohérence des données")
    
    # Vérifier que le stage a bien l'entreprise
    if stage.company_entreprise == entreprise:
        print("✅ Stage correctement lié à l'entreprise")
    else:
        print("❌ Stage non lié à l'entreprise")
        print(f"   - Entreprise attendue: {entreprise.nom}")
        print(f"   - Entreprise du stage: {stage.company_entreprise.nom if stage.company_entreprise else 'None'}")
    
    # Vérifier que la demande a bien l'entreprise
    if stage.demande.entreprise == entreprise:
        print("✅ Demande correctement liée à l'entreprise")
    else:
        print("❌ Demande non liée à l'entreprise")
        print(f"   - Entreprise attendue: {entreprise.nom}")
        print(f"   - Entreprise de la demande: {stage.demande.entreprise.nom if stage.demande.entreprise else 'None'}")
    
    print("\n🧹 Nettoyage des données de test...")
    
    # Nettoyer les données de test
    Stage.objects.all().delete()
    User.objects.all().delete()
    Entreprise.objects.all().delete()
    
    print("✅ Données de test supprimées")
    print("\n🎉 Test de création de stage et d'assignation terminé!")

if __name__ == '__main__':
    test_stage_creation_and_assignment()
