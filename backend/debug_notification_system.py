#!/usr/bin/env python3
"""
Script pour diagnostiquer le système de notifications
et identifier pourquoi les demandes ne sont pas reçues
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from notification_service.models import NotificationEvent
from demande_service.models import Demande
from shared.models import Entreprise, OffreStage
from auth_service.models import User

def debug_notification_system():
    """Diagnostic du système de notifications"""
    
    print("🔍 Diagnostic du système de notifications")
    print("=" * 60)
    
    # 1. Vérifier l'état des notifications
    print("\n📋 État des notifications:")
    
    try:
        notifications_count = NotificationEvent.objects.count()
        print(f"   - Nombre total d'événements de notification: {notifications_count}")
        
        if notifications_count > 0:
            # Afficher les dernières notifications
            latest_notifications = NotificationEvent.objects.order_by('-created_at')[:5]
            print(f"   - 5 derniers événements de notification:")
            for notif in latest_notifications:
                print(f"     * {notif.event_type} - {notif.processed} - {notif.created_at}")
        else:
            print(f"   ⚠️ Aucun événement de notification trouvé")
            
    except Exception as e:
        print(f"   ❌ Erreur lors de la vérification des notifications: {e}")
    
    # 2. Vérifier les demandes de stage
    print(f"\n📝 État des demandes de stage:")
    
    try:
        demandes_count = Demande.objects.count()
        print(f"   - Nombre total de demandes: {demandes_count}")
        
        if demandes_count > 0:
            # Afficher les dernières demandes
            latest_demandes = Demande.objects.order_by('-created_at')[:5]
            print(f"   - 5 dernières demandes:")
            for demande in latest_demandes:
                print(f"     * {demande.prenom} {demande.nom} - {demande.email} - {demande.status} - {demande.created_at}")
        else:
            print(f"   ⚠️ Aucune demande trouvée")
            
    except Exception as e:
        print(f"   ❌ Erreur lors de la vérification des demandes: {e}")
    
    # 3. Vérifier les entreprises et offres
    print(f"\n🏢 État des entreprises et offres:")
    
    try:
        entreprises_count = Entreprise.objects.count()
        print(f"   - Nombre d'entreprises: {entreprises_count}")
        
        offres_count = OffreStage.objects.count()
        print(f"   - Nombre d'offres de stage: {offres_count}")
        
        if entreprises_count > 0:
            entreprises = Entreprise.objects.all()[:3]
            print(f"   - Exemples d'entreprises:")
            for entreprise in entreprises:
                print(f"     * {entreprise.nom} - {entreprise.secteur_activite}")
                
    except Exception as e:
        print(f"   ❌ Erreur lors de la vérification des entreprises: {e}")
    
    # 4. Vérifier les utilisateurs RH
    print(f"\n👥 Utilisateurs RH:")
    
    try:
        rh_users = User.objects.filter(role='rh')
        rh_count = rh_users.count()
        print(f"   - Nombre d'utilisateurs RH: {rh_count}")
        
        if rh_count > 0:
            print(f"   - Utilisateurs RH:")
            for user in rh_users:
                entreprise_nom = user.entreprise.nom if user.entreprise else "Aucune"
                print(f"     * {user.email} - {user.first_name} {user.last_name} - Entreprise: {entreprise_nom}")
        else:
            print(f"   ⚠️ Aucun utilisateur RH trouvé")
            
    except Exception as e:
        print(f"   ❌ Erreur lors de la vérification des utilisateurs RH: {e}")
    
    # 5. Vérifier la configuration des notifications
    print(f"\n⚙️ Configuration des notifications:")
    
    try:
        # Vérifier si les signaux sont configurés
        from notification_service import signals
        print(f"   ✅ Module de signaux disponible")
        
        # Vérifier les services de notification
        from notification_service import services
        print(f"   ✅ Module de services disponible")
        
    except Exception as e:
        print(f"   ❌ Erreur dans la configuration des notifications: {e}")
    
    # 6. Test de création de notification
    print(f"\n🧪 Test de création de notification...")
    
    try:
        # Créer une notification de test
        test_notification = NotificationEvent.objects.create(
            event_type="test",
            event_data={"message": "Ceci est un test du système de notifications"},
            processed=False
        )
        print(f"   ✅ Événement de notification de test créé (ID: {test_notification.id})")
        
        # Supprimer la notification de test
        test_notification.delete()
        print(f"   ✅ Événement de notification de test supprimé")
        
    except Exception as e:
        print(f"   ❌ Erreur lors de la création de notification de test: {e}")
    
    # 7. Vérifier les signaux de demande
    print(f"\n🔔 Vérification des signaux de demande:")
    
    try:
        # Vérifier si le signal de création de demande est connecté
        from django.db.models.signals import post_save
        from notification_service.signals import create_demande_notification
        
        # Lister les signaux connectés
        print(f"   - Signaux post_save connectés:")
        for receiver in post_save._live_receivers:
            if 'demande' in str(receiver).lower():
                print(f"     * {receiver}")
        
    except Exception as e:
        print(f"   ❌ Erreur lors de la vérification des signaux: {e}")
    
    # 8. Recommandations
    print(f"\n💡 Recommandations:")
    
    if notifications_count == 0:
        print(f"   🔧 Aucun événement de notification - Vérifier la configuration des signaux")
        print(f"   📧 Vérifier que les signaux sont bien connectés aux modèles")
        
    if demandes_count == 0:
        print(f"   🔧 Aucune demande - Le problème peut être dans la création des demandes")
        
    print(f"   🔍 Vérifier les logs Django pour les erreurs de notification")
    print(f"   📱 Vérifier que le frontend écoute bien les notifications")
    
    return notifications_count > 0 and demandes_count > 0

if __name__ == '__main__':
    success = debug_notification_system()
    if success:
        print(f"\n✅ Le système de notifications semble fonctionnel")
    else:
        print(f"\n❌ Problèmes détectés dans le système de notifications")
