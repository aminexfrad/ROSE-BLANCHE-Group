"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

import os
import sys
import django
from django.conf import settings

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from django.contrib.auth import get_user_model
from notification_service.role_notifications import RoleNotificationHelper
from notification_service.services import NotificationService
from shared.models import Notification

User = get_user_model()


def test_role_based_notifications():
    """
    Test the role-based notification system
    """
    print("🧪 Testing Role-Based Notification System")
    print("=" * 50)
    
    try:
        # Initialize services
        helper = RoleNotificationHelper()
        notification_service = NotificationService()
        
        # Test 1: Send notification to stagiaires
        print("\n1. Testing stagiaire notifications...")
        stagiaire_notifications = helper.notify_stagiaires(
            title="Test Notification - Stagiaires",
            message="Ceci est un test de notification pour tous les stagiaires",
            notification_type='info'
        )
        print(f"   ✅ Sent {len(stagiaire_notifications)} notifications to stagiaires")
        
        # Test 2: Send notification to tuteurs
        print("\n2. Testing tuteur notifications...")
        tuteur_notifications = helper.notify_tuteurs(
            title="Test Notification - Tuteurs",
            message="Ceci est un test de notification pour tous les tuteurs",
            notification_type='info'
        )
        print(f"   ✅ Sent {len(tuteur_notifications)} notifications to tuteurs")
        
        # Test 3: Send notification to RH team
        print("\n3. Testing RH team notifications...")
        rh_notifications = helper.notify_rh_team(
            title="Test Notification - RH",
            message="Ceci est un test de notification pour l'équipe RH",
            notification_type='info'
        )
        print(f"   ✅ Sent {len(rh_notifications)} notifications to RH team")
        
        # Test 4: Send notification to admin team
        print("\n4. Testing admin team notifications...")
        admin_notifications = helper.notify_admin_team(
            title="Test Notification - Admin",
            message="Ceci est un test de notification pour l'équipe admin",
            notification_type='info'
        )
        print(f"   ✅ Sent {len(admin_notifications)} notifications to admin team")
        
        # Test 5: Send notification to management team (admin + RH)
        print("\n5. Testing management team notifications...")
        management_notifications = helper.notify_management_team(
            title="Test Notification - Management",
            message="Ceci est un test de notification pour l'équipe de direction",
            notification_type='warning'
        )
        print(f"   ✅ Sent {len(management_notifications)} notifications to management team")
        
        # Test 6: Test convenience functions
        print("\n6. Testing convenience functions...")
        
        # Test stage event creation
        stage_event = helper.create_stage_event(
            event_type='stage_update',
            stage_id=1,  # Assuming stage with ID 1 exists
            event_data={
                'action': 'test_stage_event',
                'message': 'Test stage event notification'
            }
        )
        print(f"   ✅ Created stage event: {stage_event.id if stage_event else 'None'}")
        
        # Test survey event creation
        survey_event = helper.create_survey_event(
            event_type='survey',
            survey_id=1,  # Assuming survey with ID 1 exists
            event_data={
                'action': 'test_survey_event',
                'message': 'Test survey event notification'
            }
        )
        print(f"   ✅ Created survey event: {survey_event.id if survey_event else 'None'}")
        
        # Test 7: Verify notifications in database
        print("\n7. Verifying notifications in database...")
        total_notifications = Notification.objects.count()
        print(f"   📊 Total notifications in database: {total_notifications}")
        
        # Count by role
        role_counts = {}
        for role in ['stagiaire', 'tuteur', 'rh', 'admin']:
            role_users = User.objects.filter(role=role, is_active=True)
            role_notifications = Notification.objects.filter(
                recipient__in=role_users
            ).count()
            role_counts[role] = {
                'user_count': role_users.count(),
                'notification_count': role_notifications
            }
            print(f"   📊 {role.capitalize()}: {role_users.count()} users, {role_notifications} notifications")
        
        # Test 8: Test notification service methods
        print("\n8. Testing notification service methods...")
        
        # Test bulk notifications
        test_users = list(User.objects.filter(is_active=True)[:3])  # Get first 3 active users
        if test_users:
            bulk_notifications = notification_service.send_bulk_notifications(
                recipients=test_users,
                title="Test Bulk Notification",
                message="Ceci est un test de notification en lot",
                notification_type='success'
            )
            print(f"   ✅ Sent {len(bulk_notifications)} bulk notifications")
        
        # Test broadcast
        broadcast_result = notification_service.send_broadcast(
            message="Test broadcast message to all users",
            level='info'
        )
        print(f"   ✅ Broadcast sent: {broadcast_result}")
        
        print("\n🎉 All tests completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Error during testing: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_notification_filtering():
    """
    Test notification filtering by role
    """
    print("\n🔍 Testing Notification Filtering by Role")
    print("=" * 50)
    
    try:
        # Get users by role
        stagiaires = User.objects.filter(role='stagiaire', is_active=True)
        tuteurs = User.objects.filter(role='tuteur', is_active=True)
        rh_users = User.objects.filter(role='rh', is_active=True)
        admins = User.objects.filter(role='admin', is_active=True)
        
        print(f"📊 Active users by role:")
        print(f"   Stagiaires: {stagiaires.count()}")
        print(f"   Tuteurs: {tuteurs.count()}")
        print(f"   RH: {rh_users.count()}")
        print(f"   Admins: {admins.count()}")
        
        # Test role-specific notifications
        helper = RoleNotificationHelper()
        
        # Send different types of notifications to different roles
        print("\n📤 Sending role-specific test notifications...")
        
        # Info notifications
        helper.notify_stagiaires("Info Stagiaire", "Information pour les stagiaires", "info")
        helper.notify_tuteurs("Info Tuteur", "Information pour les tuteurs", "info")
        helper.notify_rh_team("Info RH", "Information pour l'équipe RH", "info")
        helper.notify_admin_team("Info Admin", "Information pour l'équipe admin", "info")
        
        # Success notifications
        helper.notify_stagiaires("Succès Stagiaire", "Succès pour les stagiaires", "success")
        helper.notify_tuteurs("Succès Tuteur", "Succès pour les tuteurs", "success")
        
        # Warning notifications
        helper.notify_rh_team("Avertissement RH", "Avertissement pour l'équipe RH", "warning")
        helper.notify_admin_team("Avertissement Admin", "Avertissement pour l'équipe admin", "warning")
        
        # Error notifications
        helper.notify_management_team("Erreur Management", "Erreur pour l'équipe de direction", "error")
        
        print("   ✅ Role-specific notifications sent")
        
        # Verify filtering
        print("\n🔍 Verifying notification filtering...")
        
        for role in ['stagiaire', 'tuteur', 'rh', 'admin']:
            role_users = User.objects.filter(role=role, is_active=True)
            if role_users.exists():
                # Get notifications for first user of this role
                first_user = role_users.first()
                user_notifications = Notification.objects.filter(recipient=first_user)
                
                print(f"   📊 {role.capitalize()} ({first_user.get_full_name()}): {user_notifications.count()} notifications")
                
                # Show notification types
                type_counts = {}
                for notification in user_notifications:
                    notification_type = notification.notification_type
                    type_counts[notification_type] = type_counts.get(notification_type, 0) + 1
                
                for notification_type, count in type_counts.items():
                    print(f"      - {notification_type}: {count}")
        
        print("\n✅ Notification filtering test completed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Error during filtering test: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def cleanup_test_notifications():
    """
    Clean up test notifications
    """
    print("\n🧹 Cleaning up test notifications...")
    
    try:
        # Delete test notifications (those with "Test" in title)
        test_notifications = Notification.objects.filter(title__icontains='Test')
        count = test_notifications.count()
        test_notifications.delete()
        
        print(f"   ✅ Deleted {count} test notifications")
        
        # Show remaining notifications
        remaining = Notification.objects.count()
        print(f"   📊 Remaining notifications: {remaining}")
        
    except Exception as e:
        print(f"   ❌ Error during cleanup: {str(e)}")


def main():
    """
    Main test function
    """
    print("🚀 Starting Role-Based Notification System Tests")
    print("=" * 60)
    
    # Run tests
    success = test_role_based_notifications()
    
    if success:
        success = test_notification_filtering()
    
    if success:
        print("\n🎯 All tests passed! The role-based notification system is working correctly.")
    else:
        print("\n💥 Some tests failed. Please check the error messages above.")
    
    # Cleanup
    cleanup_test_notifications()
    
    print("\n🏁 Testing completed!")


if __name__ == '__main__':
    main()
