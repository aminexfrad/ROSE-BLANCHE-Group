#!/usr/bin/env python3
"""
Test script to verify candidate authentication flow fix
"""

import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:8000/api"
FRONTEND_URL = "http://localhost:3000"

def test_candidate_login():
    """Test candidate login flow"""
    print("🧪 Testing candidate authentication flow...")
    
    # Test data
    test_email = "candidate@test.com"
    test_password = "testpass123"
    
    try:
        # 1. Test candidate login
        print("1. Testing candidate login...")
        login_response = requests.post(
            f"{BASE_URL}/candidat/login/",
            json={
                "email": test_email,
                "password": test_password
            },
            headers={"Content-Type": "application/json"}
        )
        
        if login_response.status_code == 200:
            login_data = login_response.json()
            print("✅ Candidate login successful")
            print(f"   - Access token: {login_data.get('access', 'N/A')[:20]}...")
            print(f"   - Candidat ID: {login_data.get('candidat', {}).get('id', 'N/A')}")
            
            # 2. Test candidate profile with token
            print("\n2. Testing candidate profile retrieval...")
            headers = {
                "Authorization": f"Bearer {login_data['access']}",
                "Content-Type": "application/json"
            }
            
            profile_response = requests.get(
                f"{BASE_URL}/candidat/profile/",
                headers=headers
            )
            
            if profile_response.status_code == 200:
                profile_data = profile_response.json()
                print("✅ Candidate profile retrieval successful")
                print(f"   - Email: {profile_data.get('user', {}).get('email', 'N/A')}")
                print(f"   - Nom: {profile_data.get('user', {}).get('nom', 'N/A')}")
            else:
                print(f"❌ Candidate profile retrieval failed: {profile_response.status_code}")
                print(f"   Response: {profile_response.text}")
            
            # 3. Test candidate dashboard with token
            print("\n3. Testing candidate dashboard retrieval...")
            dashboard_response = requests.get(
                f"{BASE_URL}/candidat/dashboard/",
                headers=headers
            )
            
            if dashboard_response.status_code == 200:
                dashboard_data = dashboard_response.json()
                print("✅ Candidate dashboard retrieval successful")
                print(f"   - Demandes count: {len(dashboard_data.get('demandes', []))}")
                print(f"   - Total demandes: {dashboard_data.get('statistiques', {}).get('total_demandes', 0)}")
            else:
                print(f"❌ Candidate dashboard retrieval failed: {dashboard_response.status_code}")
                print(f"   Response: {dashboard_response.text}")
                
        else:
            print(f"❌ Candidate login failed: {login_response.status_code}")
            print(f"   Response: {login_response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend server")
        print("   Make sure the backend is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")

def test_frontend_connection():
    """Test frontend connection"""
    print("\n🌐 Testing frontend connection...")
    
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is accessible")
        else:
            print(f"⚠️  Frontend returned status code: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to frontend")
        print("   Make sure the frontend is running on http://localhost:3000")
    except Exception as e:
        print(f"❌ Frontend test failed: {str(e)}")

def main():
    """Main test function"""
    print("=" * 60)
    print("🔧 CANDIDATE AUTHENTICATION FLOW TEST")
    print("=" * 60)
    
    # Test backend connection first
    test_candidate_login()
    
    # Test frontend connection
    test_frontend_connection()
    
    print("\n" + "=" * 60)
    print("📋 TEST SUMMARY")
    print("=" * 60)
    print("If all tests passed, the authentication flow should work correctly.")
    print("The login loop issue should be resolved.")
    print("\nTo test manually:")
    print("1. Go to http://localhost:3000/login")
    print("2. Select 'Candidat' mode")
    print("3. Login with candidate credentials")
    print("4. You should be redirected to /candidate/dashboard")
    print("5. No infinite redirect loop should occur")

if __name__ == "__main__":
    main()
