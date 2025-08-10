#!/usr/bin/env python3
"""
Comprehensive test script for the notification system
© 2025 Mohamed Amine FRAD. All rights reserved.
"""

import os
import sys
import django
import requests
import json
import time
from datetime import datetime

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend', 'gateway'))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stagebloom.settings')
django.setup()

from django.contrib.auth import get_user_model
from shared.models import Notification
from notification_service.services import notification_service

User = get_user_model()

def test_api_endpoints():
    """Test the notification API endpoints"""
    print("Testing API endpoints...")
    
    base_url = "http://localhost:8000/api"
    
    # Test login to get token
    login_data = {
        "email": "stagiaire@test.com",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(f"{base_url}/auth/login/", json=login_data)
        if response.status_code == 200:
            token = response.json()['access']
            headers = {'Authorization': f'Bearer {token}'}
            
            # Test getting notifications
            response = requests.get(f"{base_url}/notifications/", headers=headers)
            if response.status_code == 200:
                notifications = response.json()
                print(f"✓ API: Successfully retrieved {len(notifications.get('results', []))} notifications")
            else:
                print(f"✗ API: Failed to get notifications - {response.status_code}")
            
            # Test marking notification as read
            if notifications.get('results'):
                first_notif = notifications['results'][0]
                response = requests.post(
                    f"{base_url}/notifications/{first_notif['id']}/read/", 
                    headers=headers
                )
                if response.status_code == 200:
                    print("✓ API: Successfully marked notification as read")
                else:
                    print(f"✗ API: Failed to mark notification as read - {response.status_code}")
            
            # Test marking all as read
            response = requests.post(f"{base_url}/notifications/mark-all-read/", headers=headers)
            if response.status_code == 200:
                print("✓ API: Successfully marked all notifications as read")
            else:
                print(f"✗ API: Failed to mark all notifications as read - {response.status_code}")
                
        else:
            print(f"✗ API: Failed to login - {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("✗ API: Could not connect to server. Make sure the backend is running.")
    except Exception as e:
        print(f"✗ API: Error testing endpoints - {e}")

def test_websocket_connection():
    """Test WebSocket connection"""
    print("\nTesting WebSocket connection...")
    
    try:
        import websocket
        import json
        
        # Test WebSocket connection
        ws = websocket.create_connection("ws://localhost:8000/ws/notifications/")
        
        # Send ping
        ws.send(json.dumps({"type": "ping"}))
        response = ws.recv()
        data = json.loads(response)
        
        if data.get('type') == 'pong':
            print("✓ WebSocket: Successfully connected and received pong")
        else:
            print(f"✗ WebSocket: Unexpected response - {data}")
        
        # Send get_notifications
        ws.send(json.dumps({"type": "get_notifications"}))
        response = ws.recv()
        data = json.loads(response)
        
        if data.get('type') == 'notifications_list':
            print(f"✓ WebSocket: Successfully received notifications list")
        else:
            print(f"✗ WebSocket: Unexpected response for get_notifications - {data}")
        
        ws.close()
        
    except ImportError:
        print("✗ WebSocket: websocket-client package not installed")
    except Exception as e:
        print(f"✗ WebSocket: Error testing connection - {e}")

def test_notification_service():
    """Test the notification service"""
    print("\nTesting notification service...")
    
    # Get a test user
    user = User.objects.filter(email='stagiaire@test.com').first()
    if not user:
        print("✗ Service: Test user not found")
        return
    
    try:
        # Test sending notification
        notification = notification_service.send_notification(
            recipient=user,
            title='Test Notification from Service',
            message='This is a test notification sent via the notification service.',
            notification_type='info'
        )
        print(f"✓ Service: Successfully sent notification - {notification.title}")
        
        # Test sending different types
        for notif_type in ['success', 'warning', 'error']:
            notification = notification_service.send_notification(
                recipient=user,
                title=f'Test {notif_type.title()} Notification',
                message=f'This is a test {notif_type} notification.',
                notification_type=notif_type
            )
            print(f"✓ Service: Successfully sent {notif_type} notification")
        
    except Exception as e:
        print(f"✗ Service: Error testing notification service - {e}")

def test_database_operations():
    """Test database operations"""
    print("\nTesting database operations...")
    
    user = User.objects.filter(email='stagiaire@test.com').first()
    if not user:
        print("✗ Database: Test user not found")
        return
    
    try:
        # Test creating notification
        notification = Notification.objects.create(
            recipient=user,
            title='Test Database Notification',
            message='This notification was created directly in the database.',
            notification_type='info'
        )
        print(f"✓ Database: Successfully created notification - {notification.id}")
        
        # Test reading notification
        notification = Notification.objects.get(id=notification.id)
        print(f"✓ Database: Successfully read notification - {notification.title}")
        
        # Test updating notification
        notification.is_read = True
        notification.save()
        print("✓ Database: Successfully updated notification")
        
        # Test counting notifications
        total_count = Notification.objects.filter(recipient=user).count()
        unread_count = Notification.objects.filter(recipient=user, is_read=False).count()
        print(f"✓ Database: User has {total_count} total and {unread_count} unread notifications")
        
    except Exception as e:
        print(f"✗ Database: Error testing database operations - {e}")

def main():
    """Main test function"""
    print("=== Comprehensive Notification System Test ===")
    print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test database operations
    test_database_operations()
    
    # Test notification service
    test_notification_service()
    
    # Test API endpoints
    test_api_endpoints()
    
    # Test WebSocket connection
    test_websocket_connection()
    
    print("\n=== Test Summary ===")
    print("If you see ✓ marks, the corresponding component is working correctly.")
    print("If you see ✗ marks, there are issues that need to be addressed.")
    print("\nTo test the frontend notification bell:")
    print("1. Make sure both backend and frontend servers are running")
    print("2. Navigate to http://localhost:3000/test-notifications")
    print("3. Check if the notification bell shows the correct count")
    print("4. Test clicking on notifications to mark them as read")

if __name__ == '__main__':
    main()
