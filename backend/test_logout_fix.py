#!/usr/bin/env python3
"""
Test script to verify candidate logout functionality
"""

import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:8000"
CANDIDAT_LOGIN_URL = f"{BASE_URL}/api/candidat/login/"
LOGOUT_URL = f"{BASE_URL}/api/auth/logout/"

def test_candidate_logout():
    """Test the complete candidate logout flow"""
    print("🧪 Testing Candidate Logout Functionality")
    print("=" * 50)
    
    # Test data - use a known candidate account
    test_email = "candidat@test.com"
    test_password = "testpass123"
    
    try:
        # Step 1: Login as candidate
        print("1. Logging in as candidate...")
        login_data = {
            "email": test_email,
            "password": test_password
        }
        
        login_response = requests.post(CANDIDAT_LOGIN_URL, json=login_data)
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            access_token = login_result.get('access')
            print(f"✅ Login successful - Token received: {access_token[:20]}...")
        else:
            print(f"❌ Login failed: {login_response.status_code}")
            print(f"Response: {login_response.text}")
            return False
        
        # Step 2: Test logout with proper authentication
        print("\n2. Testing logout with authentication...")
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        logout_response = requests.post(LOGOUT_URL, headers=headers)
        
        if logout_response.status_code == 200:
            print("✅ Logout successful with authentication")
            print(f"Response: {logout_response.json()}")
        else:
            print(f"❌ Logout failed: {logout_response.status_code}")
            print(f"Response: {logout_response.text}")
            return False
        
        # Step 3: Test logout without authentication (should fail)
        print("\n3. Testing logout without authentication...")
        logout_response_no_auth = requests.post(LOGOUT_URL)
        
        if logout_response_no_auth.status_code == 401:
            print("✅ Logout correctly requires authentication")
        else:
            print(f"⚠️  Unexpected response for unauthenticated logout: {logout_response_no_auth.status_code}")
        
        print("\n🎉 All logout tests completed successfully!")
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the server. Make sure the backend is running on localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        return False

def test_logout_endpoint_directly():
    """Test the logout endpoint directly"""
    print("\n🔧 Testing Logout Endpoint Directly")
    print("=" * 40)
    
    try:
        # Test without any data
        response = requests.post(LOGOUT_URL)
        print(f"Logout without auth: {response.status_code} - {response.text}")
        
        # Test with empty JSON body
        response = requests.post(LOGOUT_URL, json={})
        print(f"Logout with empty JSON: {response.status_code} - {response.text}")
        
        # Test with invalid token
        headers = {"Authorization": "Bearer invalid_token"}
        response = requests.post(LOGOUT_URL, headers=headers)
        print(f"Logout with invalid token: {response.status_code} - {response.text}")
        
    except Exception as e:
        print(f"❌ Direct endpoint test failed: {e}")

if __name__ == "__main__":
    print("Starting logout functionality tests...")
    
    # Test the complete flow
    success = test_candidate_logout()
    
    # Test the endpoint directly
    test_logout_endpoint_directly()
    
    if success:
        print("\n✅ All tests passed! The logout functionality should work correctly.")
    else:
        print("\n❌ Some tests failed. Please check the backend logs for more details.")
