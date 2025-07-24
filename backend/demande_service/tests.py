"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from shared.models import OffreStage
from demande_service.models import Demande, DemandeOffre
from auth_service.models import User
from django.utils import timezone

# Create your tests here.

class PFEDemandeBusinessRuleTestCase(TestCase):
    def setUp(self):
        self.rh = User.objects.create_user(email='rh@example.com', password='testpass', nom='RH', prenom='User', role='rh')
        self.candidate = User.objects.create_user(email='cand@example.com', password='testpass', nom='Cand', prenom='User', role='stagiaire')
        self.client = APIClient()
        self.client.force_authenticate(user=self.rh)
        # Create 3 PFE offers
        self.offre1 = OffreStage.objects.create(reference='PFE1', title='PFE 1', type='PFE', status='open')
        self.offre2 = OffreStage.objects.create(reference='PFE2', title='PFE 2', type='PFE', status='open')
        self.offre3 = OffreStage.objects.create(reference='PFE3', title='PFE 3', type='PFE', status='open')
        # Create demande with 3 offers
        self.demande = Demande.objects.create(
            nom='Cand', prenom='User', email='cand@example.com', telephone='123', cin='CIN1',
            institut='Test', specialite='Info', type_stage='Stage PFE', niveau='M2',
            date_debut=timezone.now().date(), date_fin=timezone.now().date(), status='pending'
        )
        DemandeOffre.objects.create(demande=self.demande, offre=self.offre1)
        DemandeOffre.objects.create(demande=self.demande, offre=self.offre2)
        DemandeOffre.objects.create(demande=self.demande, offre=self.offre3)

    def test_accept_one_offer_rejects_others(self):
        url = f'/api/demandes/stage/{self.demande.id}/offre/{self.offre1.id}/status/'
        response = self.client.post(url, {'status': 'accepted'}, format='json')
        self.assertEqual(response.status_code, 200)
        # Refresh from DB
        do1 = DemandeOffre.objects.get(demande=self.demande, offre=self.offre1)
        do2 = DemandeOffre.objects.get(demande=self.demande, offre=self.offre2)
        do3 = DemandeOffre.objects.get(demande=self.demande, offre=self.offre3)
        self.assertEqual(do1.status, 'accepted')
        self.assertEqual(do2.status, 'rejected')
        self.assertEqual(do3.status, 'rejected')

    def test_reject_all_offers_sends_refusal(self):
        # Reject all offers
        for offre in [self.offre1, self.offre2, self.offre3]:
            url = f'/api/demandes/stage/{self.demande.id}/offre/{offre.id}/status/'
            response = self.client.post(url, {'status': 'rejected'}, format='json')
            self.assertEqual(response.status_code, 200)
        # All should be rejected
        for do in DemandeOffre.objects.filter(demande=self.demande):
            self.assertEqual(do.status, 'rejected')
