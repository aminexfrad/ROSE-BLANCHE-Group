#!/usr/bin/env python3
"""
Script de diagnostic pour identifier le problème avec le champ date_soumission
"""

import os
import sys
import django
from django.db import connection

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from django.db import connection
from demande_service.models import Demande

def debug_demande_model():
    """Diagnostic du modèle Demande et de la base de données"""
    
    print("🔍 Diagnostic du modèle Demande et de la base de données")
    print("=" * 60)
    
    # 1. Vérifier les champs du modèle Django
    print("\n📋 Champs du modèle Django Demande:")
    model_fields = Demande._meta.get_fields()
    for field in model_fields:
        field_type = type(field).__name__
        field_name = field.name
        field_null = getattr(field, 'null', False)
        field_blank = getattr(field, 'blank', False)
        field_default = getattr(field, 'default', None)
        
        print(f"   - {field_name}: {field_type} (null={field_null}, blank={field_blank}, default={field_default})")
    
    # 2. Vérifier la structure de la base de données
    print("\n🗄️ Structure de la base de données:")
    with connection.cursor() as cursor:
        cursor.execute("DESCRIBE demande_stage")
        columns = cursor.fetchall()
        
        for column in columns:
            field_name = column[0]
            field_type = column[1]
            field_null = column[2]
            field_key = column[3]
            field_default = column[4]
            field_extra = column[5]
            
            print(f"   - {field_name}: {field_type} (null={field_null}, key={field_key}, default={field_default}, extra={field_extra})")
    
    # 3. Vérifier s'il y a des champs manquants
    print("\n🔍 Analyse des différences:")
    
    # Récupérer les noms des champs du modèle
    model_field_names = [field.name for field in model_fields]
    
    # Récupérer les noms des colonnes de la base de données
    with connection.cursor() as cursor:
        cursor.execute("DESCRIBE demande_stage")
        db_columns = cursor.fetchall()
        db_field_names = [column[0] for column in db_columns]
    
    # Champs dans la DB mais pas dans le modèle
    db_only_fields = set(db_field_names) - set(model_field_names)
    if db_only_fields:
        print(f"   ❌ Champs dans la DB mais pas dans le modèle: {list(db_only_fields)}")
    else:
        print("   ✅ Tous les champs de la DB sont dans le modèle")
    
    # Champs dans le modèle mais pas dans la DB
    model_only_fields = set(model_field_names) - set(db_field_names)
    if model_only_fields:
        print(f"   ❌ Champs dans le modèle mais pas dans la DB: {list(model_only_fields)}")
    else:
        print("   ✅ Tous les champs du modèle sont dans la DB")
    
    # 4. Vérifier les contraintes de la base de données
    print("\n🔒 Contraintes de la base de données:")
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                COLUMN_NAME,
                IS_NULLABLE,
                COLUMN_DEFAULT,
                COLUMN_TYPE
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'demande_stage'
            ORDER BY ORDINAL_POSITION
        """)
        
        columns_info = cursor.fetchall()
        for col_info in columns_info:
            col_name = col_info[0]
            is_nullable = col_info[1]
            col_default = col_info[2]
            col_type = col_info[3]
            
            print(f"   - {col_name}: {col_type} (nullable={is_nullable}, default={col_default})")
    
    # 5. Suggestions de correction
    print("\n💡 Suggestions de correction:")
    
    if 'date_soumission' in db_field_names and 'date_soumission' not in model_field_names:
        print("   🔧 Le champ 'date_soumission' existe dans la DB mais pas dans le modèle Django")
        print("   📝 Solutions possibles:")
        print("      1. Ajouter le champ au modèle Django")
        print("      2. Créer une migration pour supprimer le champ de la DB")
        print("      3. Synchroniser la DB avec le modèle actuel")
    
    print("\n🎯 Prochaines étapes:")
    print("   1. Identifier la source du champ 'date_soumission'")
    print("   2. Décider s'il faut le garder ou le supprimer")
    print("   3. Créer les migrations appropriées")
    print("   4. Tester la création de demande")

if __name__ == '__main__':
    debug_demande_model()
