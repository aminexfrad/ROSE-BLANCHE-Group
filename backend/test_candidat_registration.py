#!/usr/bin/env python
"""
Test script for candidat registration endpoint
"""
import requests
import json

def test_candidat_registration():
    """Test the candidat registration endpoint"""
    url = "http://localhost:8000/api/candidat/register/"
    
    # Test data
    data = {
        "email": "test@example.com",
        "password": "testpass123",
        "nom": "Test",
        "prenom": "User",
        "institut": "Test Institute",
        "specialite": "Computer Science",
        "niveau": "Bac+3"
    }
    
    try:
        print(f"Testing registration endpoint: {url}")
        print(f"Data: {json.dumps(data, indent=2)}")
        
        response = requests.post(url, json=data)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 201:
            print("✅ Registration successful!")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        else:
            print("❌ Registration failed!")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - server might not be running")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_candidat_registration()
