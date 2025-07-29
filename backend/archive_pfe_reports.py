#!/usr/bin/env python
"""
Script pour archiver des rapports PFE pour tester l'affichage
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from shared.models import PFEReport
from auth_service.models import User

def archive_pfe_reports():
    print("📦 Archivage de rapports PFE pour test...")
    
    # Trouver des rapports approuvés à archiver
    approved_reports = PFEReport.objects.filter(status='approved')
    
    if not approved_reports.exists():
        print("❌ Aucun rapport approuvé trouvé pour l'archivage")
        return
    
    print(f"✅ {approved_reports.count()} rapport(s) approuvé(s) trouvé(s)")
    
    # Archiver les premiers rapports
    for i, report in enumerate(approved_reports[:3]):
        try:
            report.archive()
            print(f"📦 Rapport archivé: {report.title}")
            print(f"   ID: {report.id}")
            print(f"   Stagiaire: {report.stagiaire.get_full_name()}")
            print(f"   Année: {report.year}")
            print(f"   Status: {report.status}")
        except Exception as e:
            print(f"❌ Erreur lors de l'archivage du rapport {report.id}: {e}")
    
    # Afficher les statistiques
    total_reports = PFEReport.objects.count()
    approved_count = PFEReport.objects.filter(status='approved').count()
    archived_count = PFEReport.objects.filter(status='archived').count()
    
    print(f"\n📊 Statistiques des rapports PFE:")
    print(f"   Total: {total_reports}")
    print(f"   Approuvés: {approved_count}")
    print(f"   Archivés: {archived_count}")
    
    # Afficher les rapports archivés
    archived_reports = PFEReport.objects.filter(status='archived')
    if archived_reports.exists():
        print(f"\n📦 Rapports archivés:")
        for report in archived_reports:
            print(f"   - {report.title} (ID: {report.id}) - {report.stagiaire.get_full_name()}")

if __name__ == "__main__":
    archive_pfe_reports() 