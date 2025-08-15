#!/usr/bin/env python3
"""
Script pour créer la table demande_stage avec la bonne structure
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from django.db import connection

def create_demande_table():
    """Créer la table demande_stage avec la bonne structure"""
    
    print("🔧 Création de la table demande_stage avec la bonne structure")
    print("=" * 70)
    
    try:
        with connection.cursor() as cursor:
            # Créer la table avec la structure correcte
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
            print(f"✅ Table demande_stage créée avec succès")
            
            # Vérifier la structure
            cursor.execute("DESCRIBE demande_stage")
            columns = cursor.fetchall()
            
            print(f"\n📋 Structure de la table créée:")
            for col in columns:
                print(f"   - {col[0]}: {col[1]} | Null: {col[2]} | Default: {col[4]}")
            
            return True
            
    except Exception as e:
        print(f"❌ Erreur lors de la création: {e}")
        return False

if __name__ == '__main__':
    success = create_demande_table()
    if success:
        print(f"\n✅ Table demande_stage créée avec succès!")
        print(f"🚀 Le modèle Demande peut maintenant fonctionner correctement")
    else:
        print(f"\n❌ Échec de la création de la table")
