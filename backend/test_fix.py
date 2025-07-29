#!/usr/bin/env python
"""
Test simple de la correction
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from shared.models import Stage, PFEReport
from auth_service.models import User

def test_fix():
    print("🧪 Test de la correction...")
    
    # Trouver le stagiaire
    stagiaire = User.objects.filter(email='stagiaire.complet@example.com').first()
    if not stagiaire:
        print("❌ Stagiaire non trouvé")
        return
    
    # Trouver le stage actif
    stage = Stage.objects.filter(stagiaire=stagiaire, status='active').first()
    if not stage:
        print("❌ Stage actif non trouvé")
        return
    
    print(f"✅ Stage trouvé: {stage.title} (ID: {stage.id})")
    
    # Vérifier le rapport PFE existant
    existing_report = PFEReport.objects.filter(stage=stage).first()
    if existing_report:
        print(f"✅ Rapport PFE existant: {existing_report.title}")
        print(f"   Status: {existing_report.status}")
        print(f"   Version: {existing_report.version}")
    else:
        print("❌ Aucun rapport PFE trouvé")
    
    print("\n✅ Test terminé - la correction devrait fonctionner maintenant !")

if __name__ == "__main__":
    test_fix() 