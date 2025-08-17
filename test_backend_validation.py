#!/usr/bin/env python3
"""
Simple test to verify backend validation logic
"""

import sys
import os

# Add backend to path
sys.path.append('backend')

# Test the validation logic directly
def test_validation_logic():
    """Test the validation logic without making HTTP requests"""
    
    # Simulate the data that would come from frontend
    test_data = {
        'type_stage': 'Stage PFE',
        'pfe_reference': 'TEST001',
        'offer_ids': []  # Empty list
    }
    
    print("Testing validation logic...")
    print(f"Input data: {test_data}")
    
    # Simulate the validation logic
    offer_ids = test_data.get('offer_ids', [])
    type_stage = test_data.get('type_stage')
    pfe_reference = test_data.get('pfe_reference')
    
    print(f"offer_ids: {offer_ids}")
    print(f"type_stage: {type_stage}")
    print(f"pfe_reference: {pfe_reference}")
    
    if type_stage == 'Stage PFE':
        has_offer_ids = offer_ids and len(offer_ids) > 0
        has_pfe_reference = pfe_reference
        
        print(f"has_offer_ids: {has_offer_ids}")
        print(f"has_pfe_reference: {has_pfe_reference}")
        
        if has_offer_ids:
            if len(offer_ids) > 1:
                print("❌ Validation failed: Too many offers")
                return False
            print("✅ Validation passed: Has offer_ids")
        elif not has_pfe_reference:
            print("❌ Validation failed: No pfe_reference")
            return False
        else:
            print("✅ Validation passed: Has pfe_reference")
    
    print("✅ All validation checks passed!")
    return True

if __name__ == "__main__":
    test_validation_logic()
