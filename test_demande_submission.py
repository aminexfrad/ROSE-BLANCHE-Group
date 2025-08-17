#!/usr/bin/env python3
"""
Test script to verify demande submission logic
"""

import requests
import json

# Test data for PFE stage with pfe_reference
test_data = {
    "nom": "Test",
    "prenom": "User",
    "email": "test@example.com",
    "telephone": "0123456789",
    "institut": "Test Institute",
    "specialite": "Test Speciality",
    "type_stage": "Stage PFE",
    "niveau": "Master",
    "pfe_reference": "TEST001",
    "date_debut": "2025-01-01",
    "date_fin": "2025-06-30",
    "stage_binome": False
}

def test_demande_submission():
    """Test the demande submission endpoint"""
    url = "http://localhost:8000/api/demandes/"
    
    try:
        response = requests.post(url, json=test_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            print("✅ Success! Demande created with pfe_reference only")
        else:
            print("❌ Failed to create demande")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    print("Testing demande submission with pfe_reference only...")
    test_demande_submission()
