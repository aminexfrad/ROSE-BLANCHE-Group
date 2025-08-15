#!/usr/bin/env python
"""
Script pour diagnostiquer l'erreur "Aucun stage actif"
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from auth_service.models import User
from shared.models import Stage, Entreprise
from django.db import connection

def debug_stage_error():
    print("🔍 Diagnostic de l'erreur 'Aucun stage actif'")
    print("=" * 50)
    
    # 1. Vérifier la connexion à la base de données
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            print("✅ Connexion à la base de données OK")
    except Exception as e:
        print(f"❌ Erreur de connexion à la base de données: {e}")
        return
    
    # 2. Vérifier les utilisateurs stagiaires
    stagiaires = User.objects.filter(role='stagiaire')
    print(f"\n📊 Utilisateurs stagiaires trouvés: {stagiaires.count()}")
    
    if stagiaires.exists():
        for stagiaire in stagiaires[:5]:  # Afficher les 5 premiers
            print(f"   - {stagiaire.get_full_name()} ({stagiaire.email})")
    
    # 3. Vérifier les stages existants
    stages = Stage.objects.all()
    print(f"\n📋 Stages existants: {stages.count()}")
    
    if stages.exists():
        for stage in stages[:5]:  # Afficher les 5 premiers
            company_info = "Aucune entreprise"
            if stage.company_entreprise:
                company_info = stage.company_entreprise.nom
            elif stage.company_name:
                company_info = stage.company_name
            
            print(f"   - {stage.title} - {stage.stagiaire.get_full_name()} - {company_info} - {stage.status}")
    
    # 4. Vérifier les stages actifs
    stages_actifs = Stage.objects.filter(status='active')
    print(f"\n🟢 Stages actifs: {stages_actifs.count()}")
    
    if stages_actifs.exists():
        for stage in stages_actifs:
            company_info = "Aucune entreprise"
            if stage.company_entreprise:
                company_info = stage.company_entreprise.nom
            elif stage.company_name:
                company_info = stage.company_name
            
            print(f"   - {stage.title} - {stage.stagiaire.get_full_name()} - {company_info}")
    
    # 5. Vérifier les entreprises
    entreprises = Entreprise.objects.all()
    print(f"\n🏢 Entreprises: {entreprises.count()}")
    
    if entreprises.exists():
        for entreprise in entreprises[:5]:
            print(f"   - {entreprise.nom} ({entreprise.ville}, {entreprise.pays})")
    
    # 6. Tester la création d'un stage de test
    print(f"\n🧪 Test de création d'un stage...")
    try:
        # Trouver un stagiaire sans stage actif
        stagiaire_sans_stage = None
        for stagiaire in stagiaires:
            if not Stage.objects.filter(stagiaire=stagiaire, status='active').exists():
                stagiaire_sans_stage = stagiaire
                break
        
        if stagiaire_sans_stage:
            print(f"   - Stagiaire sans stage trouvé: {stagiaire_sans_stage.get_full_name()}")
            
            # Trouver une entreprise
            entreprise = Entreprise.objects.first()
            if entreprise:
                print(f"   - Entreprise trouvée: {entreprise.nom}")
                
                # Créer un stage de test
                from datetime import date, timedelta
                stage_test = Stage.objects.create(
                    title=f"Stage test pour {stagiaire_sans_stage.prenom}",
                    description="Stage de test pour diagnostic",
                    company_entreprise=entreprise,
                    location="Tunis",
                    start_date=date.today(),
                    end_date=date.today() + timedelta(days=90),
                    status='active',
                    progress=0,
                    stagiaire=stagiaire_sans_stage
                )
                print(f"   ✅ Stage de test créé: {stage_test.id}")
                
                # Supprimer le stage de test
                stage_test.delete()
                print(f"   🗑️  Stage de test supprimé")
            else:
                print("   ❌ Aucune entreprise trouvée")
        else:
            print("   ℹ️  Tous les stagiaires ont déjà un stage actif")
            
    except Exception as e:
        print(f"   ❌ Erreur lors du test: {e}")
        import traceback
        traceback.print_exc()
    
    # 7. Vérifier les erreurs de modèle
    print(f"\n🔧 Vérification des modèles...")
    try:
        # Tester la méthode __str__ du modèle Stage
        stage_example = Stage.objects.first()
        if stage_example:
            str_result = str(stage_example)
            print(f"   ✅ Méthode __str__ du modèle Stage OK: {str_result[:50]}...")
        else:
            print("   ℹ️  Aucun stage pour tester la méthode __str__")
    except Exception as e:
        print(f"   ❌ Erreur dans la méthode __str__ du modèle Stage: {e}")
    
    print(f"\n🏁 Diagnostic terminé")

if __name__ == '__main__':
    debug_stage_error()
