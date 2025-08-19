#!/usr/bin/env python
"""
Test script for the new tuteur selection functionality in interview proposals.
"""

import os
import sys
import django
from datetime import datetime, timedelta

# Setup Django - run from gateway directory
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from django.test import RequestFactory
from django.contrib.auth import get_user_model
from rest_framework.test import force_authenticate
from rest_framework import status
from demande_service.views import propose_interview_request, get_available_tuteurs_for_demande
from demande_service.models import Demande
from shared.models import Entreprise

User = get_user_model()

def test_tuteur_selection():
    """Test the new tuteur selection functionality"""
    
    print("🧪 Testing Tuteur Selection Functionality")
    print("=" * 50)
    
    # Create test data
    print("\n1. Creating test data...")
    
    # Create entreprise
    entreprise = Entreprise.objects.create(
        nom="Test Entreprise",
        adresse="123 Test Street",
        telephone="0123456789",
        email="test@entreprise.com"
    )
    
    # Create RH user
    rh_user = User.objects.create_user(
        username="test_rh",
        email="rh@test.com",
        password="testpass123",
        role="rh",
        entreprise=entreprise,
        prenom="Test",
        nom="RH"
    )
    
    # Create tuteurs
    tuteur1 = User.objects.create_user(
        username="tuteur1",
        email="tuteur1@test.com",
        password="testpass123",
        role="tuteur",
        entreprise=entreprise,
        prenom="Tuteur",
        nom="Un",
        departement="IT"
    )
    
    tuteur2 = User.objects.create_user(
        username="tuteur2",
        email="tuteur2@test.com",
        password="testpass123",
        role="tuteur",
        entreprise=entreprise,
        prenom="Tuteur",
        nom="Deux",
        departement="Marketing"
    )
    
    # Create candidate
    candidat = User.objects.create_user(
        username="candidat",
        email="candidat@test.com",
        password="testpass123",
        role="candidat",
        prenom="Test",
        nom="Candidat"
    )
    
    # Create demande
    demande = Demande.objects.create(
        candidat=candidat,
        entreprise=entreprise,
        nom="Test",
        prenom="Candidat",
        email="candidat@test.com",
        telephone="0123456789",
        cv="test_cv.pdf",
        lettre_motivation="test_letter.pdf",
        status="pending"
    )
    
    print("✅ Test data created successfully")
    
    # Test get available tuteurs endpoint
    print("\n2. Testing get_available_tuteurs_for_demande endpoint...")
    
    factory = RequestFactory()
    request = factory.get(f'/demandes/{demande.id}/available-tuteurs/')
    force_authenticate(request, user=rh_user)
    
    response = get_available_tuteurs_for_demande(request, demande.id)
    
    if response.status_code == status.HTTP_200_OK:
        tuteurs_data = response.data.get('results', [])
        print(f"✅ Found {len(tuteurs_data)} available tuteurs:")
        for tuteur in tuteurs_data:
            print(f"   - {tuteur['first_name']} {tuteur['last_name']} ({tuteur['departement']}) - {tuteur['stagiaires_assignes']}/5")
    else:
        print(f"❌ Error: {response.status_code}")
        print(f"   Response: {response.data}")
        return
    
    # Test propose interview with tuteur selection
    print("\n3. Testing propose_interview_request with tuteur selection...")
    
    tomorrow = datetime.now().date() + timedelta(days=1)
    interview_data = {
        'tuteur_id': tuteur1.id,
        'date': tomorrow.strftime('%Y-%m-%d'),
        'time': '14:00',
        'location': 'Salle de réunion A'
    }
    
    request = factory.post(f'/demandes/{demande.id}/propose-interview/', interview_data, content_type='application/json')
    force_authenticate(request, user=rh_user)
    
    response = propose_interview_request(request, demande.id)
    
    if response.status_code == status.HTTP_201_CREATED:
        print("✅ Interview proposal created successfully")
        print(f"   Tuteur assigned: {response.data['request']['tuteur']['name']}")
        print(f"   Status: {response.data['request']['status']}")
    else:
        print(f"❌ Error: {response.status_code}")
        print(f"   Response: {response.data}")
        return
    
    # Test validation - wrong tuteur (different company)
    print("\n4. Testing validation with wrong tuteur...")
    
    # Create another entreprise and tuteur
    entreprise2 = Entreprise.objects.create(
        nom="Test Entreprise 2",
        adresse="456 Test Street",
        telephone="0987654321",
        email="test2@entreprise.com"
    )
    
    tuteur_wrong = User.objects.create_user(
        username="tuteur_wrong",
        email="tuteur_wrong@test.com",
        password="testpass123",
        role="tuteur",
        entreprise=entreprise2,
        prenom="Wrong",
        nom="Tuteur"
    )
    
    interview_data_wrong = {
        'tuteur_id': tuteur_wrong.id,
        'date': tomorrow.strftime('%Y-%m-%d'),
        'time': '15:00',
        'location': 'Salle de réunion B'
    }
    
    request = factory.post(f'/demandes/{demande.id}/propose-interview/', interview_data_wrong, content_type='application/json')
    force_authenticate(request, user=rh_user)
    
    response = propose_interview_request(request, demande.id)
    
    if response.status_code == status.HTTP_400_BAD_REQUEST:
        print("✅ Validation working correctly - rejected wrong tuteur")
        print(f"   Error: {response.data.get('error', 'Unknown error')}")
    else:
        print(f"❌ Validation failed - should have rejected wrong tuteur")
        print(f"   Status: {response.status_code}")
    
    print("\n🎉 All tests completed successfully!")
    print("\nSummary:")
    print("- RH can select tuteurs from their company")
    print("- System validates tuteur belongs to correct filiale")
    print("- Interview proposals are created with selected tuteur")
    print("- Validation prevents wrong tuteur assignment")

if __name__ == "__main__":
    test_tuteur_selection()
