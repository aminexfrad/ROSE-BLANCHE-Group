"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

#!/usr/bin/env python3
"""
Script de test pour la fonctionnalité de création de stagiaire par le RH
"""

import os
import sys
import django
from datetime import datetime, timedelta

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from django.contrib.auth import get_user_model
from demande_service.models import Demande
from shared.models import Stage, User
from rh_service.views import RHCreerStagiaireView
from rest_framework.test import APIRequestFactory
from rest_framework.test import force_authenticate
from rest_framework import status

User = get_user_model()

def test_rh_creer_stagiaire():
    """Test de la création de stagiaire par le RH"""
    print("🧪 Test de création de stagiaire par le RH")
    
    # Créer un utilisateur RH pour le test
    rh_user = User.objects.create_user(
        email='rh.test@example.com',
        password='testpass123',
        prenom='RH',
        nom='Test',
        role='rh'
    )
    
    # Créer une factory pour les requêtes API
    factory = APIRequestFactory()
    
    # Données de test pour le stagiaire
    stagiaire_data = {
        'prenom': 'Jean',
        'nom': 'Dupont',
        'email': 'jean.dupont@example.com',
        'telephone': '+33 6 12 34 56 78',
        'institut': 'École Nationale d\'Ingénieurs',
        'specialite': 'Informatique',
        'niveau': 'Master',
        'type_stage': 'Stage PFE',
        'date_debut': (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d'),
        'date_fin': (datetime.now() + timedelta(days=120)).strftime('%Y-%m-%d'),
        'description': 'Stage de fin d\'études en développement web'
    }
    
    # Créer la requête
    request = factory.post('/rh/creer-stagiaire/', stagiaire_data, format='json')
    force_authenticate(request, user=rh_user)
    
    # Appeler la vue
    view = RHCreerStagiaireView.as_view()
    response = view(request)
    
    print(f"📊 Statut de la réponse: {response.status_code}")
    
    if response.status_code == status.HTTP_201_CREATED:
        print("✅ Création réussie!")
        response_data = response.data
        print(f"👤 Stagiaire créé: {response_data['stagiaire']['prenom']} {response_data['stagiaire']['nom']}")
        print(f"📧 Email: {response_data['stagiaire']['email']}")
        print(f"🔑 Mot de passe généré: {response_data['stagiaire']['password']}")
        print(f"📋 Stage créé: {response_data['stage']['title']}")
        
        # Vérifier que les objets ont été créés en base
        stagiaire = User.objects.filter(email=stagiaire_data['email']).first()
        if stagiaire:
            print(f"✅ Stagiaire trouvé en base: {stagiaire.prenom} {stagiaire.nom}")
            print(f"   Role: {stagiaire.role}")
            print(f"   Institut: {stagiaire.institut}")
        
        demande = Demande.objects.filter(email=stagiaire_data['email']).first()
        if demande:
            print(f"✅ Demande créée: {demande.prenom} {demande.nom}")
            print(f"   Status: {demande.status}")
            print(f"   Type: {demande.type_stage}")
        
        stage = Stage.objects.filter(stagiaire=stagiaire).first()
        if stage:
            print(f"✅ Stage créé: {stage.title}")
            print(f"   Status: {stage.status}")
            print(f"   Progression: {stage.progress}%")
        
    else:
        print("❌ Échec de la création")
        print(f"Erreur: {response.data}")
    
    # Test avec email existant
    print("\n🧪 Test avec email existant...")
    request2 = factory.post('/rh/creer-stagiaire/', stagiaire_data, format='json')
    force_authenticate(request2, user=rh_user)
    response2 = view(request2)
    
    if response2.status_code == status.HTTP_400_BAD_REQUEST:
        print("✅ Erreur correctement gérée pour email dupliqué")
    else:
        print("❌ Erreur non gérée pour email dupliqué")
    
    # Test avec champs manquants
    print("\n🧪 Test avec champs manquants...")
    incomplete_data = {
        'prenom': 'Test',
        'nom': 'Incomplet'
        # email manquant
    }
    
    request3 = factory.post('/rh/creer-stagiaire/', incomplete_data, format='json')
    force_authenticate(request3, user=rh_user)
    response3 = view(request3)
    
    if response3.status_code == status.HTTP_400_BAD_REQUEST:
        print("✅ Validation correcte des champs obligatoires")
    else:
        print("❌ Validation incorrecte des champs obligatoires")
    
    # Test avec utilisateur non-RH
    print("\n🧪 Test avec utilisateur non-RH...")
    stagiaire_user = User.objects.create_user(
        email='stagiaire.test@example.com',
        password='testpass123',
        prenom='Stagiaire',
        nom='Test',
        role='stagiaire'
    )
    
    request4 = factory.post('/rh/creer-stagiaire/', stagiaire_data, format='json')
    force_authenticate(request4, user=stagiaire_user)
    response4 = view(request4)
    
    if response4.status_code == status.HTTP_403_FORBIDDEN:
        print("✅ Permission correctement refusée pour utilisateur non-RH")
    else:
        print("❌ Permission incorrectement accordée")
    
    print("\n🎉 Tests terminés!")

if __name__ == '__main__':
    test_rh_creer_stagiaire() 