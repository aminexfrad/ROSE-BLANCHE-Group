#!/usr/bin/env python
"""
Script pour créer et approuver des rapports PFE
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from shared.models import PFEReport, Stage
from auth_service.models import User

def create_and_approve_reports():
    print("📝 Création et approbation de rapports PFE...")
    
    # Trouver des stages actifs
    active_stages = Stage.objects.filter(status='active')
    
    if not active_stages.exists():
        print("❌ Aucun stage actif trouvé")
        return
    
    print(f"✅ {active_stages.count()} stage(s) actif(s) trouvé(s)")
    
    # Créer des rapports PFE pour les premiers stages
    for i, stage in enumerate(active_stages[:3]):
        try:
            # Vérifier si un rapport existe déjà
            existing_report = PFEReport.objects.filter(stage=stage).first()
            if existing_report:
                print(f"📋 Rapport existant pour {stage.title}: {existing_report.title}")
                continue
            
            # Créer un nouveau rapport
            report = PFEReport.objects.create(
                stage=stage,
                stagiaire=stage.stagiaire,
                tuteur=stage.tuteur,
                title=f"Rapport PFE - {stage.title}",
                abstract=f"Résumé du projet PFE pour {stage.title}",
                keywords="PFE, projet, stage, développement",
                speciality="Informatique",
                year=2025,
                status='submitted'
            )
            
            print(f"📝 Rapport créé: {report.title}")
            print(f"   ID: {report.id}")
            print(f"   Stagiaire: {report.stagiaire.get_full_name()}")
            print(f"   Status: {report.status}")
            
            # Approuver le rapport
            report.approve("Excellent travail ! Rapport bien structuré et complet.")
            print(f"✅ Rapport approuvé: {report.title}")
            
        except Exception as e:
            print(f"❌ Erreur lors de la création du rapport pour {stage.title}: {e}")
    
    # Afficher les statistiques
    total_reports = PFEReport.objects.count()
    approved_count = PFEReport.objects.filter(status='approved').count()
    submitted_count = PFEReport.objects.filter(status='submitted').count()
    
    print(f"\n📊 Statistiques des rapports PFE:")
    print(f"   Total: {total_reports}")
    print(f"   Soumis: {submitted_count}")
    print(f"   Approuvés: {approved_count}")
    
    # Afficher les rapports approuvés
    approved_reports = PFEReport.objects.filter(status='approved')
    if approved_reports.exists():
        print(f"\n✅ Rapports approuvés:")
        for report in approved_reports:
            print(f"   - {report.title} (ID: {report.id}) - {report.stagiaire.get_full_name()}")

if __name__ == "__main__":
    create_and_approve_reports() 