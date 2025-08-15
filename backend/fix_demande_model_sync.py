#!/usr/bin/env python3
"""
Script pour synchroniser le modèle Demande avec la base de données
Corrige les incohérences de noms de champs
"""

import os
import sys
import django
from django.db import connection

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from demande_service.models import Demande

def fix_demande_model_sync():
    """Synchroniser le modèle Demande avec la base de données"""
    
    print("🔧 Synchronisation du modèle Demande avec la base de données")
    print("=" * 70)
    
    # 1. Analyser la situation actuelle
    print("\n📋 Situation actuelle:")
    
    with connection.cursor() as cursor:
        cursor.execute("DESCRIBE demande_stage")
        columns = cursor.fetchall()
        db_fields = {col[0]: col[1] for col in columns}
    
    print(f"   Champs en base de données: {len(db_fields)}")
    print(f"   Champs dans le modèle Django: {len(Demande._meta.get_fields())}")
    
    # 2. Identifier les problèmes spécifiques
    print(f"\n🔍 Problèmes identifiés:")
    
    # Problème principal: date_modification vs updated_at
    if 'date_modification' in db_fields and 'updated_at' in db_fields:
        print(f"   ❌ Conflit: 'date_modification' et 'updated_at' existent tous les deux")
    elif 'date_modification' in db_fields:
        print(f"   ⚠️ La base a 'date_modification' mais le modèle a 'updated_at'")
    elif 'updated_at' in db_fields:
        print(f"   ⚠️ La base a 'updated_at' mais le modèle a 'updated_at'")
    
    # Problème: date_soumission est datetime en base mais DateField en modèle
    if 'date_soumission' in db_fields:
        db_type = db_fields['date_soumission']
        if 'datetime' in db_type:
            print(f"   ⚠️ 'date_soumission' est datetime en base mais DateField en modèle")
    
    # 3. Solutions proposées
    print(f"\n💡 Solutions proposées:")
    
    # Option 1: Modifier la base de données pour correspondre au modèle
    print(f"   🔧 Option 1: Modifier la base de données")
    print(f"      - Renommer 'date_modification' en 'updated_at'")
    print(f"      - Modifier 'date_soumission' de datetime à date")
    print(f"      - Ajouter les champs manquants du modèle")
    
    # Option 2: Modifier le modèle pour correspondre à la base
    print(f"   🔧 Option 2: Modifier le modèle Django")
    print(f"      - Renommer 'updated_at' en 'date_modification'")
    print(f"      - Modifier 'date_soumission' de DateField à DateTimeField")
    print(f"      - Adapter les autres champs")
    
    # 4. Recommandation
    print(f"\n🎯 Recommandation:")
    print(f"   Option 1 (modifier la base) est préférable car:")
    print(f"   - Le modèle Django suit les conventions standard")
    print(f"   - Les noms de champs sont plus clairs")
    print(f"   - Cohérence avec le reste du système")
    
    # 5. Vérifier si on peut exécuter la correction
    print(f"\n🔒 Vérification de la sécurité:")
    
    # Vérifier s'il y a des données existantes
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM demande_stage")
        count = cursor.fetchone()[0]
    
    if count > 0:
        print(f"   ⚠️ ATTENTION: {count} demandes existent en base")
        print(f"   🔍 Sauvegarde recommandée avant modification")
    else:
        print(f"   ✅ Aucune donnée existante - modification sûre")
    
    # 6. Proposer la correction
    print(f"\n🚀 Correction proposée:")
    
    if count == 0:
        print(f"   ✅ Exécution automatique possible (base vide)")
        
        # Créer la table avec la bonne structure
        print(f"   🔧 Recréation de la table avec la bonne structure...")
        
        try:
            with connection.cursor() as cursor:
                # Supprimer la table existante
                cursor.execute("DROP TABLE IF EXISTS demande_stage")
                print(f"   ✅ Table supprimée")
                
                # Créer la table avec la bonne structure
                create_table_sql = """
                CREATE TABLE demande_stage (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    nom VARCHAR(100) NOT NULL,
                    prenom VARCHAR(100) NOT NULL,
                    email VARCHAR(254) NOT NULL,
                    telephone VARCHAR(20) NOT NULL,
                    institut VARCHAR(200) NOT NULL,
                    specialite VARCHAR(200) NOT NULL,
                    type_stage VARCHAR(50) NOT NULL,
                    niveau VARCHAR(100) NOT NULL,
                    pfe_reference VARCHAR(200) NOT NULL,
                    date_debut DATE NOT NULL,
                    date_fin DATE NOT NULL,
                    stage_binome BOOLEAN NOT NULL,
                    nom_binome VARCHAR(100) NOT NULL,
                    prenom_binome VARCHAR(100) NOT NULL,
                    email_binome VARCHAR(254) NOT NULL,
                    telephone_binome VARCHAR(20) NOT NULL,
                    cv VARCHAR(100),
                    lettre_motivation VARCHAR(100),
                    demande_stage VARCHAR(100),
                    cv_binome VARCHAR(100),
                    lettre_motivation_binome VARCHAR(100),
                    demande_stage_binome VARCHAR(100),
                    status VARCHAR(20) NOT NULL,
                    raison_refus TEXT NOT NULL,
                    user_created_id BIGINT,
                    entreprise_id BIGINT,
                    created_at DATETIME(6) NOT NULL,
                    updated_at DATETIME(6) NOT NULL,
                    date_soumission DATE NOT NULL,
                    INDEX idx_email (email(100)),
                    INDEX idx_status (status),
                    INDEX idx_created_at (created_at)
                )
                """
                cursor.execute(create_table_sql)
                print(f"   ✅ Table recréée avec la bonne structure")
                
                # Vérifier la structure
                cursor.execute("DESCRIBE demande_stage")
                new_columns = cursor.fetchall()
                print(f"   📋 Nouvelle structure:")
                for col in new_columns:
                    print(f"     - {col[0]}: {col[1]}")
                
        except Exception as e:
            print(f"   ❌ Erreur lors de la correction: {e}")
            return False
            
    else:
        print(f"   ⚠️ Correction manuelle requise (données existantes)")
        print(f"   📋 Script SQL à exécuter:")
        print(f"   ALTER TABLE demande_stage CHANGE date_modification updated_at DATETIME(6) NOT NULL;")
        print(f"   ALTER TABLE demande_stage MODIFY date_soumission DATE NOT NULL;")
    
    # 7. Test de validation
    print(f"\n🧪 Test de validation...")
    
    try:
        # Essayer de créer une instance
        demande = Demande()
        demande.save()
        print(f"   ✅ Instance créée avec succès (ID: {demande.id})")
        
        # Supprimer l'instance de test
        demande.delete()
        print(f"   ✅ Instance de test supprimée")
        
        print(f"   🎉 Synchronisation réussie!")
        return True
        
    except Exception as e:
        print(f"   ❌ Erreur lors du test: {e}")
        return False

if __name__ == '__main__':
    success = fix_demande_model_sync()
    if success:
        print(f"\n✅ Le modèle Demande est maintenant synchronisé avec la base!")
        print(f"🚀 Les demandes de stage peuvent être créées sans erreur")
    else:
        print(f"\n❌ La synchronisation a échoué")
        print(f"🔍 Vérifiez les erreurs ci-dessus")
