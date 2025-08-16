#!/usr/bin/env python
"""
Test script to check Candidat model fields
"""
import os
import sys
import django

# Add the gateway directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'gateway'))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stagebloom.settings')
django.setup()

from shared.models import Candidat
from django.db import connection

def check_candidat_model():
    """Check the Candidat model fields"""
    print("=== Candidat Model Fields ===")
    
    # Get model fields
    fields = Candidat._meta.get_fields()
    for field in fields:
        print(f"Field: {field.name}, Type: {type(field).__name__}")
        if hasattr(field, 'default'):
            print(f"  Default: {field.default}")
        if hasattr(field, 'null'):
            print(f"  Null: {field.null}")
        if hasattr(field, 'blank'):
            print(f"  Blank: {field.blank}")
        print()
    
    # Check database table structure
    print("=== Database Table Structure ===")
    with connection.cursor() as cursor:
        cursor.execute("DESCRIBE candidat")
        columns = cursor.fetchall()
        for column in columns:
            print(f"Column: {column}")
    
    # Try to create a Candidat instance
    print("\n=== Testing Candidat Creation ===")
    try:
        from auth_service.models import User
        
        # Create a test user first
        user = User.objects.create_user(
            email='test@test.com',
            password='testpass123',
            nom='Test',
            prenom='User',
            role='candidat'
        )
        
        # Try to create a candidat
        candidat = Candidat.objects.create(
            user=user,
            institut='Test Institute',
            specialite='Computer Science',
            niveau='Bac+3'
        )
        print(f"✅ Candidat created successfully: {candidat}")
        
        # Clean up
        candidat.delete()
        user.delete()
        
    except Exception as e:
        print(f"❌ Error creating Candidat: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_candidat_model()
