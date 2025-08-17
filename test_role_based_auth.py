#!/usr/bin/env python3
"""
Test script to verify role-based authentication prevents cross-login access
"""

import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:8000"
USER_LOGIN_URL = f"{BASE_URL}/api/auth/login/"
CANDIDAT_LOGIN_URL = f"{BASE_URL}/api/candidat/login/"

def test_role_based_authentication():
    """Test that candidates cannot use regular user login and vice versa"""
    print("🧪 Testing Role-Based Authentication")
    print("=" * 50)
    
    # Test data - you'll need to replace these with actual test accounts
    candidate_email = "candidat@test.com"
    candidate_password = "testpass123"
    
    user_email = "admin@test.com"  # Regular user (admin, rh, tuteur, stagiaire)
    user_password = "testpass123"
    
    print("1. Testing candidate trying to use regular user login...")
    try:
        # Candidate trying to use regular user login (should fail)
        login_data = {
            "email": candidate_email,
            "password": candidate_password
        }
        
        response = requests.post(USER_LOGIN_URL, json=login_data)
        
        if response.status_code == 400:
            error_data = response.json()
            if "compte candidat" in error_data.get('detail', ''):
                print("✅ SUCCESS: Candidate correctly blocked from regular user login")
                print(f"   Error: {error_data.get('detail')}")
            else:
                print(f"❌ UNEXPECTED ERROR: {error_data}")
                return False
        else:
            print(f"❌ FAILED: Candidate was able to use regular user login (status: {response.status_code})")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False
    
    print("\n2. Testing regular user trying to use candidate login...")
    try:
        # Regular user trying to use candidate login (should fail)
        login_data = {
            "email": user_email,
            "password": user_password
        }
        
        response = requests.post(CANDIDAT_LOGIN_URL, json=login_data)
        
        if response.status_code == 403:
            error_data = response.json()
            if "connexion utilisateur" in error_data.get('error', ''):
                print("✅ SUCCESS: Regular user correctly blocked from candidate login")
                print(f"   Error: {error_data.get('error')}")
            else:
                print(f"❌ UNEXPECTED ERROR: {error_data}")
                return False
        else:
            print(f"❌ FAILED: Regular user was able to use candidate login (status: {response.status_code})")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False
    
    print("\n3. Testing candidate using correct candidate login...")
    try:
        # Candidate using correct candidate login (should succeed)
        login_data = {
            "email": candidate_email,
            "password": candidate_password
        }
        
        response = requests.post(CANDIDAT_LOGIN_URL, json=login_data)
        
        if response.status_code == 200:
            print("✅ SUCCESS: Candidate can use candidate login")
            login_data = response.json()
            print(f"   Access token received: {login_data.get('access', '')[:20]}...")
        else:
            print(f"❌ FAILED: Candidate cannot use candidate login (status: {response.status_code})")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False
    
    print("\n4. Testing regular user using correct user login...")
    try:
        # Regular user using correct user login (should succeed)
        login_data = {
            "email": user_email,
            "password": user_password
        }
        
        response = requests.post(USER_LOGIN_URL, json=login_data)
        
        if response.status_code == 200:
            print("✅ SUCCESS: Regular user can use user login")
            login_data = response.json()
            print(f"   Access token received: {login_data.get('access', '')[:20]}...")
            print(f"   User role: {login_data.get('user', {}).get('role', 'unknown')}")
        else:
            print(f"❌ FAILED: Regular user cannot use user login (status: {response.status_code})")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False
    
    print("\n🎉 All role-based authentication tests passed!")
    return True

def test_endpoint_security():
    """Test that endpoints are properly secured"""
    print("\n🔒 Testing Endpoint Security")
    print("=" * 40)
    
    try:
        # Test user login endpoint without data
        response = requests.post(USER_LOGIN_URL)
        print(f"User login without data: {response.status_code}")
        
        # Test candidate login endpoint without data
        response = requests.post(CANDIDAT_LOGIN_URL)
        print(f"Candidate login without data: {response.status_code}")
        
        # Test with invalid credentials
        invalid_data = {"email": "invalid@test.com", "password": "wrongpass"}
        
        response = requests.post(USER_LOGIN_URL, json=invalid_data)
        print(f"User login with invalid credentials: {response.status_code}")
        
        response = requests.post(CANDIDAT_LOGIN_URL, json=invalid_data)
        print(f"Candidate login with invalid credentials: {response.status_code}")
        
    except Exception as e:
        print(f"❌ Security test error: {e}")

if __name__ == "__main__":
    print("Starting role-based authentication tests...")
    
    # Test the complete flow
    success = test_role_based_authentication()
    
    # Test endpoint security
    test_endpoint_security()
    
    if success:
        print("\n✅ All tests passed! Role-based authentication is working correctly.")
        print("\n📋 Summary:")
        print("   - Candidates cannot use regular user login")
        print("   - Regular users cannot use candidate login")
        print("   - Each user type can use their correct login endpoint")
        print("   - Proper error messages are returned")
    else:
        print("\n❌ Some tests failed. Please check the implementation.")
