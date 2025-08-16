#!/usr/bin/env python
"""
Complete test script for candidat workflow including:
- Registration
- Login
- Creating stage demands
- Viewing offers
- Managing candidatures
- All related functionality
"""
import requests
import json
import time
import sys

class CandidatWorkflowTester:
    def __init__(self):
        self.base_url = "http://localhost:8000/api"
        self.access_token = None
        self.refresh_token = None
        self.candidat_id = None
        self.user_id = None
        self.test_email = f"test{int(time.time())}@example.com"
        
    def print_step(self, step_name):
        """Print a formatted step header"""
        print(f"\n{'='*60}")
        print(f"STEP: {step_name}")
        print(f"{'='*60}")
    
    def print_result(self, success, message, details=None):
        """Print formatted test result"""
        status = "✅ SUCCESS" if success else "❌ FAILED"
        print(f"{status}: {message}")
        if details:
            print(f"Details: {details}")
    
    def test_registration(self):
        """Test candidat registration"""
        self.print_step("Candidat Registration")
        
        url = f"{self.base_url}/candidat/register/"
        data = {
            "email": self.test_email,
            "password": "testpass123",
            "nom": "Test",
            "prenom": "Candidat",
            "telephone": "0612345678",
            "institut": "École Nationale des Sciences Appliquées",
            "specialite": "Informatique",
            "niveau": "Bac+5"
        }
        
        try:
            response = requests.post(url, json=data)
            
            if response.status_code == 201:
                result = response.json()
                self.access_token = result['access']
                self.refresh_token = result['refresh']
                self.candidat_id = result['candidat']['id']
                self.user_id = result['candidat']['user']['id']
                
                self.print_result(True, "Registration successful", 
                                f"Candidat ID: {self.candidat_id}, User ID: {self.user_id}")
                return True
            else:
                self.print_result(False, f"Registration failed with status {response.status_code}", 
                                response.text)
                return False
                
        except Exception as e:
            self.print_result(False, f"Registration error: {e}")
            return False
    
    def test_login(self):
        """Test candidat login"""
        self.print_step("Candidat Login")
        
        url = f"{self.base_url}/candidat/login/"
        data = {
            "email": self.test_email,
            "password": "testpass123"
        }
        
        try:
            response = requests.post(url, json=data)
            
            if response.status_code == 200:
                result = response.json()
                self.access_token = result['access']
                self.refresh_token = result['refresh']
                
                self.print_result(True, "Login successful", 
                                f"New tokens received")
                return True
            else:
                self.print_result(False, f"Login failed with status {response.status_code}", 
                                response.text)
                return False
                
        except Exception as e:
            self.print_result(False, f"Login error: {e}")
            return False
    
    def test_get_public_offers(self):
        """Test getting public stage offers"""
        self.print_step("Get Public Stage Offers")
        
        url = f"{self.base_url}/candidat/offres/"
        
        try:
            response = requests.get(url)
            
            if response.status_code == 200:
                result = response.json()
                offers_count = result.get('count', 0)
                
                self.print_result(True, f"Retrieved {offers_count} public offers", 
                                f"Results: {len(result.get('results', []))} offers")
                return result.get('results', [])
            else:
                self.print_result(False, f"Failed to get offers with status {response.status_code}", 
                                response.text)
                return []
                
        except Exception as e:
            self.print_result(False, f"Get offers error: {e}")
            return []
    
    def test_get_candidat_profile(self):
        """Test getting candidat profile"""
        self.print_step("Get Candidat Profile")
        
        url = f"{self.base_url}/candidat/profile/"
        headers = {'Authorization': f'Bearer {self.access_token}'}
        
        try:
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                self.print_result(True, "Profile retrieved successfully", 
                                f"Email: {result.get('user', {}).get('email')}, "
                                f"Demandes restantes: {result.get('demandes_restantes')}")
                return result
            else:
                self.print_result(False, f"Failed to get profile with status {response.status_code}", 
                                response.text)
                return None
                
        except Exception as e:
            self.print_result(False, f"Get profile error: {e}")
            return None
    
    def test_check_candidat_status(self):
        """Test checking candidat status"""
        self.print_step("Check Candidat Status")
        
        url = f"{self.base_url}/candidat/status/"
        headers = {'Authorization': f'Bearer {self.access_token}'}
        
        try:
            response = requests.post(url, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                self.print_result(True, "Status checked successfully", 
                                f"Is candidat: {result.get('is_candidat')}, "
                                f"Peut soumettre: {result.get('candidat', {}).get('peut_soumettre')}")
                return result
            else:
                self.print_result(False, f"Failed to check status with status {response.status_code}", 
                                response.text)
                return None
                
        except Exception as e:
            self.print_result(False, f"Check status error: {e}")
            return None
    
    def test_create_stage_demande(self):
        """Test creating a stage demand"""
        self.print_step("Create Stage Demand")
        
        url = f"{self.base_url}/demandes/create/"
        headers = {'Authorization': f'Bearer {self.access_token}'}
        
        # First get an available offre
        offres_response = requests.get(f"{self.base_url}/candidat/offres/")
        if offres_response.status_code == 200:
            offres = offres_response.json().get('results', [])
            if offres:
                offre_id = offres[0]['id']
            else:
                self.print_result(False, "No offers available for stage demand")
                return None
        else:
            self.print_result(False, "Failed to get offers for stage demand")
            return None
        
        data = {
            "nom": "Test",
            "prenom": "Candidat",
            "email": self.test_email,
            "telephone": "0612345678",
            "institut": "École Nationale des Sciences Appliquées",
            "specialite": "Informatique",
            "type_stage": "Stage PFE",
            "niveau": "Bac+5",
            "pfe_reference": "PFE-2025-001",
            "date_debut": "2025-09-01",
            "date_fin": "2026-01-31",
            "stage_binome": False,
            "offer_ids": [offre_id]  # Use offer_ids instead of offres
        }
        
        try:
            response = requests.post(url, json=data, headers=headers)
            
            if response.status_code == 201:
                result = response.json()
                demande_id = result.get('id')
                self.print_result(True, f"Stage demand created successfully", 
                                f"Demande ID: {demande_id}")
                return demande_id
            else:
                self.print_result(False, f"Failed to create demand with status {response.status_code}", 
                                response.text)
                return None
                
        except Exception as e:
            self.print_result(False, f"Create demand error: {e}")
            return None
    
    def test_get_candidat_demandes(self):
        """Test getting candidat's stage demands"""
        self.print_step("Get Candidat Stage Demands")
        
        url = f"{self.base_url}/candidat/demandes/"
        headers = {'Authorization': f'Bearer {self.access_token}'}
        
        try:
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                demandes_count = len(result)
                
                self.print_result(True, f"Retrieved {demandes_count} stage demands", 
                                f"Demandes: {[d.get('id') for d in result]}")
                return result
            else:
                self.print_result(False, f"Failed to get demandes with status {response.status_code}", 
                                response.text)
                return []
                
        except Exception as e:
            self.print_result(False, f"Get demandes error: {e}")
            return []
    
    def test_create_candidature(self, offre_id):
        """Test creating a candidature for an offer"""
        self.print_step("Create Candidature")
        
        url = f"{self.base_url}/candidat/candidatures/create/"
        headers = {'Authorization': f'Bearer {self.access_token}'}
        
        # Create form data
        from io import BytesIO
        import os
        
        # Create dummy files for testing
        cv_content = b"Dummy CV content"
        lettre_content = b"Dummy motivation letter content"
        
        files = {
            'cv': ('cv.pdf', BytesIO(cv_content), 'application/pdf'),
            'lettre_motivation': ('lettre.pdf', BytesIO(lettre_content), 'application/pdf')
        }
        
        data = {
            'offre': offre_id,
            'feedback': 'Test candidature feedback'
        }
        
        try:
            response = requests.post(url, data=data, files=files, headers=headers)
            
            if response.status_code == 201:
                result = response.json()
                candidature_id = result.get('id')
                self.print_result(True, f"Candidature created successfully", 
                                f"Candidature ID: {candidature_id}")
                return candidature_id
            else:
                self.print_result(False, f"Failed to create candidature with status {response.status_code}", 
                                response.text)
                return None
                
        except Exception as e:
            self.print_result(False, f"Create candidature error: {e}")
            return None
    
    def test_get_candidatures(self):
        """Test getting candidat's candidatures"""
        self.print_step("Get Candidat Candidatures")
        
        url = f"{self.base_url}/candidat/candidatures/"
        headers = {'Authorization': f'Bearer {self.access_token}'}
        
        try:
            response = requests.get(url, headers=headers)
            
            print(f"Response status: {response.status_code}")
            print(f"Response headers: {dict(response.headers)}")
            print(f"Response content: {response.text[:200]}...")  # First 200 chars
            
            if response.status_code == 200:
                try:
                    result = response.json()
                    
                    # Handle paginated response
                    if isinstance(result, dict) and 'results' in result:
                        candidatures = result['results']
                        candidatures_count = result.get('count', len(candidatures))
                    else:
                        candidatures = result
                        candidatures_count = len(candidatures)
                    
                    self.print_result(True, f"Retrieved {candidatures_count} candidatures", 
                                    f"Candidatures: {[c.get('id') for c in candidatures]}")
                    return candidatures
                except json.JSONDecodeError as e:
                    self.print_result(False, f"Response is not valid JSON: {e}", 
                                    f"Response content: {response.text}")
                    return []
            else:
                self.print_result(False, f"Failed to get candidatures with status {response.status_code}", 
                                response.text)
                return []
                
        except Exception as e:
            self.print_result(False, f"Get candidatures error: {e}")
            return []
    
    def test_get_candidat_dashboard(self):
        """Test getting candidat dashboard"""
        self.print_step("Get Candidat Dashboard")
        
        url = f"{self.base_url}/candidat/dashboard/"
        headers = {'Authorization': f'Bearer {self.access_token}'}
        
        try:
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                self.print_result(True, "Dashboard retrieved successfully", 
                                f"Demandes: {len(result.get('demandes', []))}, "
                                f"Statistiques: {result.get('statistiques', {})}")
                return result
            else:
                self.print_result(False, f"Failed to get dashboard with status {response.status_code}", 
                                response.text)
                return None
                
        except Exception as e:
            self.print_result(False, f"Get dashboard error: {e}")
            return None
    
    def test_update_profile(self):
        """Test updating candidat profile"""
        self.print_step("Update Candidat Profile")
        
        url = f"{self.base_url}/candidat/profile/"
        headers = {'Authorization': f'Bearer {self.access_token}'}
        
        data = {
            "bio": "Updated bio for testing",
            "linkedin_url": "https://linkedin.com/in/testcandidat",
            "portfolio_url": "https://portfolio.test.com"
        }
        
        try:
            response = requests.put(url, json=data, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                self.print_result(True, "Profile updated successfully", 
                                f"Bio: {result.get('bio')}, LinkedIn: {result.get('linkedin_url')}")
                return result
            else:
                self.print_result(False, f"Failed to update profile with status {response.status_code}", 
                                response.text)
                return None
                
        except Exception as e:
            self.print_result(False, f"Update profile error: {e}")
            return None
    
    def run_complete_workflow(self):
        """Run the complete candidat workflow test"""
        print("🚀 Starting Complete Candidat Workflow Test")
        print(f"Test email: {self.test_email}")
        
        # Test registration
        if not self.test_registration():
            print("❌ Registration failed, stopping workflow")
            return False
        
        # Test login
        if not self.test_login():
            print("❌ Login failed, stopping workflow")
            return False
        
        # Test getting public offers
        offers = self.test_get_public_offers()
        if not offers:
            print("⚠️ No offers available, some tests will be skipped")
        
        # Test profile operations
        self.test_get_candidat_profile()
        self.test_check_candidat_status()
        
        # Test stage demand creation
        demande_id = self.test_create_stage_demande()
        if demande_id:
            self.test_get_candidat_demandes()
        
        # Test candidature creation if offers exist
        if offers:
            first_offre = offers[0]
            offre_id = first_offre.get('id')
            if offre_id:
                candidature_id = self.test_create_candidature(offre_id)
                if candidature_id:
                    self.test_get_candidatures()
        
        # Test dashboard
        self.test_get_candidat_dashboard()
        
        # Test profile update
        self.test_update_profile()
        
        print(f"\n{'='*60}")
        print("🎉 Complete Candidat Workflow Test Finished!")
        print(f"{'='*60}")
        return True

def main():
    """Main test function"""
    tester = CandidatWorkflowTester()
    
    try:
        success = tester.run_complete_workflow()
        if success:
            print("\n✅ All tests completed successfully!")
        else:
            print("\n❌ Some tests failed!")
            
    except KeyboardInterrupt:
        print("\n⏹️ Test interrupted by user")
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
