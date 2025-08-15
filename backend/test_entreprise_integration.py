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

def test_entreprise_integration():
    """Test the entreprise integration"""
    print("Testing Entreprise Integration...")
    print("=" * 50)
    
    # Test 1: Check if entreprises exist
    entreprises = Entreprise.objects.all()
    print(f"1. Found {entreprises.count()} entreprises:")
    for entreprise in entreprises:
        print(f"   - {entreprise.nom} ({entreprise.secteur_activite})")
        print(f"     Stagiaires: {entreprise.nombre_stagiaires}, RH: {entreprise.nombre_rh}")
    
    # Test 2: Check if stages are linked to entreprises
    stages = Stage.objects.all()
    print(f"\n2. Found {stages.count()} stages:")
    for stage in stages:
        company_info = f"{stage.company_entreprise.nom}" if stage.company_entreprise else f"{stage.company_name} (no entreprise)"
        print(f"   - {stage.title} -> {company_info}")
    
    # Test 3: Check if offres are linked to entreprises
    offres = OffreStage.objects.all()
    print(f"\n3. Found {offres.count()} offres:")
    for offre in offres:
        company_info = f"{offre.entreprise.nom}" if offre.entreprise else "No entreprise"
        print(f"   - {offre.title} -> {company_info}")
    
    # Test 4: Check RH users and their entreprises
    rh_users = User.objects.filter(role='rh')
    print(f"\n4. Found {rh_users.count()} RH users:")
    for user in rh_users:
        company_info = f"{user.entreprise.nom}" if user.entreprise else "No entreprise"
        print(f"   - {user.get_full_name()} ({user.email}) -> {company_info}")
    
    # Test 5: Check entreprise statistics
    print(f"\n5. Entreprise Statistics:")
    for entreprise in entreprises:
        print(f"   {entreprise.nom}:")
        print(f"     - Active: {entreprise.is_active}")
        print(f"     - Stagiaires: {entreprise.nombre_stagiaires}")
        print(f"     - RH Users: {entreprise.nombre_rh}")
        print(f"     - Stages: {entreprise.stages.count()}")
        print(f"     - Offres: {entreprise.offres_stage.count()}")
    
    print("\n" + "=" * 50)
    print("Entreprise Integration Test Completed!")

if __name__ == "__main__":
    test_entreprise_integration()
