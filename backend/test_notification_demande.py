#!/usr/bin/env python3
"""
Test de création de notification lors de la création d'une demande de stage
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from demande_service.models import Demande
from shared.models import Entreprise, OffreStage
from notification_service.models import NotificationEvent
from auth_service.models import User

def test_notification_demande():
    """Test de création de notification pour une demande"""
    
    print("🧪 Test de création de notification pour une demande")
    print("=" * 70)
    
    # 1. Vérifier l'état initial
    print("\n📋 État initial:")
    
    initial_notifications = NotificationEvent.objects.filter(event_type='demande').count()
    print(f"   - Notifications de demande existantes: {initial_notifications}")
    
    initial_demandes = Demande.objects.count()
    print(f"   - Demandes existantes: {initial_demandes}")
    
    # 2. Créer une entreprise de test
    print(f"\n🏢 Création de l'entreprise de test...")
    
    entreprise, created = Entreprise.objects.get_or_create(
        nom="Test Notifications",
        defaults={
            'description': 'Entreprise de test pour les notifications',
            'secteur_activite': 'Test'
        }
    )
    
    if created:
        print(f"   ✅ Entreprise créée: {entreprise.nom}")
    else:
        print(f"   ✅ Entreprise existante: {entreprise.nom}")
    
    # 3. Créer une offre de stage
    print(f"\n📝 Création de l'offre de stage...")
    
    offre, created = OffreStage.objects.get_or_create(
        title="Test Notification Stage",
        defaults={
            'description': 'Stage de test pour vérifier les notifications',
            'entreprise': entreprise,
            'ville': 'Test',
            'type': 'PFE',
            'status': 'open',
            'diplome': 'Bac+5',
            'specialite': 'Test',
            'nombre_postes': 1,
            'validated': True
        }
    )
    
    if created:
        print(f"   ✅ Offre créée: {offre.title}")
    else:
        print(f"   ✅ Offre existante: {offre.title}")
    
    # 4. Créer une demande de stage (ce qui devrait déclencher la notification)
    print(f"\n🚀 Création de la demande de stage...")
    
    try:
        demande = Demande.objects.create(
            nom="Test",
            prenom="Notification",
            email="test.notification@example.com",
            telephone="0123456789",
            institut="Institut Test",
            specialite="Test",
            type_stage="Stage Test",
            niveau="Bac+5",
            pfe_reference="Test Ref",
            date_debut="2024-02-01",
            date_fin="2024-07-31",
            stage_binome=False,
            nom_binome="",
            prenom_binome="",
            email_binome="",
            telephone_binome="",
            status="pending",
            raison_refus="",
            entreprise=entreprise
        )
        
        # Lier l'offre à la demande
        demande.offres.add(offre)
        
        print(f"   ✅ Demande créée avec succès (ID: {demande.id})")
        print(f"      - Nom: {demande.prenom} {demande.nom}")
        print(f"      - Email: {demande.email}")
        print(f"      - Entreprise: {demande.entreprise.nom if demande.entreprise else 'None'}")
        
    except Exception as e:
        print(f"   ❌ Erreur lors de la création de la demande: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # 5. Vérifier si la notification a été créée
    print(f"\n🔔 Vérification de la notification...")
    
    try:
        # Attendre un peu pour que le signal se déclenche
        import time
        time.sleep(1)
        
        # Vérifier les nouvelles notifications
        new_notifications = NotificationEvent.objects.filter(event_type='demande').count()
        print(f"   - Notifications de demande après création: {new_notifications}")
        
        if new_notifications > initial_notifications:
            print(f"   ✅ Nouvelle notification créée!")
            
            # Afficher les détails de la notification
            latest_notification = NotificationEvent.objects.filter(event_type='demande').order_by('-created_at').first()
            if latest_notification:
                print(f"      - ID: {latest_notification.id}")
                print(f"      - Type: {latest_notification.event_type}")
                print(f"      - Données: {latest_notification.event_data}")
                print(f"      - Traité: {latest_notification.processed}")
                print(f"      - Créé: {latest_notification.created_at}")
                
                # Vérifier les utilisateurs cibles
                target_users = latest_notification.target_users.all()
                print(f"      - Utilisateurs cibles: {target_users.count()}")
                for user in target_users:
                    print(f"        * {user.email} ({user.role})")
                    
        else:
            print(f"   ❌ Aucune nouvelle notification créée")
            print(f"   🔍 Vérifiez que le signal est bien connecté")
            
    except Exception as e:
        print(f"   ❌ Erreur lors de la vérification: {e}")
        import traceback
        traceback.print_exc()
    
    # 6. Nettoyage
    print(f"\n🧹 Nettoyage...")
    
    try:
        # Supprimer la demande de test
        demande.delete()
        print(f"   ✅ Demande de test supprimée")
        
        # Supprimer l'offre de test
        offre.delete()
        print(f"   ✅ Offre de test supprimée")
        
        # Supprimer l'entreprise de test
        entreprise.delete()
        print(f"   ✅ Entreprise de test supprimée")
        
    except Exception as e:
        print(f"   ⚠️ Erreur lors du nettoyage: {e}")
    
    # 7. Résumé
    print(f"\n📊 Résumé du test:")
    
    if new_notifications > initial_notifications:
        print(f"   ✅ SUCCÈS: La notification a été créée automatiquement")
        print(f"   🎉 Le système de notifications fonctionne pour les demandes!")
    else:
        print(f"   ❌ ÉCHEC: Aucune notification créée")
        print(f"   🔧 Vérifiez la configuration des signaux")
    
    return new_notifications > initial_notifications

if __name__ == '__main__':
    success = test_notification_demande()
    if success:
        print(f"\n🎯 Test réussi! Vous devriez maintenant recevoir les notifications")
    else:
        print(f"\n❌ Test échoué - Vérifiez la configuration")
