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
from shared.models import Entreprise

def test_rh_user_access():
    """Test RH user access to their company's demandes"""
    print("Testing RH User Access to Demandes...")
    print("=" * 50)
    
    # Find the Rose Blanche Group RH user
    rose_blanche_rh = User.objects.filter(
        role='rh', 
        entreprise__nom='Rose Blanche Group'
    ).first()
    
    if not rose_blanche_rh:
        print("❌ No RH user found for Rose Blanche Group")
        return
    
    print(f"✅ Found RH user: {rose_blanche_rh.get_full_name()}")
    print(f"   Email: {rose_blanche_rh.email}")
    print(f"   Company: {rose_blanche_rh.entreprise.nom}")
    
    # Test what demandes this RH user should see
    company_demandes = Demande.objects.filter(entreprise=rose_blanche_rh.entreprise)
    print(f"\n📊 Demandes for {rose_blanche_rh.entreprise.nom}:")
    print(f"   Total demandes: {company_demandes.count()}")
    
    for demande in company_demandes:
        print(f"   - Demande {demande.id}: {demande.prenom} {demande.nom}")
        print(f"     Status: {demande.status}")
        print(f"     Type: {demande.type_stage}")
        print(f"     Institute: {demande.institut}")
        print(f"     Created: {demande.created_at}")
        print(f"     Entreprise: {demande.entreprise.nom if demande.entreprise else 'None'}")
    
    # Test the exact query that the API would use
    print(f"\n🔍 Testing API Query Logic:")
    
    # Simulate the API logic
    if rose_blanche_rh.role == 'rh' and rose_blanche_rh.entreprise:
        api_queryset = Demande.objects.filter(entreprise=rose_blanche_rh.entreprise)
        print(f"   API would return: {api_queryset.count()} demandes")
        
        for demande in api_queryset:
            print(f"     - {demande.prenom} {demande.nom} ({demande.status})")
    else:
        print("   ❌ RH user has no company assignment")
    
    # Check if there are any demandes without entreprise that should be assigned
    demandes_without_entreprise = Demande.objects.filter(entreprise__isnull=True)
    print(f"\n⚠️  Demandes without entreprise: {demandes_without_entreprise.count()}")
    
    if demandes_without_entreprise.exists():
        print("   These demandes should be assigned to a company:")
        for demande in demandes_without_entreprise:
            print(f"     - Demande {demande.id}: {demande.prenom} {demande.nom}")
            # Check if they have offers
            if demande.offres.exists():
                first_offre = demande.offres.first()
                print(f"       Has offer: {first_offre.title}")
                if first_offre.entreprise:
                    print(f"       Offer company: {first_offre.entreprise.nom}")
                else:
                    print(f"       Offer has no company!")
            else:
                print(f"       No offers!")
    
    print("\n" + "=" * 50)
    print("RH User Access Test Completed!")

if __name__ == "__main__":
    test_rh_user_access()
