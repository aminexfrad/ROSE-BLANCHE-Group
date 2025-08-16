#!/usr/bin/env python
"""
Test script to verify candidat max demandes is now 4
"""
import os
import sys
import django

# Add the parent directory to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from shared.models import Candidat
from auth_service.models import User

def test_candidat_max_demandes():
    """Test that candidat max demandes is now 4"""
    print("🧪 Testing Candidat Max Demandes Update")
    print("=" * 50)
    
    # Get all candidats
    candidats = Candidat.objects.all()
    print(f"Found {candidats.count()} candidats in database")
    
    for candidat in candidats:
        print(f"\n📋 Candidat: {candidat.user.get_full_name()}")
        print(f"   Email: {candidat.user.email}")
        print(f"   nombre_demandes_max: {candidat.nombre_demandes_max}")
        print(f"   nombre_demandes_soumises: {candidat.nombre_demandes_soumises}")
        print(f"   demandes_restantes: {candidat.demandes_restantes}")
        print(f"   peut_soumettre: {candidat.peut_soumettre}")
        
        # Verify the change
        if candidat.nombre_demandes_max == 4:
            print("   ✅ nombre_demandes_max is correctly set to 4")
        else:
            print(f"   ❌ nombre_demandes_max is still {candidat.nombre_demandes_max}, should be 4")
    
    # Test creating a new candidat to see default value
    print(f"\n🧪 Testing default value for new candidat...")
    print(f"   Default nombre_demandes_max should be: 4")
    
    # Check the model field default
    field = Candidat._meta.get_field('nombre_demandes_max')
    print(f"   Model field default: {field.default}")
    
    if field.default == 4:
        print("   ✅ Model field default is correctly set to 4")
    else:
        print(f"   ❌ Model field default is {field.default}, should be 4")
    
    print("\n" + "=" * 50)
    print("🎯 Candidat Max Demandes Test Completed!")

if __name__ == "__main__":
    test_candidat_max_demandes()
