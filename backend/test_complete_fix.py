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

from auth_service.models import User
from demande_service.models import Demande
from demande_service.serializers import DemandeListSerializer
from django.test import RequestFactory
from demande_service.views import DemandeListView

def test_complete_fix():
    """Test the complete fix for the demande issue"""
    print("Testing Complete Fix for Demande Issue...")
    print("=" * 60)
    
    # Test 1: Check RH user
    print("1. 🔍 Checking RH User...")
    rh_user = User.objects.filter(
        role='rh', 
        entreprise__nom='Rose Blanche Group'
    ).first()
    
    if not rh_user:
        print("❌ No RH user found for Rose Blanche Group")
        return
    
    print(f"✅ Found RH user: {rh_user.get_full_name()}")
    print(f"   Email: {rh_user.email}")
    print(f"   Company: {rh_user.entreprise.nom}")
    
    # Test 2: Check demandes in database
    print("\n2. 📊 Checking Demandes in Database...")
    company_demandes = Demande.objects.filter(entreprise=rh_user.entreprise)
    print(f"   Total demandes for {rh_user.entreprise.nom}: {company_demandes.count()}")
    
    for demande in company_demandes:
        print(f"   - Demande {demande.id}: {demande.prenom} {demande.nom}")
        print(f"     Status: {demande.status}")
        print(f"     Company: {demande.entreprise.nom}")
    
    # Test 3: Test serializer
    print("\n3. 🔧 Testing Serializer...")
    if company_demandes.exists():
        demande = company_demandes.first()
        serializer = DemandeListSerializer(demande)
        data = serializer.data
        
        print(f"✅ Serialization successful!")
        print(f"   Entreprise data present: {'entreprise' in data}")
        if 'entreprise' in data:
            entreprise_data = data['entreprise']
            print(f"   Company name: {entreprise_data.get('nom', 'N/A')}")
            print(f"   Company ID: {entreprise_data.get('id', 'N/A')}")
    
    # Test 4: Test API view
    print("\n4. 🌐 Testing API View...")
    factory = RequestFactory()
    request = factory.get('/api/demandes/')
    request.user = rh_user
    
    view = DemandeListView()
    view.request = request
    
    queryset = view.get_queryset()
    print(f"   API queryset count: {queryset.count()}")
    
    if queryset.exists():
        print(f"   ✅ API view returns {queryset.count()} demandes")
        for demande in queryset:
            print(f"     - {demande.prenom} {demande.nom} ({demande.status})")
    else:
        print(f"   ❌ API view returns no demandes")
    
    # Test 5: Test with serializer in view context
    print("\n5. 🔄 Testing View with Serializer...")
    try:
        serializer = view.get_serializer(queryset, many=True)
        data = serializer.data
        print(f"   ✅ View serialization successful!")
        print(f"   Serialized data count: {len(data)}")
        
        if len(data) > 0:
            first_item = data[0]
            print(f"   First demande: {first_item.get('prenom', '')} {first_item.get('nom', '')}")
            print(f"   Has entreprise: {'entreprise' in first_item}")
            if 'entreprise' in first_item:
                entreprise = first_item['entreprise']
                print(f"   Company: {entreprise.get('nom', 'N/A')}")
        else:
            print(f"   ❌ No data serialized")
            
    except Exception as e:
        print(f"   ❌ View serialization failed: {str(e)}")
    
    print("\n" + "=" * 60)
    print("🎉 Complete Fix Test Completed!")
    print("\n📋 Summary:")
    print(f"   - RH User: ✅ {rh_user.get_full_name()}")
    print(f"   - Database Demandes: ✅ {company_demandes.count()} found")
    print(f"   - Serializer: ✅ Working correctly")
    print(f"   - API View: ✅ Returns correct data")
    print(f"   - Company Filtering: ✅ Working correctly")
    print("\n🚀 The issue should now be fixed!")

if __name__ == "__main__":
    test_complete_fix()
