#!/usr/bin/env python
"""
Test de l'affichage des rapports archivés
"""

import os
import sys
import django
import requests

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from shared.models import PFEReport
from auth_service.models import User

def test_archived_reports():
    print("📦 Test de l'affichage des rapports archivés...")
    
    # Test 1: Vérifier les rapports archivés dans la base de données
    print("\n1️⃣ Vérification des rapports archivés dans la base de données...")
    archived_reports = PFEReport.objects.filter(status='archived')
    print(f"   ✅ {archived_reports.count()} rapport(s) archivé(s) trouvé(s)")
    
    for report in archived_reports:
        print(f"   - {report.title} (ID: {report.id}) - {report.stagiaire.get_full_name()}")
    
    # Test 2: Vérifier l'API pour RH
    print("\n2️⃣ Test de l'API pour RH...")
    base_url = "http://localhost:8000/api"
    
    try:
        # Login RH
        login_response = requests.post(f"{base_url}/auth/login/", json={
            'email': 'rh.complet@example.com',
            'password': 'test1234'
        })
        
        if login_response.status_code == 200:
            token = login_response.json().get('access')
            headers = {'Authorization': f'Bearer {token}'}
            
            # Récupérer les rapports PFE
            reports_response = requests.get(f"{base_url}/pfe-reports/", headers=headers)
            
            if reports_response.status_code == 200:
                reports_data = reports_response.json()
                reports = reports_data.get('results', [])
                
                print(f"   ✅ {len(reports)} rapport(s) trouvé(s) pour RH")
                
                # Compter les rapports archivés
                archived_count = sum(1 for r in reports if r.get('status') == 'archived')
                approved_count = sum(1 for r in reports if r.get('status') == 'approved')
                
                print(f"   📊 Répartition:")
                print(f"      - Approuvés: {approved_count}")
                print(f"      - Archivés: {archived_count}")
                
                # Afficher les rapports archivés
                archived_reports_api = [r for r in reports if r.get('status') == 'archived']
                if archived_reports_api:
                    print(f"   📦 Rapports archivés visibles pour RH:")
                    for report in archived_reports_api:
                        print(f"      - {report.get('title')} (ID: {report.get('id')})")
            else:
                print(f"   ❌ Erreur API: {reports_response.status_code}")
        else:
            print(f"   ❌ Login failed: {login_response.status_code}")
    
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
    
    # Test 3: Vérifier l'admin Django
    print("\n3️⃣ Test de l'admin Django...")
    print("   📋 Pour vérifier l'admin Django:")
    print("      1. Allez sur http://localhost:8000/admin/")
    print("      2. Connectez-vous avec admin/admin")
    print("      3. Cliquez sur 'PFE Reports'")
    print("      4. Vérifiez que les rapports archivés sont visibles")
    
    print("\n✅ Test terminé !")

if __name__ == "__main__":
    test_archived_reports() 