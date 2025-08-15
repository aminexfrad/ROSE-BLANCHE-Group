#!/usr/bin/env python
"""
Test simple de l'API des stages
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from shared.models import Stage, User
from django.db import connection

def test_stage_api():
    print("🧪 Test de l'API des stages")
    print("=" * 30)
    
    try:
        # Test 1: Connexion à la base de données
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            print("✅ Base de données OK")
        
        # Test 2: Compter les stages
        stages_count = Stage.objects.count()
        print(f"📊 Nombre total de stages: {stages_count}")
        
        # Test 3: Compter les stages actifs
        active_stages = Stage.objects.filter(status='active').count()
        print(f"🟢 Stages actifs: {active_stages}")
        
        # Test 4: Compter les utilisateurs stagiaires
        stagiaires = User.objects.filter(role='stagiaire').count()
        print(f"👥 Stagiaires: {stagiaires}")
        
        # Test 5: Vérifier un stage spécifique
        if stages_count > 0:
            stage = Stage.objects.first()
            print(f"📋 Premier stage: {stage.title}")
            print(f"   - Stagiaire: {stage.stagiaire.get_full_name()}")
            print(f"   - Statut: {stage.status}")
            
            # Test de la méthode __str__
            try:
                str_result = str(stage)
                print(f"   - __str__ OK: {str_result[:50]}...")
            except Exception as e:
                print(f"   - ❌ Erreur __str__: {e}")
        
        print("\n✅ Tests terminés avec succès")
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_stage_api()
