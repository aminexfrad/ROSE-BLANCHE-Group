"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

import os
import sys
import django
import requests
import json

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from auth_service.models import User
from django.contrib.auth import authenticate

def test_api_direct():
    """Test the API endpoint with a direct HTTP request"""
    print("Testing API Direct HTTP Request...")
    print("=" * 50)
    
    # Find the Rose Blanche Group RH user
    rh_user = User.objects.filter(
        role='rh', 
        entreprise__nom='Rose Blanche Group'
    ).first()
    
    if not rh_user:
        print("❌ No RH user found")
        return
    
    print(f"✅ Found RH user: {rh_user.get_full_name()}")
    print(f"   Email: {rh_user.email}")
    
    # Test authentication
    print(f"\n🔐 Testing authentication...")
    
    # Try to authenticate the user
    authenticated_user = authenticate(email=rh_user.email, password='rh123456')
    if authenticated_user:
        print("✅ Authentication successful")
    else:
        print("❌ Authentication failed")
        return
    
    # Test the API endpoint
    print(f"\n🌐 Testing API endpoint...")
    
    # Base URL (adjust if needed)
    base_url = "http://localhost:8000"
    
    # First, get a token
    try:
        login_response = requests.post(f"{base_url}/api/auth/login/", {
            'email': rh_user.email,
            'password': 'rh123456'
        })
        
        if login_response.status_code == 200:
            token_data = login_response.json()
            access_token = token_data.get('access')
            print("✅ Login successful, got access token")
            
            # Now test the demandes endpoint
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            demandes_response = requests.get(f"{base_url}/api/demandes/", headers=headers)
            
            print(f"📊 Demandes API Response:")
            print(f"   Status Code: {demandes_response.status_code}")
            print(f"   Response Headers: {dict(demandes_response.headers)}")
            
            if demandes_response.status_code == 200:
                data = demandes_response.json()
                print(f"✅ API call successful!")
                print(f"   Response data: {json.dumps(data, indent=2)}")
                
                if isinstance(data, list):
                    print(f"   Number of demandes: {len(data)}")
                    for demande in data:
                        print(f"     - {demande.get('prenom', '')} {demande.get('nom', '')}")
                elif isinstance(data, dict) and 'results' in data:
                    print(f"   Number of demandes: {len(data['results'])}")
                    for demande in data['results']:
                        print(f"     - {demande.get('prenom', '')} {demande.get('nom', '')}")
                else:
                    print(f"   Unexpected response format: {type(data)}")
            else:
                print(f"❌ API call failed with status {demandes_response.status_code}")
                print(f"   Response: {demandes_response.text}")
        else:
            print(f"❌ Login failed with status {login_response.status_code}")
            print(f"   Response: {login_response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - make sure the Django server is running on localhost:8000")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    print("\n" + "=" * 50)
    print("API Direct Test Completed!")

if __name__ == "__main__":
    test_api_direct()
