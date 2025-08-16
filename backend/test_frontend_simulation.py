#!/usr/bin/env python
"""
Test script that simulates the exact frontend login flow
"""
import requests
import json
import time

def simulate_frontend_login():
    """Simulate the exact frontend login flow"""
    base_url = "http://localhost:8000/api"
    
    print("🖥️ Simulating Frontend Login Flow")
    print("=" * 60)
    
    # Step 1: Simulate frontend loading and checking localStorage
    print("\n1️⃣ Frontend loads and checks localStorage...")
    print("   localStorage.getItem('token') -> null (not logged in)")
    print("   localStorage.getItem('refreshToken') -> null (not logged in)")
    
    # Step 2: Simulate user registration first
    print("\n2️⃣ User registers new account...")
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
    
    print(f"   Registration data: {json.dumps(register_data, indent=2)}")
    
    try:
        register_response = requests.post(
            f"{base_url}/candidat/register/", 
            json=register_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if register_response.status_code == 201:
            register_result = register_response.json()
            print(f"   ✅ Registration successful!")
            print(f"   User ID: {register_result['candidat']['user']['id']}")
            print(f"   Candidat ID: {register_result['candidat']['id']}")
            
            # Use the registered email for login
            login_email = register_data['email']
            login_password = register_data['password']
            
        else:
            print(f"   ❌ Registration failed: {register_response.status_code}")
            print(f"   Error: {register_response.text}")
            return
            
    except Exception as e:
        print(f"   ❌ Registration exception: {e}")
        return
    
    # Step 3: Simulate user filling login form
    print("\n3️⃣ User fills login form...")
    login_data = {
        "email": login_email,
        "password": login_password
    }
    print(f"   Email: {login_data['email']}")
    print(f"   Password: {login_data['password']}")
    
    # Step 4: Simulate frontend calling loginCandidat API
    print("\n4️⃣ Frontend calls apiClient.loginCandidat()...")
    print(f"   URL: {base_url}/candidat/login/")
    print(f"   Method: POST")
    print(f"   Headers: Content-Type: application/json")
    print(f"   Body: {json.dumps(login_data)}")
    
    try:
        response = requests.post(
            f"{base_url}/candidat/login/", 
            json=login_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"\n   Response Status: {response.status_code}")
        print(f"   Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Login successful!")
            print(f"   Response: {json.dumps(result, indent=2)}")
            
            # Step 5: Simulate frontend storing tokens
            print("\n5️⃣ Frontend stores tokens in localStorage...")
            access_token = result['access']
            refresh_token = result['refresh']
            
            print(f"   localStorage.setItem('token', '{access_token[:20]}...')")
            print(f"   localStorage.setItem('refreshToken', '{refresh_token[:20]}...')")
            
            # Step 6: Simulate frontend redirecting to dashboard
            print("\n6️⃣ Frontend redirects to /candidate/dashboard...")
            
            # Step 7: Simulate dashboard loading and calling getCandidatDashboard
            print("\n7️⃣ Dashboard loads and calls apiClient.getCandidatDashboard()...")
            print(f"   URL: {base_url}/candidat/dashboard/")
            print(f"   Method: GET")
            print(f"   Headers: Authorization: Bearer {access_token[:20]}...")
            
            dashboard_response = requests.get(
                f"{base_url}/candidat/dashboard/",
                headers={'Authorization': f'Bearer {access_token}'}
            )
            
            print(f"\n   Dashboard Response Status: {dashboard_response.status_code}")
            
            if dashboard_response.status_code == 200:
                dashboard_result = dashboard_response.json()
                print(f"   ✅ Dashboard loaded successfully!")
                print(f"   Dashboard Data: {json.dumps(dashboard_result, indent=2)}")
                
                # Step 8: Simulate frontend displaying dashboard
                print("\n8️⃣ Frontend displays dashboard...")
                print(f"   ✅ User is now logged in and viewing candidat dashboard!")
                
            else:
                print(f"   ❌ Dashboard failed to load: {dashboard_response.text}")
                
        else:
            print(f"   ❌ Login failed!")
            print(f"   Error Response: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Exception during login: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 60)
    print("🎯 Frontend Login Simulation Completed!")

if __name__ == "__main__":
    simulate_frontend_login()
