#!/usr/bin/env python3
"""
Test script for RH notification system - Assigning tuteur to stagiaire
© 2025 Mohamed Amine FRAD. All rights reserved.
"""

import os
import sys
import django
from datetime import datetime

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'gateway'))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stagebloom.settings')
django.setup()

from django.contrib.auth import get_user_model
from shared.models import Notification, OffreStage
from notification_service.services import notification_service

User = get_user_model()

def create_test_users():
    """Create test users if they don't exist"""
    print("Creating test users...")
    
    # Create RH user
    rh_user, created = User.objects.get_or_create(
        email='rh@test.com',
        defaults={
            'prenom': 'RH',
            'nom': 'Manager',
            'role': 'rh',
            'is_active': True
        }
    )
    if created:
        rh_user.set_password('testpass123')
        rh_user.save()
        print(f"Created RH user: {rh_user.email}")
    else:
        print(f"RH user already exists: {rh_user.email}")
    
    # Create Tuteur user
    tuteur_user, created = User.objects.get_or_create(
        email='tuteur@test.com',
        defaults={
            'prenom': 'Jean',
            'nom': 'Dupont',
            'role': 'tuteur',
            'is_active': True
        }
    )
    if created:
        tuteur_user.set_password('testpass123')
        tuteur_user.save()
        print(f"Created Tuteur user: {tuteur_user.email}")
    else:
        print(f"Tuteur user already exists: {tuteur_user.email}")
    
    # Create Stagiaire user
    stagiaire_user, created = User.objects.get_or_create(
        email='stagiaire@test.com',
        defaults={
            'prenom': 'Marie',
            'nom': 'Martin',
            'role': 'stagiaire',
            'is_active': True
        }
    )
    if created:
        stagiaire_user.set_password('testpass123')
        stagiaire_user.save()
        print(f"Created Stagiaire user: {stagiaire_user.email}")
    else:
        print(f"Stagiaire user already exists: {stagiaire_user.email}")
    
    return rh_user, tuteur_user, stagiaire_user

def simulate_rh_assigns_tuteur(rh_user, tuteur_user, stagiaire_user):
    """Simulate RH assigning a tuteur to a stagiaire"""
    print(f"\n=== Simulating RH Assignment ===")
    print(f"RH: {rh_user.prenom} {rh_user.nom}")
    print(f"Tuteur: {tuteur_user.prenom} {tuteur_user.nom}")
    print(f"Stagiaire: {stagiaire_user.prenom} {stagiaire_user.nom}")
    
    # Send notification to tuteur
    try:
        tuteur_notification = notification_service.send_notification(
            recipient=tuteur_user,
            title='Nouvelle assignation de stagiaire',
            message=f'Vous avez été assigné comme tuteur pour {stagiaire_user.prenom} {stagiaire_user.nom}. Veuillez contacter le stagiaire pour planifier votre première réunion.',
            notification_type='info'
        )
        print(f"✓ Notification sent to tuteur: {tuteur_notification.title}")
    except Exception as e:
        print(f"✗ Error sending notification to tuteur: {e}")
    
    # Send notification to stagiaire
    try:
        stagiaire_notification = notification_service.send_notification(
            recipient=stagiaire_user,
            title='Tuteur assigné',
            message=f'Votre tuteur a été assigné: {tuteur_user.prenom} {tuteur_user.nom}. Vous recevrez bientôt un email de contact.',
            notification_type='success'
        )
        print(f"✓ Notification sent to stagiaire: {stagiaire_notification.title}")
    except Exception as e:
        print(f"✗ Error sending notification to stagiaire: {e}")
    
    # Send confirmation to RH
    try:
        rh_notification = notification_service.send_notification(
            recipient=rh_user,
            title='Assignation confirmée',
            message=f'L\'assignation de {tuteur_user.prenom} {tuteur_user.nom} comme tuteur pour {stagiaire_user.prenom} {stagiaire_user.nom} a été effectuée avec succès.',
            notification_type='success'
        )
        print(f"✓ Notification sent to RH: {rh_notification.title}")
    except Exception as e:
        print(f"✗ Error sending notification to RH: {e}")

def check_notifications():
    """Check all notifications for each user"""
    print(f"\n=== Notification Status ===")
    
    users = User.objects.filter(role__in=['rh', 'tuteur', 'stagiaire'])
    for user in users:
        total = Notification.objects.filter(recipient=user).count()
        unread = Notification.objects.filter(recipient=user, is_read=False).count()
        print(f"{user.role.upper()} ({user.email}): {total} total, {unread} unread")
        
        # Show recent notifications
        recent = Notification.objects.filter(recipient=user).order_by('-created_at')[:3]
        for notif in recent:
            print(f"  - {notif.title} ({notif.notification_type}) - {'UNREAD' if not notif.is_read else 'READ'}")

def test_websocket_notification():
    """Test WebSocket notification sending"""
    print(f"\n=== Testing WebSocket Notifications ===")
    
    # Get a test user
    user = User.objects.filter(role='stagiaire').first()
    if not user:
        print("No stagiaire user found for WebSocket test")
        return
    
    try:
        # Send a test notification via WebSocket
        notification = notification_service.send_notification(
            recipient=user,
            title='Test WebSocket Notification',
            message='This is a test notification to verify WebSocket functionality.',
            notification_type='info'
        )
        print(f"✓ WebSocket test notification sent: {notification.title}")
        
        # Check if notification was created
        if Notification.objects.filter(id=notification.id).exists():
            print("✓ Notification saved to database")
        else:
            print("✗ Notification not saved to database")
            
    except Exception as e:
        print(f"✗ Error in WebSocket test: {e}")

def main():
    """Main test function"""
    print("=== RH Notification System Test ===")
    print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Create test users
    rh_user, tuteur_user, stagiaire_user = create_test_users()
    
    # Simulate RH assignment
    simulate_rh_assigns_tuteur(rh_user, tuteur_user, stagiaire_user)
    
    # Check notification status
    check_notifications()
    
    # Test WebSocket notifications
    test_websocket_notification()
    
    print(f"\n=== Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ===")
    print("\nTo test the frontend:")
    print("1. Make sure backend server is running: python manage.py runserver")
    print("2. Make sure frontend server is running: npm run dev")
    print("3. Login with any test user (rh@test.com, tuteur@test.com, stagiaire@test.com)")
    print("4. Check the notification bell in the dashboard")
    print("5. Navigate to /test-notifications to see detailed status")

if __name__ == '__main__':
    main()
