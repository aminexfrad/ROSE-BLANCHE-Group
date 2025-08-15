#!/usr/bin/env python3
"""
Script pour corriger le problème du champ date_soumission et tester la création de demande
"""

import os
import sys
import django
from django.core.management import call_command
from django.test import RequestFactory
from rest_framework.test import force_authenticate
from rest_framework import status

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from demande_service.models import Demande
from demande_service.views import DemandeCreateView
from shared.models import Entreprise, OffreStage

def fix_demande_date_soumission():
    """Corriger le problème du champ date_soumission"""
    
    print("🔧 Correction du problème du champ date_soumission")
    print("=" * 60)
    
    # 1. Appliquer les migrations
    print("\n📋 Application des migrations...")
    try:
        call_command('migrate', 'demande_service', verbosity=0)
        print("✅ Migrations appliquées avec succès")
    except Exception as e:
        print(f"❌ Erreur lors de l'application des migrations: {e}")
        return False
    
    # 2. Vérifier que le champ est bien ajouté
    print("\n🔍 Vérification du modèle...")
    try:
        model_fields = Demande._meta.get_fields()
        field_names = [field.name for field in model_fields]
        
        if 'date_soumission' in field_names:
            print("✅ Champ 'date_soumission' présent dans le modèle")
        else:
            print("❌ Champ 'date_soumission' manquant dans le modèle")
            return False
            
    except Exception as e:
        print(f"❌ Erreur lors de la vérification du modèle: {e}")
        return False
    
    # 3. Créer des données de test
    print("\n📝 Création des données de test...")
    try:
        # Créer une entreprise de test
        entreprise, created = Entreprise.objects.get_or_create(
            nom="Entreprise Test Demande",
            defaults={
                'description': 'Entreprise de test pour la création de demande',
                'secteur_activite': 'Technologie'
            }
        )
        
        if created:
            print(f"✅ Entreprise créée: {entreprise.nom}")
        else:
            print(f"✅ Entreprise existante: {entreprise.nom}")
        
        # Créer une offre de stage de test
        offre, created = OffreStage.objects.get_or_create(
            title="Stage Test PFE",
            defaults={
                'description': 'Stage de test pour vérifier la création de demande',
                'entreprise': entreprise,
                'location': 'Paris',
                'type_stage': 'Stage PFE',
                'status': 'active'
            }
        )
        
        if created:
            print(f"✅ Offre créée: {offre.title}")
        else:
            print(f"✅ Offre existante: {offre.title}")
            
    except Exception as e:
        print(f"❌ Erreur lors de la création des données de test: {e}")
        return False
    
    # 4. Tester la création de demande
    print("\n🧪 Test de création de demande...")
    try:
        factory = RequestFactory()
        
        # Données de test pour la demande
        test_data = {
            'nom': 'Test',
            'prenom': 'Candidat',
            'email': 'test@example.com',
            'telephone': '0123456789',
            'institut': 'Institut Test',
            'specialite': 'Informatique',
            'type_stage': 'Stage PFE',
            'niveau': 'Bac+5',
            'date_debut': '2024-01-01',
            'date_fin': '2024-06-30',
            'stage_binome': False,
            'offer_ids': [offre.id]
        }
        
        # Créer la requête
        request = factory.post('/demandes/create/', test_data, format='json')
        
        # Appeler la vue
        view = DemandeCreateView.as_view()
        response = view(request)
        
        if response.status_code == status.HTTP_201_CREATED:
            print("✅ Création de demande réussie!")
            demande_data = response.data
            print(f"   - ID: {demande_data.get('id')}")
            print(f"   - Nom: {demande_data.get('nom')} {demande_data.get('prenom')}")
            print(f"   - Email: {demande_data.get('email')}")
            print(f"   - Statut: {demande_data.get('status')}")
            
            # Vérifier en base
            demande = Demande.objects.get(id=demande_data['id'])
            print(f"   - Date soumission: {demande.date_soumission}")
            print(f"   - Date création: {demande.created_at}")
            
        else:
            print(f"❌ Échec de création de demande: {response.status_code}")
            print(f"   Erreur: {response.data}")
            return False
            
    except Exception as e:
        print(f"❌ Erreur lors du test de création: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # 5. Nettoyage des données de test
    print("\n🧹 Nettoyage des données de test...")
    try:
        Demande.objects.filter(email='test@example.com').delete()
        print("✅ Données de test supprimées")
    except Exception as e:
        print(f"⚠️ Erreur lors du nettoyage: {e}")
    
    print("\n🎉 Test de correction terminé avec succès!")
    return True

if __name__ == '__main__':
    success = fix_demande_date_soumission()
    if success:
        print("\n✅ Le problème du champ date_soumission est résolu!")
        print("🚀 Vous pouvez maintenant créer des demandes de stage")
    else:
        print("\n❌ La correction a échoué")
        print("🔍 Vérifiez les erreurs ci-dessus")
