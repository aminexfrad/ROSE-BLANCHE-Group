#!/usr/bin/env python3
"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

"""
Test script to check API endpoints and identify issues.
"""

import os
import sys
import django
import requests
import json
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).resolve().parent
sys.path.insert(0, str(project_root))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from django.contrib.auth import get_user_model
from shared.models import Stage

User = get_user_model()

def test_api_endpoints():
    """Test various API endpoints to identify issues."""
    
    base_url = "http://localhost:8000/api"
    
    print("🔍 Testing API endpoints...")
    print("=" * 50)
    
    # Test 1: Check if server is running
    try:
        response = requests.get(f"{base_url}/docs/", timeout=5)
        print(f"✅ Server is running (Status: {response.status_code})")
    except requests.exceptions.ConnectionError:
        print("❌ Server is not running. Please start the Django server.")
        return False
    except Exception as e:
        print(f"❌ Error connecting to server: {e}")
        return False
    
    # Test 2: Check auth endpoints
    auth_endpoints = [
        "/auth/login/",
        "/auth/profile/",
        "/auth/check-auth/",
    ]
    
    print("\n🔐 Testing authentication endpoints:")
    for endpoint in auth_endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=5)
            print(f"  {endpoint}: {response.status_code}")
        except Exception as e:
            print(f"  {endpoint}: Error - {e}")
    
    # Test 3: Check stagiaire endpoints
    stagiaire_endpoints = [
        "/stagiaire/internship/",
        "/stagiaire/internship/steps/",
        "/stagiaire/internship/documents/",
    ]
    
    print("\n👨‍🎓 Testing stagiaire endpoints:")
    for endpoint in stagiaire_endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=5)
            print(f"  {endpoint}: {response.status_code}")
        except Exception as e:
            print(f"  {endpoint}: Error - {e}")
    
    # Test 4: Check database for users and stages
    print("\n🗄️  Checking database:")
    try:
        user_count = User.objects.count()
        print(f"  Users in database: {user_count}")
        
        stage_count = Stage.objects.count()
        print(f"  Stages in database: {stage_count}")
        
        # Check for stagiaire users
        stagiaire_users = User.objects.filter(role='stagiaire')
        print(f"  Stagiaire users: {stagiaire_users.count()}")
        
        # Check for active stages
        active_stages = Stage.objects.filter(status='active')
        print(f"  Active stages: {active_stages.count()}")
        
        if stagiaire_users.exists() and not active_stages.exists():
            print("  ⚠️  Warning: Stagiaire users exist but no active stages found!")
            
    except Exception as e:
        print(f"  ❌ Error checking database: {e}")
    
    print("\n" + "=" * 50)
    print("✅ API endpoint test completed!")
    
    return True

def create_test_data():
    """Create test data if needed."""
    print("\n🔧 Creating test data...")
    
    try:
        # Create a test stagiaire user
        user, created = User.objects.get_or_create(
            email='test@example.com',
            defaults={
                'nom': 'Test',
                'prenom': 'User',
                'role': 'stagiaire',
                'is_active': True,
            }
        )
        
        if created:
            user.set_password('testpass123')
            user.save()
            print("  ✅ Created test stagiaire user: test@example.com / testpass123")
        else:
            print("  ℹ️  Test user already exists")
        
        # Create a test stage
        stage, created = Stage.objects.get_or_create(
            stagiaire=user,
            defaults={
                'title': 'Test Stage',
                'company': 'Test Company',
                'location': 'Test Location',
                'status': 'active',
                'duration_days': 30,
                'days_remaining': 30,
            }
        )
        
        if created:
            print("  ✅ Created test active stage")
        else:
            print("  ℹ️  Test stage already exists")
            
    except Exception as e:
        print(f"  ❌ Error creating test data: {e}")

if __name__ == "__main__":
    print("🚀 StageBloom API Test Script")
    print("=" * 50)
    
    # Test endpoints
    if test_api_endpoints():
        # Ask if user wants to create test data
        response = input("\n🤔 Would you like to create test data? (y/n): ")
        if response.lower() in ['y', 'yes']:
            create_test_data()
    
    print("\n🎉 Test script completed!") 