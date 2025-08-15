#!/usr/bin/env python3
"""
Script pour diagnostiquer les champs du modèle Demande
et identifier les incohérences avec la base de données
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from django.db import connection
from demande_service.models import Demande

def debug_demande_model_fields():
    """Diagnostic des champs du modèle Demande"""
    
    print("🔍 Diagnostic des champs du modèle Demande")
    print("=" * 60)
    
    # 1. Vérifier les champs du modèle Django
    print("\n📋 Champs du modèle Django:")
    model_fields = Demande._meta.get_fields()
    field_names = [field.name for field in model_fields]
    
    for field in model_fields:
        field_type = type(field).__name__
        if hasattr(field, 'max_length'):
            print(f"   - {field.name}: {field_type}(max_length={field.max_length})")
        elif hasattr(field, 'choices'):
            print(f"   - {field.name}: {field_type}(choices={len(field.choices)})")
        else:
            print(f"   - {field.name}: {field_type}")
    
    # 2. Vérifier la structure de la base de données
    print(f"\n🗄️ Structure de la base de données:")
    
    with connection.cursor() as cursor:
        # Obtenir la structure de la table
        cursor.execute("DESCRIBE demande_stage")
        columns = cursor.fetchall()
        
        print(f"   Colonnes de la table 'demande_stage':")
        for column in columns:
            field_name = column[0]
            field_type = column[1]
            null_allowed = column[2]
            key_type = column[3]
            default_value = column[4]
            extra = column[5]
            
            print(f"     - {field_name}: {field_type} | Null: {null_allowed} | Default: {default_value}")
    
    # 3. Identifier les incohérences
    print(f"\n🔍 Analyse des incohérences:")
    
    # Champs du modèle
    model_field_names = set(field_names)
    
    # Champs de la base de données
    db_field_names = set()
    with connection.cursor() as cursor:
        cursor.execute("DESCRIBE demande_stage")
        columns = cursor.fetchall()
        db_field_names = {column[0] for column in columns}
    
    # Champs manquants dans la base de données
    missing_in_db = model_field_names - db_field_names
    if missing_in_db:
        print(f"   ❌ Champs du modèle manquants en base:")
        for field in missing_in_db:
            print(f"     - {field}")
    
    # Champs en base non présents dans le modèle
    extra_in_db = db_field_names - model_field_names
    if extra_in_db:
        print(f"   ⚠️ Champs en base non présents dans le modèle:")
        for field in extra_in_db:
            print(f"     - {field}")
    
    # Champs communs
    common_fields = model_field_names & db_field_names
    print(f"   ✅ Champs communs: {len(common_fields)}")
    
    # 4. Vérifier les champs de date spécifiquement
    print(f"\n📅 Analyse des champs de date:")
    
    date_fields_model = [f for f in model_fields if 'date' in f.name.lower() or 'time' in f.name.lower()]
    print(f"   Champs de date dans le modèle:")
    for field in date_fields_model:
        print(f"     - {field.name}: {type(field).__name__}")
    
    date_fields_db = [col for col in columns if 'date' in col[0].lower() or 'time' in col[0].lower()]
    print(f"   Champs de date en base:")
    for field in date_fields_db:
        print(f"     - {field[0]}: {field[1]}")
    
    # 5. Recommandations
    print(f"\n💡 Recommandations:")
    
    if missing_in_db:
        print(f"   🔧 Créer une migration pour ajouter les champs manquants")
        for field in missing_in_db:
            print(f"     - Ajouter le champ '{field}' en base")
    
    if extra_in_db:
        print(f"   🔍 Vérifier si les champs supplémentaires sont nécessaires")
        for field in extra_in_db:
            print(f"     - Analyser l'usage du champ '{field}'")
    
    # 6. Test de création d'une instance
    print(f"\n🧪 Test de création d'une instance...")
    
    try:
        # Essayer de créer une instance vide pour voir les erreurs
        demande = Demande()
        demande.save()
        print(f"   ✅ Instance créée avec succès (ID: {demande.id})")
        
        # Supprimer l'instance de test
        demande.delete()
        print(f"   ✅ Instance de test supprimée")
        
    except Exception as e:
        print(f"   ❌ Erreur lors de la création: {e}")
        
        # Analyser l'erreur
        if "Field 'date_modification' doesn't have a default value" in str(e):
            print(f"   🔍 Problème identifié: Le champ 'date_modification' est attendu en base")
            print(f"   💡 Solution: Ajouter ce champ ou modifier le modèle")
        
        elif "Field 'date_soumission' doesn't have a default value" in str(e):
            print(f"   🔍 Problème identifié: Le champ 'date_soumission' est attendu en base")
            print(f"   💡 Solution: Exécuter la migration pour ajouter ce champ")
    
    return len(missing_in_db) == 0 and len(extra_in_db) == 0

if __name__ == '__main__':
    success = debug_demande_model_fields()
    if success:
        print(f"\n✅ Aucune incohérence détectée")
    else:
        print(f"\n❌ Incohérences détectées - Correction nécessaire")
