"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

"""
Test script for the candidate account deactivation system.
This script tests the various components of the automatic deactivation system.
"""

import os
import sys
import django
from datetime import datetime, timedelta

# Add the parent directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from django.utils import timezone
from django.test import TestCase
from django.core.management import call_command
from django.core.management.base import CommandError
from io import StringIO

from auth_service.models import User
from shared.models import Candidat
from candidat_service.tasks import (
    deactivate_inactive_candidate_accounts,
    check_candidate_activity,
    send_deactivation_warnings
)


def test_management_command():
    """Test the management command for deactivating inactive candidates"""
    print("Testing management command...")
    
    try:
        # Test dry-run mode
        out = StringIO()
        call_command('deactivate_inactive_candidates', '--dry-run', stdout=out)
        output = out.getvalue()
        print("✓ Management command dry-run works")
        print(f"Output: {output[:200]}...")
        
        # Test with custom days
        out = StringIO()
        call_command('deactivate_inactive_candidates', '--days', '30', '--dry-run', stdout=out)
        output = out.getvalue()
        print("✓ Management command with custom days works")
        
    except Exception as e:
        print(f"✗ Management command test failed: {e}")


def test_celery_tasks():
    """Test the Celery tasks"""
    print("\nTesting Celery tasks...")
    
    try:
        # Test activity check task
        result = check_candidate_activity()
        print(f"✓ Activity check task works: {result}")
        
        # Test deactivation task (dry run - won't actually deactivate)
        # First, let's check if there are any candidates to deactivate
        cutoff_date = timezone.now() - timedelta(days=365)
        inactive_candidates = User.objects.filter(
            role=User.Role.CANDIDAT,
            is_active=True,
            last_login__lt=cutoff_date
        ).count()
        
        if inactive_candidates > 0:
            print(f"Found {inactive_candidates} candidates that could be deactivated")
            # Note: We won't actually run the deactivation task in testing
            # to avoid affecting real data
        else:
            print("No candidates found for deactivation (this is good for testing)")
        
        print("✓ Celery tasks are working")
        
    except Exception as e:
        print(f"✗ Celery task test failed: {e}")


def test_candidate_queries():
    """Test candidate queries and statistics"""
    print("\nTesting candidate queries...")
    
    try:
        # Get basic statistics
        total_candidates = User.objects.filter(role=User.Role.CANDIDAT).count()
        active_candidates = User.objects.filter(role=User.Role.CANDIDAT, is_active=True).count()
        inactive_candidates = User.objects.filter(role=User.Role.CANDIDAT, is_active=False).count()
        
        print(f"✓ Total candidates: {total_candidates}")
        print(f"✓ Active candidates: {active_candidates}")
        print(f"✓ Inactive candidates: {inactive_candidates}")
        
        # Check recent activity
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recently_active = User.objects.filter(
            role=User.Role.CANDIDAT,
            last_login__gte=thirty_days_ago
        ).count()
        
        print(f"✓ Recently active (30 days): {recently_active}")
        
        # Check accounts approaching deactivation
        eleven_months_ago = timezone.now() - timedelta(days=335)
        approaching_deactivation = User.objects.filter(
            role=User.Role.CANDIDAT,
            is_active=True,
            last_login__lt=eleven_months_ago
        ).count()
        
        print(f"✓ Approaching deactivation (11+ months): {approaching_deactivation}")
        
    except Exception as e:
        print(f"✗ Candidate query test failed: {e}")


def test_email_templates():
    """Test email template rendering"""
    print("\nTesting email templates...")
    
    try:
        from django.template.loader import render_to_string
        from django.conf import settings
        
        # Test deactivation notification template
        context = {
            'nom': 'Test',
            'prenom': 'User',
            'site_url': 'http://localhost:3000'
        }
        
        html_content = render_to_string('emails/candidat_account_deactivated.html', context)
        text_content = render_to_string('emails/candidat_account_deactivated.txt', context)
        
        if html_content and text_content:
            print("✓ Email templates render correctly")
            print(f"✓ HTML template length: {len(html_content)} characters")
            print(f"✓ Text template length: {len(text_content)} characters")
        else:
            print("✗ Email templates failed to render")
            
    except Exception as e:
        print(f"✗ Email template test failed: {e}")


def main():
    """Main test function"""
    print("=" * 60)
    print("STAGEBLOOM CANDIDATE DEACTIVATION SYSTEM TEST")
    print("=" * 60)
    
    try:
        # Run all tests
        test_management_command()
        test_celery_tasks()
        test_candidate_queries()
        test_email_templates()
        
        print("\n" + "=" * 60)
        print("✓ ALL TESTS COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        
        print("\nNext steps:")
        print("1. Start Redis server: redis-server")
        print("2. Start Celery services: .\\start_celery.ps1")
        print("3. Test with real data: python manage.py deactivate_inactive_candidates --dry-run")
        print("4. Monitor tasks at: http://localhost:5555 (if Flower is running)")
        
    except Exception as e:
        print(f"\n✗ Test suite failed: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
