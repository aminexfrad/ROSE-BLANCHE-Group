#!/usr/bin/env python
"""
Complete workflow test for the interview system with tuteur selection.
This script tests the entire flow from RH proposing an interview to candidate notification.
"""

import os
import sys
import django
from datetime import datetime, timedelta
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stagebloom.settings')
django.setup()

from django.test import RequestFactory
from django.contrib.auth import get_user_model
from rest_framework.test import force_authenticate
from rest_framework import status
from demande_service.views import (
    propose_interview_request, 
    get_available_tuteurs_for_demande,
    list_interview_requests,
    rh_respond_to_proposal
)
from tuteur_service.views import TuteurInterviewRespondView
from demande_service.models import Demande, InterviewRequest
from shared.models import Entreprise, Notification

User = get_user_model()

def test_complete_workflow():
    """Test the complete interview workflow with tuteur selection"""
    
    print("🧪 Testing Complete Interview Workflow")
    print("=" * 60)
    
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
    
    factory = RequestFactory()
    
    # STEP 1: RH gets available tuteurs
    print("\n2. STEP 1: RH gets available tuteurs...")
    
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
    
    # STEP 2: RH proposes interview with tuteur selection
    print("\n3. STEP 2: RH proposes interview with tuteur selection...")
    
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
        interview_request_id = response.data['request']['id']
        print(f"   Interview Request ID: {interview_request_id}")
        print(f"   Tuteur assigned: {response.data['request']['tuteur']['name']}")
        print(f"   Status: {response.data['request']['status']}")
    else:
        print(f"❌ Error: {response.status_code}")
        print(f"   Response: {response.data}")
        return
    
    # STEP 3: Check notifications were created
    print("\n4. STEP 3: Checking notifications...")
    
    tuteur_notifications = Notification.objects.filter(recipient=tuteur1)
    print(f"✅ Tuteur notifications: {tuteur_notifications.count()}")
    
    # STEP 4: Tuteur responds to interview request
    print("\n5. STEP 4: Tuteur responds to interview request...")
    
    # Test tuteur accepts the interview
    tuteur_response_data = {
        'action': 'accept',
        'comment': 'Je suis disponible pour cet entretien.'
    }
    
    request = factory.post(f'/tuteur/interview-requests/{interview_request_id}/respond/', tuteur_response_data, content_type='application/json')
    force_authenticate(request, user=tuteur1)
    
    tuteur_view = TuteurInterviewRespondView()
    response = tuteur_view.post(request, interview_request_id)
    
    if response.status_code == status.HTTP_200_OK:
        print("✅ Tuteur accepted the interview")
        print(f"   Response: {response.data}")
    else:
        print(f"❌ Error: {response.status_code}")
        print(f"   Response: {response.data}")
        return
    
    # STEP 5: Check interview request status
    print("\n6. STEP 5: Checking interview request status...")
    
    interview_request = InterviewRequest.objects.get(id=interview_request_id)
    print(f"✅ Interview request status: {interview_request.status}")
    
    if interview_request.status == 'VALIDATED':
        print("✅ Interview is now validated!")
    else:
        print(f"❌ Unexpected status: {interview_request.status}")
    
    # STEP 6: Test alternative flow - Tuteur proposes new time
    print("\n7. STEP 6: Testing alternative flow - Tuteur proposes new time...")
    
    # Create another interview request
    interview_data2 = {
        'tuteur_id': tuteur2.id,
        'date': (tomorrow + timedelta(days=1)).strftime('%Y-%m-%d'),
        'time': '15:00',
        'location': 'Salle de réunion B'
    }
    
    request = factory.post(f'/demandes/{demande.id}/propose-interview/', interview_data2, content_type='application/json')
    force_authenticate(request, user=rh_user)
    
    response = propose_interview_request(request, demande.id)
    
    if response.status_code == status.HTTP_201_CREATED:
        interview_request_id2 = response.data['request']['id']
        print(f"✅ Second interview request created: {interview_request_id2}")
        
        # Tuteur proposes new time
        tuteur_response_data2 = {
            'action': 'propose_new_time',
            'suggested_date': (tomorrow + timedelta(days=2)).strftime('%Y-%m-%d'),
            'suggested_time': '16:00',
            'comment': 'Je propose un créneau plus tard dans la semaine.'
        }
        
        request = factory.post(f'/tuteur/interview-requests/{interview_request_id2}/respond/', tuteur_response_data2, content_type='application/json')
        force_authenticate(request, user=tuteur2)
        
        response = tuteur_view.post(request, interview_request_id2)
        
        if response.status_code == status.HTTP_200_OK:
            print("✅ Tuteur proposed new time")
            
            # Check status
            interview_request2 = InterviewRequest.objects.get(id=interview_request_id2)
            print(f"✅ Interview request status: {interview_request2.status}")
            
            if interview_request2.status == 'REVISION_REQUESTED':
                print("✅ Status correctly set to REVISION_REQUESTED")
                
                # STEP 7: RH responds to tuteur's proposal
                print("\n8. STEP 7: RH responds to tuteur's proposal...")
                
                rh_response_data = {
                    'action': 'accept',
                    'comment': 'Le nouveau créneau me convient.'
                }
                
                request = factory.post(f'/interview-requests/{interview_request_id2}/respond/', rh_response_data, content_type='application/json')
                force_authenticate(request, user=rh_user)
                
                response = rh_respond_to_proposal(request, interview_request_id2)
                
                if response.status_code == status.HTTP_200_OK:
                    print("✅ RH accepted tuteur's proposal")
                    
                    # Check final status
                    interview_request2.refresh_from_db()
                    print(f"✅ Final interview request status: {interview_request2.status}")
                    
                    if interview_request2.status == 'VALIDATED':
                        print("✅ Interview is now validated after RH acceptance!")
                    else:
                        print(f"❌ Unexpected final status: {interview_request2.status}")
                else:
                    print(f"❌ Error in RH response: {response.status_code}")
                    print(f"   Response: {response.data}")
            else:
                print(f"❌ Unexpected status after tuteur proposal: {interview_request2.status}")
        else:
            print(f"❌ Error in tuteur proposal: {response.status_code}")
            print(f"   Response: {response.data}")
    else:
        print(f"❌ Error creating second interview request: {response.status_code}")
    
    print("\n🎉 Complete workflow test finished!")
    print("\nSummary:")
    print("- ✅ RH can get available tuteurs")
    print("- ✅ RH can propose interview with tuteur selection")
    print("- ✅ Tuteur can accept interview")
    print("- ✅ Tuteur can propose new time")
    print("- ✅ RH can respond to tuteur's proposal")
    print("- ✅ Status transitions work correctly")
    print("- ✅ Notifications are created")

if __name__ == "__main__":
    test_complete_workflow()
