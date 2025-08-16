#!/usr/bin/env python
"""
Simple test to check if candidat endpoints are accessible
"""
import requests

def test_endpoint_access():
    """Test if candidat endpoints are accessible"""
    base_url = "http://localhost:8000/api"
    
    print("🧪 Testing endpoint accessibility...")
    print("=" * 50)
    
    # Test 1: Public candidat offers endpoint
    print("\n1️⃣ Testing public candidat offers endpoint...")
    try:
        response = requests.get(f"{base_url}/candidat/offres/")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:100]}...")
        
        if response.status_code == 200:
            print("   ✅ Endpoint accessible")
        else:
            print("   ❌ Endpoint not accessible")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 2: Candidat registration endpoint
    print("\n2️⃣ Testing candidat registration endpoint...")
    try:
        response = requests.post(f"{base_url}/candidat/register/", json={})
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:100]}...")
        
        if response.status_code in [400, 201]:  # 400 is expected for empty data, 201 for success
            print("   ✅ Endpoint accessible")
        else:
            print("   ❌ Endpoint not accessible")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 3: Candidat login endpoint
    print("\n3️⃣ Testing candidat login endpoint...")
    try:
        response = requests.post(f"{base_url}/candidat/login/", json={})
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:100]}...")
        
        if response.status_code in [400, 200]:  # 400 is expected for empty data, 200 for success
            print("   ✅ Endpoint accessible")
        else:
            print("   ❌ Endpoint not accessible")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 Endpoint accessibility test completed!")

if __name__ == "__main__":
    test_endpoint_access()
