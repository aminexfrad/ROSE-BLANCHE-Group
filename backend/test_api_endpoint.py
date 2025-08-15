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

from django.test import RequestFactory
from django.contrib.auth import get_user
from demande_service.views import DemandeListView
from auth_service.models import User
from demande_service.models import Demande

def test_api_endpoint():
    """Test the API endpoint directly"""
    print("Testing API Endpoint...")
    print("=" * 50)
    
    # Create a request factory
    factory = RequestFactory()
    
    # Find the Rose Blanche Group RH user
    rh_user = User.objects.filter(
        role='rh', 
        entreprise__nom='Rose Blanche Group'
    ).first()
    
    if not rh_user:
        print("❌ No RH user found")
        return
    
    print(f"✅ Testing with RH user: {rh_user.get_full_name()}")
    print(f"   Company: {rh_user.entreprise.nom}")
    
    # Create a mock request
    request = factory.get('/api/demandes/')
    request.user = rh_user
    
    # Test the view
    view = DemandeListView()
    view.request = request
    
    # Get the queryset
    queryset = view.get_queryset()
    print(f"\n📊 API Queryset Results:")
    print(f"   Total demandes returned: {queryset.count()}")
    
    for demande in queryset:
        print(f"   - Demande {demande.id}: {demande.prenom} {demande.nom}")
        print(f"     Status: {demande.status}")
        print(f"     Company: {demande.entreprise.nom if demande.entreprise else 'None'}")
    
    # Test with serializer
    print(f"\n🔍 Testing with Serializer:")
    serializer = view.get_serializer(queryset, many=True)
    data = serializer.data
    print(f"   Serialized data count: {len(data)}")
    
    for item in data:
        print(f"   - {item.get('prenom', '')} {item.get('nom', '')}")
        print(f"     Status: {item.get('status', '')}")
        print(f"     Company: {item.get('entreprise', {}).get('nom', 'None') if item.get('entreprise') else 'None'}")
    
    print("\n" + "=" * 50)
    print("API Endpoint Test Completed!")

if __name__ == "__main__":
    test_api_endpoint()
