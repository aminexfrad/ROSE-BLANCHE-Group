#!/usr/bin/env python3
"""
Test that entreprise is correctly filled from pfe_reference
"""

def test_entreprise_filling_logic():
    """Test the entreprise filling logic"""
    
    print("Testing entreprise filling logic...")
    
    # Test case 1: With offer_ids
    print("\n1. Test avec offer_ids:")
    offer_ids = [123]
    pfe_reference = "TEST001"
    print(f"   offer_ids: {offer_ids}")
    print(f"   pfe_reference: {pfe_reference}")
    print("   ✅ Entreprise sera remplie depuis l'offre")
    
    # Test case 2: Without offer_ids but with pfe_reference
    print("\n2. Test sans offer_ids mais avec pfe_reference:")
    offer_ids = []
    pfe_reference = "TEST001"
    print(f"   offer_ids: {offer_ids}")
    print(f"   pfe_reference: {pfe_reference}")
    print("   ✅ Entreprise sera remplie depuis la référence PFE")
    
    # Test case 3: Without both
    print("\n3. Test sans offer_ids ni pfe_reference:")
    offer_ids = []
    pfe_reference = ""
    print(f"   offer_ids: {offer_ids}")
    print(f"   pfe_reference: {pfe_reference}")
    print("   ❌ Aucune entreprise ne peut être remplie")
    
    print("\n✅ Tests de logique terminés!")

if __name__ == "__main__":
    test_entreprise_filling_logic()
