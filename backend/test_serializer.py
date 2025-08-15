"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from demande_service.models import Demande
from demande_service.serializers import DemandeListSerializer

def test_serializer():
    """Test the DemandeListSerializer directly"""
    print("Testing DemandeListSerializer...")
    print("=" * 50)
    
    # Get a demande with entreprise
    demande = Demande.objects.filter(entreprise__isnull=False).first()
    
    if not demande:
        print("❌ No demande with entreprise found")
        return
    
    print(f"✅ Found demande: {demande.prenom} {demande.nom}")
    print(f"   Company: {demande.entreprise.nom if demande.entreprise else 'None'}")
    
    # Test the serializer
    print(f"\n🔍 Testing serializer...")
    
    try:
        serializer = DemandeListSerializer(demande)
        data = serializer.data
        
        print(f"✅ Serialization successful!")
        print(f"   Serialized data keys: {list(data.keys())}")
        
        # Check if entreprise is in the data
        if 'entreprise' in data:
            entreprise_data = data['entreprise']
            print(f"   Entreprise data: {entreprise_data}")
        else:
            print(f"   ❌ Entreprise field missing from serialized data")
        
        # Print all the data
        print(f"\n📊 Full serialized data:")
        for key, value in data.items():
            print(f"   {key}: {value}")
            
    except Exception as e:
        print(f"❌ Serialization failed: {str(e)}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 50)
    print("Serializer Test Completed!")

if __name__ == "__main__":
    test_serializer()
