#!/usr/bin/env python
"""
Script pour créer des rapports PFE de test
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from auth_service.models import User
from shared.models import Stage, PFEReport
from datetime import date, timedelta

def create_pfe_reports():
    print("Création des rapports PFE de test...")
    
    # Trouver un stage actif
    stage_actif = Stage.objects.filter(status='active').first()
    if not stage_actif:
        print("❌ Aucun stage actif trouvé")
        return
    
    stagiaire = stage_actif.stagiaire
    print(f"✅ Stage trouvé: {stage_actif.title}")
    print(f"   Stagiaire: {stagiaire.get_full_name()}")
    
    # Créer un rapport PFE de test
    pfe_report, created = PFEReport.objects.get_or_create(
        stage=stage_actif,
        defaults={
            'stagiaire': stagiaire,
            'tuteur': stage_actif.tuteur,
            'title': 'Rapport PFE - Développement d\'une application web moderne',
            'abstract': 'Ce projet présente le développement d\'une application web moderne utilisant les technologies React et Django. L\'objectif est de créer une plateforme de gestion de stages avec des fonctionnalités avancées.',
            'keywords': 'React, Django, Python, JavaScript, Web Development, Full-Stack',
            'speciality': 'Informatique - Développement Web',
            'year': 2025,
            'status': 'draft',
            'version': 1,
            'is_final': False
        }
    )
    
    if created:
        print(f"✅ Rapport PFE créé: {pfe_report.title}")
        print(f"   Statut: {pfe_report.status}")
        print(f"   Année: {pfe_report.year}")
    else:
        print(f"✅ Rapport PFE existant: {pfe_report.title}")
    
    # Créer un deuxième rapport PFE pour un autre stage
    stage_actif2 = Stage.objects.filter(status='active').exclude(id=stage_actif.id).first()
    if stage_actif2:
        pfe_report2, created2 = PFEReport.objects.get_or_create(
            stage=stage_actif2,
            defaults={
                'stagiaire': stage_actif2.stagiaire,
                'tuteur': stage_actif2.tuteur,
                'title': 'Rapport PFE - Intelligence Artificielle et Machine Learning',
                'abstract': 'Ce projet explore l\'application de l\'intelligence artificielle et du machine learning dans le domaine de l\'analyse de données. L\'objectif est de développer des modèles prédictifs pour l\'optimisation des processus.',
                'keywords': 'Machine Learning, Python, TensorFlow, Data Science, AI',
                'speciality': 'Informatique - Intelligence Artificielle',
                'year': 2025,
                'status': 'submitted',
                'version': 1,
                'is_final': False
            }
        )
        
        if created2:
            print(f"✅ Deuxième rapport PFE créé: {pfe_report2.title}")
            print(f"   Statut: {pfe_report2.status}")
        else:
            print(f"✅ Deuxième rapport PFE existant: {pfe_report2.title}")
    
    # Afficher le résumé
    total_reports = PFEReport.objects.count()
    print(f"\n📊 Résumé:")
    print(f"   Total des rapports PFE: {total_reports}")
    
    for report in PFEReport.objects.all():
        print(f"   - {report.title} ({report.stagiaire.get_full_name()}) - {report.status}")

if __name__ == "__main__":
    create_pfe_reports() 