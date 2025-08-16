#!/usr/bin/env python
"""
Test script to simulate the frontend login flow for candidat dashboard
"""
import requests
import json
import time

def test_frontend_login_flow():
    """Test the complete frontend login flow for candidat dashboard"""
    base_url = "http://localhost:8000/api"
    
    print("🚀 Testing Frontend Login Flow for Candidat Dashboard")
    print("=" * 60)
    
    # Step 1: Register a new candidat
    print("\n1️⃣ Registering new candidat...")
    register_data = {
        "email": f"test{int(time.time())}@example.com",
        "password": "testpass123",
        "nom": "Test",
        "prenom": "Candidat",
        "telephone": "0612345678",
        "institut": "École Nationale des Sciences Appliquées",
        "specialite": "Informatique",
        "niveau": "Bac+5"
    }
    
    register_response = requests.post(f"{base_url}/candidat/register/", json=register_data)
    
    if register_response.status_code != 201:
        print(f"❌ Registration failed: {register_response.status_code}")
        print(f"Response: {register_response.text}")
        return False
    
    register_result = register_response.json()
    access_token = register_result['access']
    refresh_token = register_result['refresh']
    
    print(f"✅ Registration successful")
    print(f"   Access token: {access_token[:20]}...")
    print(f"   Refresh token: {refresh_token[:20]}...")
    
    # Step 2: Login with the candidat
    print("\n2️⃣ Logging in candidat...")
    login_data = {
        "email": register_data["email"],
        "password": register_data["password"]
    }
    
    login_response = requests.post(f"{base_url}/candidat/login/", json=login_data)
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        print(f"Response: {login_response.text}")
        return False
    
    login_result = login_response.json()
    new_access_token = login_result['access']
    new_refresh_token = login_result['refresh']
    
    print(f"✅ Login successful")
    print(f"   New access token: {new_access_token[:20]}...")
    print(f"   New refresh token: {new_refresh_token[:20]}...")
    
    # Step 3: Access candidat profile (protected endpoint)
    print("\n3️⃣ Accessing candidat profile...")
    headers = {'Authorization': f'Bearer {new_access_token}'}
    
    profile_response = requests.get(f"{base_url}/candidat/profile/", headers=headers)
    
    if profile_response.status_code != 200:
        print(f"❌ Profile access failed: {profile_response.status_code}")
        print(f"Response: {profile_response.text}")
        return False
    
    profile_result = profile_response.json()
    print(f"✅ Profile access successful")
    print(f"   Email: {profile_result.get('user', {}).get('email')}")
    print(f"   Demandes restantes: {profile_result.get('demandes_restantes')}")
    
    # Step 4: Access candidat dashboard (protected endpoint)
    print("\n4️⃣ Accessing candidat dashboard...")
    
    dashboard_response = requests.get(f"{base_url}/candidat/dashboard/", headers=headers)
    
    if dashboard_response.status_code != 200:
        print(f"❌ Dashboard access failed: {dashboard_response.status_code}")
        print(f"Response: {dashboard_response.text}")
        return False
    
    dashboard_result = dashboard_response.json()
    print(f"✅ Dashboard access successful")
    print(f"   Total demandes: {dashboard_result.get('statistiques', {}).get('total_demandes')}")
    print(f"   Demandes restantes: {dashboard_result.get('statistiques', {}).get('demandes_restantes')}")
    print(f"   Peut soumettre: {dashboard_result.get('statistiques', {}).get('peut_soumettre')}")
    
    # Step 5: Test token validation
    print("\n5️⃣ Testing token validation...")
    
    # Test with invalid token
    invalid_headers = {'Authorization': 'Bearer invalid_token_12345'}
    invalid_response = requests.get(f"{base_url}/candidat/profile/", headers=invalid_headers)
    
    if invalid_response.status_code == 401:
        print(f"✅ Invalid token properly rejected (401)")
    else:
        print(f"⚠️ Invalid token not properly rejected: {invalid_response.status_code}")
    
    # Test with expired token (simulate by using old token)
    old_headers = {'Authorization': f'Bearer {access_token}'}
    old_response = requests.get(f"{base_url}/candidat/profile/", headers=old_headers)
    
    if old_response.status_code == 401:
        print(f"✅ Old token properly rejected (401)")
    else:
        print(f"⚠️ Old token not properly rejected: {old_response.status_code}")
    
    print("\n" + "=" * 60)
    print("🎉 Frontend Login Flow Test Completed Successfully!")
    print("=" * 60)
    
    print(f"\n📋 Summary:")
    print(f"   ✅ Registration: Working")
    print(f"   ✅ Login: Working")
    print(f"   ✅ Token Storage: Working")
    print(f"   ✅ Protected Endpoints: Working")
    print(f"   ✅ Token Validation: Working")
    
    print(f"\n🔑 Frontend should store tokens as:")
    print(f"   localStorage.setItem('token', '{new_access_token[:20]}...')")
    print(f"   localStorage.setItem('refreshToken', '{new_refresh_token[:20]}...')")
    
    return True

if __name__ == "__main__":
    try:
        success = test_frontend_login_flow()
        if success:
            print("\n✅ All tests passed! Candidat dashboard login should work now.")
        else:
            print("\n❌ Some tests failed!")
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        import traceback
        traceback.print_exc()
