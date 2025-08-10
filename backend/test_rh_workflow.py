#!/usr/bin/env python3
"""
Test script for RH workflow - Assigning tuteur to stagiaire
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
from shared.models import Notification
from notification_service.services import notification_service

User = get_user_model()

def simulate_rh_assigns_tuteur_workflow():
    """Simulate the complete RH workflow of assigning a tuteur to a stagiaire"""
    print("=== RH Workflow Test: Assigning Tuteur to Stagiaire ===")
    print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Get or create test users
    rh_user = User.objects.filter(email='rh@test.com').first()
    tuteur_user = User.objects.filter(email='tuteur@test.com').first()
    stagiaire_user = User.objects.filter(email='stagiaire@test.com').first()
    
    if not all([rh_user, tuteur_user, stagiaire_user]):
        print("❌ Test users not found. Please run test_rh_notification.py first.")
        return
    
    print(f"\n📋 Workflow Participants:")
    print(f"   RH: {rh_user.prenom} {rh_user.nom} ({rh_user.email})")
    print(f"   Tuteur: {tuteur_user.prenom} {tuteur_user.nom} ({tuteur_user.email})")
    print(f"   Stagiaire: {stagiaire_user.prenom} {stagiaire_user.nom} ({stagiaire_user.email})")
    
    # Step 1: RH initiates the assignment
    print(f"\n🔵 Step 1: RH initiates assignment")
    try:
        rh_init_notification = notification_service.send_notification(
            recipient=rh_user,
            title='Assignation de tuteur initiée',
            message=f'Vous avez initié l\'assignation de {tuteur_user.prenom} {tuteur_user.nom} comme tuteur pour {stagiaire_user.prenom} {stagiaire_user.nom}.',
            notification_type='info'
        )
        print(f"   ✅ Notification sent to RH: {rh_init_notification.title}")
    except Exception as e:
        print(f"   ❌ Error sending notification to RH: {e}")
    
    # Step 2: Notify tuteur about new assignment
    print(f"\n🔵 Step 2: Notify tuteur about new assignment")
    try:
        tuteur_notification = notification_service.send_notification(
            recipient=tuteur_user,
            title='Nouvelle assignation de stagiaire',
            message=f'Vous avez été assigné comme tuteur pour {stagiaire_user.prenom} {stagiaire_user.nom}. Veuillez contacter le stagiaire pour planifier votre première réunion.',
            notification_type='info'
        )
        print(f"   ✅ Notification sent to tuteur: {tuteur_notification.title}")
    except Exception as e:
        print(f"   ❌ Error sending notification to tuteur: {e}")
    
    # Step 3: Notify stagiaire about tuteur assignment
    print(f"\n🔵 Step 3: Notify stagiaire about tuteur assignment")
    try:
        stagiaire_notification = notification_service.send_notification(
            recipient=stagiaire_user,
            title='Tuteur assigné',
            message=f'Votre tuteur a été assigné: {tuteur_user.prenom} {tuteur_user.nom}. Vous recevrez bientôt un email de contact.',
            notification_type='success'
        )
        print(f"   ✅ Notification sent to stagiaire: {stagiaire_notification.title}")
    except Exception as e:
        print(f"   ❌ Error sending notification to stagiaire: {e}")
    
    # Step 4: Tuteur accepts the assignment
    print(f"\n🔵 Step 4: Tuteur accepts the assignment")
    try:
        tuteur_accept_notification = notification_service.send_notification(
            recipient=tuteur_user,
            title='Assignation acceptée',
            message=f'Vous avez accepté l\'assignation pour {stagiaire_user.prenom} {stagiaire_user.nom}. Vous pouvez maintenant commencer le suivi.',
            notification_type='success'
        )
        print(f"   ✅ Notification sent to tuteur: {tuteur_accept_notification.title}")
    except Exception as e:
        print(f"   ❌ Error sending notification to tuteur: {e}")
    
    # Step 5: Notify RH about acceptance
    print(f"\n🔵 Step 5: Notify RH about acceptance")
    try:
        rh_accept_notification = notification_service.send_notification(
            recipient=rh_user,
            title='Assignation confirmée',
            message=f'L\'assignation de {tuteur_user.prenom} {tuteur_user.nom} comme tuteur pour {stagiaire_user.prenom} {stagiaire_user.nom} a été confirmée.',
            notification_type='success'
        )
        print(f"   ✅ Notification sent to RH: {rh_accept_notification.title}")
    except Exception as e:
        print(f"   ❌ Error sending notification to RH: {e}")
    
    # Step 6: Notify stagiaire about confirmation
    print(f"\n🔵 Step 6: Notify stagiaire about confirmation")
    try:
        stagiaire_confirm_notification = notification_service.send_notification(
            recipient=stagiaire_user,
            title='Assignation confirmée',
            message=f'L\'assignation de votre tuteur {tuteur_user.prenom} {tuteur_user.nom} a été confirmée. Vous pouvez maintenant commencer votre stage.',
            notification_type='success'
        )
        print(f"   ✅ Notification sent to stagiaire: {stagiaire_confirm_notification.title}")
    except Exception as e:
        print(f"   ❌ Error sending notification to stagiaire: {e}")
    
    # Check final notification status
    print(f"\n📊 Final Notification Status:")
    for user in [rh_user, tuteur_user, stagiaire_user]:
        total = Notification.objects.filter(recipient=user).count()
        unread = Notification.objects.filter(recipient=user, is_read=False).count()
        print(f"   {user.role.upper()} ({user.email}): {total} total, {unread} unread")
    
    print(f"\n=== Workflow completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ===")
    print("\n🎯 To test the frontend notification bell:")
    print("1. Make sure backend server is running: python manage.py runserver")
    print("2. Make sure frontend server is running: npm run dev")
    print("3. Login with any test user:")
    print("   - RH: rh@test.com / testpass123")
    print("   - Tuteur: tuteur@test.com / testpass123")
    print("   - Stagiaire: stagiaire@test.com / testpass123")
    print("4. Check the notification bell in the dashboard")
    print("5. Navigate to /test-notifications-final to see detailed status")

if __name__ == '__main__':
    simulate_rh_assigns_tuteur_workflow()
