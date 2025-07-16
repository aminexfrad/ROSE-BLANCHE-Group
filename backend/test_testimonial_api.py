#!/usr/bin/env python
"""
Test script for testimonial API
"""

import requests
import json

# Test the testimonial creation endpoint
def test_testimonial_api():
    base_url = "http://localhost:8000/api"
    
    # First, get a token by logging in
    login_data = {
        "email": "stagiaire@test.com",
        "password": "test123"
    }
    
    try:
        # Login to get token
        login_response = requests.post(f"{base_url}/auth/login/", json=login_data)
        print(f"Login status: {login_response.status_code}")
        print(f"Login response: {login_response.text}")
        
        if login_response.status_code != 200:
            print("Login failed!")
            return
        
        token_data = login_response.json()
        token = token_data['access']
        
        # Test testimonial creation
        testimonial_data = {
            "title": "Test Témoignage",
            "content": "Ceci est un test de témoignage",
            "testimonial_type": "text",
            "stage": 14  # The stage ID we created
        }
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        testimonial_response = requests.post(
            f"{base_url}/testimonials/create/", 
            json=testimonial_data,
            headers=headers
        )
        
        print(f"\nTestimonial creation status: {testimonial_response.status_code}")
        print(f"Testimonial response: {testimonial_response.text}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_testimonial_api() 