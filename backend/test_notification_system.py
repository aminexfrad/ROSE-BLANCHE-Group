#!/usr/bin/env python3
"""
Test script for the notification system
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

def create_test_notifications():
    """Create test notifications for all users"""
    print("Creating test notifications...")
    
    # Get all users
    users = User.objects.all()
    
    if not users.exists():
        print("No users found. Please create some users first.")
        return
    
    # Create test notifications for each user
    for user in users:
        # Create different types of notifications
        notifications = [
            {
                'title': 'Bienvenue sur StageBloom!',
                'message': f'Bonjour {user.prenom}, bienvenue sur la plateforme StageBloom!',
                'notification_type': 'info'
            },
            {
                'title': 'Nouveau stage disponible',
                'message': 'Un nouveau stage correspondant à votre profil est disponible.',
                'notification_type': 'success'
            },
            {
                'title': 'Rappel: Évaluation à compléter',
                'message': 'N\'oubliez pas de compléter votre évaluation de stage.',
                'notification_type': 'warning'
            },
            {
                'title': 'Document approuvé',
                'message': 'Votre rapport de stage a été approuvé par votre tuteur.',
                'notification_type': 'success'
            }
        ]
        
        for notif_data in notifications:
            notification = Notification.objects.create(
                recipient=user,
                title=notif_data['title'],
                message=notif_data['message'],
                notification_type=notif_data['notification_type']
            )
            print(f"Created notification for {user.email}: {notification.title}")
    
    print(f"Created {len(users) * len(notifications)} test notifications")

def test_notification_service():
    """Test the notification service"""
    print("\nTesting notification service...")
    
    # Get a test user
    user = User.objects.first()
    if not user:
        print("No users found for testing.")
        return
    
    # Test sending a notification via service
    try:
        notification = notification_service.send_notification(
            recipient=user,
            title='Test via Service',
            message='This is a test notification sent via the notification service.',
            notification_type='info'
        )
        print(f"Successfully sent notification via service: {notification.title}")
    except Exception as e:
        print(f"Error sending notification via service: {e}")

def check_notification_counts():
    """Check notification counts for each user"""
    print("\nChecking notification counts...")
    
    users = User.objects.all()
    for user in users:
        total = Notification.objects.filter(recipient=user).count()
        unread = Notification.objects.filter(recipient=user, is_read=False).count()
        print(f"{user.email}: {total} total, {unread} unread")

def main():
    """Main test function"""
    print("=== Notification System Test ===")
    
    # Create test notifications
    create_test_notifications()
    
    # Test notification service
    test_notification_service()
    
    # Check counts
    check_notification_counts()
    
    print("\n=== Test completed ===")

if __name__ == '__main__':
    main()
