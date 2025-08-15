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

from shared.models import Entreprise, Stage, OffreStage
from auth_service.models import User
from demande_service.models import Demande, DemandeOffre

def test_company_filtering():
    """Test company-specific filtering functionality"""
    print("Testing Company-Specific Filtering...")
    print("=" * 50)
    
    # Test 1: Check entreprise assignments
    print("1. Entreprise Assignments:")
    entreprises = Entreprise.objects.all()
    for entreprise in entreprises:
        print(f"   {entreprise.nom}:")
        print(f"     - RH Users: {User.objects.filter(role='rh', entreprise=entreprise).count()}")
        print(f"     - Stages: {Stage.objects.filter(company_entreprise=entreprise).count()}")
        print(f"     - Offres: {OffreStage.objects.filter(entreprise=entreprise).count()}")
        print(f"     - Demandes: {Demande.objects.filter(entreprise=entreprise).count()}")
        print(f"     - DemandeOffres: {DemandeOffre.objects.filter(entreprise=entreprise).count()}")
    
    # Test 2: Check RH user company assignments
    print("\n2. RH User Company Assignments:")
    rh_users = User.objects.filter(role='rh')
    for user in rh_users:
        company_info = f"{user.entreprise.nom}" if user.entreprise else "No company"
        print(f"   - {user.get_full_name()} ({user.email}) -> {company_info}")
    
    # Test 3: Check demandes with entreprise
    print("\n3. Demandes with Entreprise:")
    demandes_with_entreprise = Demande.objects.filter(entreprise__isnull=False)
    demandes_without_entreprise = Demande.objects.filter(entreprise__isnull=True)
    print(f"   - With entreprise: {demandes_with_entreprise.count()}")
    print(f"   - Without entreprise: {demandes_without_entreprise.count()}")
    
    # Show some examples
    for demande in demandes_with_entreprise[:5]:  # Show first 5
        print(f"     - Demande {demande.id}: {demande.prenom} {demande.nom} -> {demande.entreprise.nom}")
    
    # Test 4: Check DemandeOffres with entreprise
    print("\n4. DemandeOffres with Entreprise:")
    demande_offres_with_entreprise = DemandeOffre.objects.filter(entreprise__isnull=False)
    demande_offres_without_entreprise = DemandeOffre.objects.filter(entreprise__isnull=True)
    print(f"   - With entreprise: {demande_offres_with_entreprise.count()}")
    print(f"   - Without entreprise: {demande_offres_without_entreprise.count()}")
    
    # Test 5: Simulate RH user filtering
    print("\n5. RH User Filtering Simulation:")
    for entreprise in entreprises:
        rh_user = User.objects.filter(role='rh', entreprise=entreprise).first()
        if rh_user:
            print(f"   RH User from {entreprise.nom}:")
            
            # Simulate what this RH user would see
            company_demandes = Demande.objects.filter(entreprise=entreprise)
            company_offres = OffreStage.objects.filter(entreprise=entreprise)
            company_stages = Stage.objects.filter(company_entreprise=entreprise)
            
            print(f"     - Can see {company_demandes.count()} demandes")
            print(f"     - Can see {company_offres.count()} offres")
            print(f"     - Can see {company_stages.count()} stages")
            
            # Show some examples
            if company_demandes.exists():
                sample_demande = company_demandes.first()
                print(f"     - Sample demande: {sample_demande.prenom} {sample_demande.nom}")
            
            if company_offres.exists():
                sample_offre = company_offres.first()
                print(f"     - Sample offre: {sample_offre.title}")
    
    print("\n" + "=" * 50)
    print("Company Filtering Test Completed!")

if __name__ == "__main__":
    test_company_filtering()
