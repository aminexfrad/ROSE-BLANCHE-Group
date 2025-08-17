#!/usr/bin/env python3
"""
Test the view validation logic
"""

def test_view_validation():
    """Test the view validation logic"""
    
    # Simulate the data that would come from frontend
    test_data = {
        'type_stage': 'Stage PFE',
        'pfe_reference': 'TEST001',
        'offer_ids': []  # Empty list
    }
    
    print("Testing view validation logic...")
    print(f"Input data: {test_data}")
    
    # Simulate the view validation logic
    offer_ids = test_data.get('offer_ids', [])
    type_stage = test_data.get('type_stage')
    pfe_reference = test_data.get('pfe_reference')
    
    print(f"offer_ids: {offer_ids}")
    print(f"type_stage: {type_stage}")
    print(f"pfe_reference: {pfe_reference}")
    
    if type_stage == 'Stage PFE':
        if offer_ids and len(offer_ids) > 0:
            print("✅ Has offer_ids, validation passed")
        else:
            # Check if we have pfe_reference
            if not pfe_reference:
                print("❌ Validation failed: No offer_ids and no pfe_reference")
                return False
            else:
                print("✅ Has pfe_reference, validation passed")
    
    print("✅ All validation checks passed!")
    return True

if __name__ == "__main__":
    test_view_validation()
