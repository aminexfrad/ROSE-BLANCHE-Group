#!/usr/bin/env python3
"""
Test script pour vérifier le filtrage par entreprise dans les vues RH
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
from rh_service.views import RHTuteursDisponiblesView, RHStagiairesView, RHStagesView

User = get_user_model()

def test_rh_entreprise_filtering():
    """Test du filtrage par entreprise dans les vues RH"""
    
    print("🧪 Test du filtrage par entreprise dans les vues RH")
    print("=" * 60)
    
    # Créer les données de test
    print("\n📝 Création des données de test...")
    
    # Créer deux entreprises
    entreprise1 = Entreprise.objects.create(
        nom="Entreprise Test 1",
        description="Première entreprise de test",
        secteur_activite="Technologie"
    )
    
    entreprise2 = Entreprise.objects.create(
        nom="Entreprise Test 2", 
        description="Deuxième entreprise de test",
        secteur_activite="Finance"
    )
    
    print(f"✅ Entreprises créées: {entreprise1.nom}, {entreprise2.nom}")
    
    # Créer des utilisateurs RH pour chaque entreprise
    rh1 = User.objects.create_user(
        email="rh1@entreprise1.com",
        password="testpass123",
        nom="RH1",
        prenom="Responsable",
        role="rh",
        entreprise=entreprise1
    )
    
    rh2 = User.objects.create_user(
        email="rh2@entreprise2.com", 
        password="testpass123",
        nom="RH2",
        prenom="Responsable",
        role="rh",
        entreprise=entreprise2
    )
    
    print(f"✅ RH créés: {rh1.email}, {rh2.email}")
    
    # Créer des tuteurs pour chaque entreprise
    tuteur1 = User.objects.create_user(
        email="tuteur1@entreprise1.com",
        password="testpass123", 
        nom="Tuteur1",
        prenom="Jean",
        role="tuteur",
        entreprise=entreprise1
    )
    
    tuteur2 = User.objects.create_user(
        email="tuteur2@entreprise2.com",
        password="testpass123",
        nom="Tuteur2", 
        prenom="Marie",
        role="tuteur",
        entreprise=entreprise2
    )
    
    print(f"✅ Tuteurs créés: {tuteur1.email}, {tuteur2.email}")
    
    # Créer des stagiaires pour chaque entreprise
    stagiaire1 = User.objects.create_user(
        email="stagiaire1@entreprise1.com",
        password="testpass123",
        nom="Stagiaire1",
        prenom="Paul",
        role="stagiaire", 
        entreprise=entreprise1
    )
    
    stagiaire2 = User.objects.create_user(
        email="stagiaire2@entreprise2.com",
        password="testpass123",
        nom="Stagiaire2",
        prenom="Sophie", 
        role="stagiaire",
        entreprise=entreprise2
    )
    
    print(f"✅ Stagiaires créés: {stagiaire1.email}, {stagiaire2.email}")
    
    # Créer des stages pour chaque stagiaire
    stage1 = Stage.objects.create(
        stagiaire=stagiaire1,
        title="Stage Test 1",
        description="Stage de test pour entreprise 1",
        company_entreprise=entreprise1,
        location="Paris",
        start_date="2024-01-01",
        end_date="2024-06-30",
        status="active"
    )
    
    stage2 = Stage.objects.create(
        stagiaire=stagiaire2,
        title="Stage Test 2", 
        description="Stage de test pour entreprise 2",
        company_entreprise=entreprise2,
        location="Lyon",
        start_date="2024-01-01",
        end_date="2024-06-30",
        status="active"
    )
    
    print(f"✅ Stages créés: {stage1.title}, {stage2.title}")
    
    # Test des vues RH
    factory = RequestFactory()
    
    print("\n🔍 Test 1: RH1 ne voit que les tuteurs de son entreprise")
    request1 = factory.get('/rh/tuteurs-disponibles/')
    force_authenticate(request1, user=rh1)
    view1 = RHTuteursDisponiblesView.as_view()
    response1 = view1(request1)
    
    if response1.status_code == status.HTTP_200_OK:
        tuteurs = response1.data.get('results', [])
        print(f"   Tuteurs visibles pour RH1: {len(tuteurs)}")
        for tuteur in tuteurs:
            print(f"   - {tuteur['first_name']} {tuteur['last_name']} ({tuteur['entreprise']})")
        
        # Vérifier que RH1 ne voit que les tuteurs de son entreprise
        if len(tuteurs) == 1 and tuteurs[0]['entreprise'] == entreprise1.nom:
            print("   ✅ Filtrage correct: RH1 ne voit que les tuteurs de son entreprise")
        else:
            print("   ❌ Filtrage incorrect")
    else:
        print(f"   ❌ Erreur: {response1.status_code}")
    
    print("\n🔍 Test 2: RH2 ne voit que les tuteurs de son entreprise")
    request2 = factory.get('/rh/tuteurs-disponibles/')
    force_authenticate(request2, user=rh2)
    view2 = RHTuteursDisponiblesView.as_view()
    response2 = view2(request2)
    
    if response2.status_code == status.HTTP_200_OK:
        tuteurs = response2.data.get('results', [])
        print(f"   Tuteurs visibles pour RH2: {len(tuteurs)}")
        for tuteur in tuteurs:
            print(f"   - {tuteur['first_name']} {tuteur['last_name']} ({tuteur['entreprise']})")
        
        # Vérifier que RH2 ne voit que les tuteurs de son entreprise
        if len(tuteurs) == 1 and tuteurs[0]['entreprise'] == entreprise2.nom:
            print("   ✅ Filtrage correct: RH2 ne voit que les tuteurs de son entreprise")
        else:
            print("   ❌ Filtrage incorrect")
    else:
        print(f"   ❌ Erreur: {response2.status_code}")
    
    print("\n🔍 Test 3: RH1 ne voit que les stagiaires de son entreprise")
    request3 = factory.get('/rh/stagiaires/')
    force_authenticate(request3, user=rh1)
    view3 = RHStagiairesView.as_view()
    response3 = view3(request3)
    
    if response3.status_code == status.HTTP_200_OK:
        stagiaires = response3.data.get('results', [])
        print(f"   Stagiaires visibles pour RH1: {len(stagiaires)}")
        for stagiaire in stagiaires:
            print(f"   - {stagiaire['first_name']} {stagiaire['last_name']} ({stagiaire['entreprise']})")
        
        # Vérifier que RH1 ne voit que les stagiaires de son entreprise
        if len(stagiaires) == 1 and stagiaires[0]['entreprise'] == entreprise1.nom:
            print("   ✅ Filtrage correct: RH1 ne voit que les stagiaires de son entreprise")
        else:
            print("   ❌ Filtrage incorrect")
    else:
        print(f"   ❌ Erreur: {response3.status_code}")
    
    print("\n🔍 Test 4: RH1 ne voit que les stages de son entreprise")
    request4 = factory.get('/rh/stages/')
    force_authenticate(request4, user=rh1)
    view4 = RHStagesView.as_view()
    response4 = view4(request4)
    
    if response4.status_code == status.HTTP_200_OK:
        stages = response4.data.get('results', [])
        print(f"   Stages visibles pour RH1: {len(stages)}")
        for stage in stages:
            print(f"   - {stage['title']} ({stage['company']})")
        
        # Vérifier que RH1 ne voit que les stages de son entreprise
        if len(stages) == 1 and stages[0]['company'] == entreprise1.nom:
            print("   ✅ Filtrage correct: RH1 ne voit que les stages de son entreprise")
        else:
            print("   ❌ Filtrage incorrect")
    else:
        print(f"   ❌ Erreur: {response4.status_code}")
    
    print("\n🧹 Nettoyage des données de test...")
    
    # Nettoyer les données de test
    Stage.objects.all().delete()
    User.objects.all().delete()
    Entreprise.objects.all().delete()
    
    print("✅ Données de test supprimées")
    print("\n🎉 Test du filtrage par entreprise terminé!")

if __name__ == '__main__':
    test_rh_entreprise_filtering()
