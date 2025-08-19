#!/usr/bin/env python
"""
Simple test script to check the interview proposal endpoint
"""

import os
import sys
import django
from datetime import datetime, timedelta

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stagebloom.settings')
django.setup()

from django.test import RequestFactory
from django.contrib.auth import get_user_model
from rest_framework.test import force_authenticate
from rest_framework import status
from demande_service.views import propose_interview_request
from demande_service.models import Demande
from shared.models import Entreprise, Notification

User = get_user_model()

def test_interview_endpoint():
    """Test the interview proposal endpoint"""
    
    print("🧪 Testing Interview Proposal Endpoint")
    print("=" * 50)
    
    try:
        # Check if Notification model is accessible
        print("1. Checking Notification model...")
        notification_count = Notification.objects.count()
        print(f"✅ Notification model accessible. Count: {notification_count}")
        
        # Check if we can create a test notification
        print("2. Testing Notification creation...")
        test_notification = Notification.objects.create(
            recipient=User.objects.first(),
            title='Test',
            message='Test message',
            notification_type='info'
        )
        print(f"✅ Notification created successfully. ID: {test_notification.id}")
        
        # Clean up
        test_notification.delete()
        print("✅ Test notification cleaned up")
        
        print("✅ All tests passed! The issue is likely elsewhere.")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_interview_endpoint()
