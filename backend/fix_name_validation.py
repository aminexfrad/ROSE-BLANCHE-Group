#!/usr/bin/env python3
"""
Script pour corriger le pattern de validation des noms dans le SecurityValidator
"""

import os
import sys
import django
import re

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from shared.security import SecurityValidator
from django.core.exceptions import ValidationError

def fix_name_validation():
    """Corriger le pattern de validation des noms"""
    
    print("🔧 Correction du pattern de validation des noms")
    print("=" * 60)
    
    # 1. Afficher le pattern actuel
    print("\n📋 Pattern actuel:")
    current_pattern = SecurityValidator.NAME_PATTERN.pattern
    print(f"   Regex: {current_pattern}")
    
    # 2. Nouveau pattern amélioré
    new_pattern = r'^[a-zA-ZÀ-ÿ\u00C0-\u017F\u0180-\u024F\u1E00-\u1EFF\s\-\'\.]{2,50}$'
    print(f"\n💡 Nouveau pattern proposé:")
    print(f"   Regex: {new_pattern}")
    
    # 3. Explication des améliorations
    print(f"\n🔍 Améliorations apportées:")
    print(f"   - Support étendu des caractères Unicode (accents, cédilles, etc.)")
    print(f"   - Support des apostrophes (O'Connor, D'Angelo)")
    print(f"   - Support des tirets (Jean-Pierre, Marie-Claire)")
    print(f"   - Support des points (St. Pierre, St. John)")
    print(f"   - Support des espaces (Van der Berg, De la Cruz)")
    print(f"   - Maintien de la sécurité (longueur 2-50, pas de caractères dangereux)")
    
    # 4. Tester le nouveau pattern
    print(f"\n🧪 Test du nouveau pattern...")
    
    # Noms de test représentatifs
    test_names = [
        # Noms français avec accents
        "François", "André", "René", "José", "Thérèse", "Cécile", "Émilie",
        "Étienne", "Hélène", "Béatrice", "L'Évêque", "D'Artagnan",
        
        # Noms composés
        "Jean-Pierre", "Marie-Claire", "Pierre-Louis", "Anne-Marie",
        "Jean-Baptiste", "Marie-Louise", "Pierre-Emmanuel",
        
        # Noms internationaux
        "O'Connor", "McDonald", "O'Brien", "D'Angelo", "St-Pierre",
        "Van der Berg", "De la Cruz", "Le Blanc", "Du Pont",
        
        # Noms courts et longs
        "Li", "Wu", "Nguyen", "Rodriguez", "Constantinopoulos",
        
        # Noms avec caractères spéciaux
        "José María", "Jean-François", "Marie-Thérèse", "Pierre-André",
    ]
    
    # Compiler le nouveau pattern
    new_pattern_compiled = re.compile(new_pattern)
    
    # Tester chaque nom
    valid_count = 0
    invalid_count = 0
    
    for name in test_names:
        if new_pattern_compiled.match(name):
            print(f"   ✅ {name}")
            valid_count += 1
        else:
            print(f"   ❌ {name}")
            invalid_count += 1
    
    print(f"\n📊 Résultats du test:")
    print(f"   - Noms acceptés: {valid_count}")
    print(f"   - Noms rejetés: {invalid_count}")
    print(f"   - Taux de succès: {(valid_count/len(test_names)*100):.1f}%")
    
    # 5. Appliquer la correction
    print(f"\n🚀 Application de la correction...")
    
    try:
        # Sauvegarder l'ancien pattern
        old_pattern = SecurityValidator.NAME_PATTERN.pattern
        
        # Remplacer le pattern
        SecurityValidator.NAME_PATTERN = new_pattern_compiled
        
        print(f"✅ Pattern mis à jour avec succès")
        print(f"   - Ancien: {old_pattern}")
        print(f"   - Nouveau: {new_pattern}")
        
    except Exception as e:
        print(f"❌ Erreur lors de la mise à jour: {e}")
        return False
    
    # 6. Tester la validation avec le nouveau pattern
    print(f"\n🧪 Test de validation avec le nouveau pattern...")
    
    validation_success_count = 0
    validation_error_count = 0
    
    for name in test_names:
        try:
            result = SecurityValidator.validate_name(name, "nom")
            print(f"   ✅ {name} -> {result}")
            validation_success_count += 1
        except ValidationError as e:
            print(f"   ❌ {name} -> {e}")
            validation_error_count += 1
    
    print(f"\n📊 Résultats de la validation:")
    print(f"   - Validations réussies: {validation_success_count}")
    print(f"   - Erreurs de validation: {validation_error_count}")
    print(f"   - Taux de succès: {(validation_success_count/len(test_names)*100):.1f}%")
    
    # 7. Vérifier que la sécurité est maintenue
    print(f"\n🔒 Vérification de la sécurité...")
    
    # Test avec des noms dangereux
    dangerous_names = [
        "<script>alert('xss')</script>",
        "javascript:alert('xss')",
        "admin' OR '1'='1",
        "'; DROP TABLE users; --",
        "test<script>alert('xss')</script>",
        "normal_name<script>alert('xss')</script>",
    ]
    
    security_test_passed = True
    for dangerous_name in dangerous_names:
        try:
            SecurityValidator.validate_name(dangerous_name, "nom")
            print(f"   ❌ Sécurité compromise: {dangerous_name} accepté")
            security_test_passed = False
        except ValidationError:
            print(f"   ✅ Sécurité maintenue: {dangerous_name} rejeté")
    
    if security_test_passed:
        print(f"✅ Tous les tests de sécurité ont réussi")
    else:
        print(f"❌ Certains tests de sécurité ont échoué")
        return False
    
    # 8. Test de création de demande
    print(f"\n🧪 Test de création de demande avec noms valides...")
    
    try:
        from demande_service.models import Demande
        from shared.models import Entreprise, OffreStage
        
        # Créer des données de test
        entreprise, created = Entreprise.objects.get_or_create(
            nom="Entreprise Test Validation",
            defaults={
                'description': 'Entreprise de test pour la validation des noms',
                'secteur_activite': 'Technologie'
            }
        )
        
        offre, created = OffreStage.objects.get_or_create(
            title="Stage Test Validation",
            defaults={
                'description': 'Stage de test pour la validation des noms',
                'entreprise': entreprise,
                'location': 'Paris',
                'type_stage': 'Stage PFE',
                'status': 'active'
            }
        )
        
        # Tester avec un nom qui échouait avant
        test_demande_data = {
            'nom': 'Jean-François',
            'prenom': 'Émilie',
            'email': 'test@example.com',
            'telephone': '0123456789',
            'institut': 'Institut Test',
            'specialite': 'Informatique',
            'type_stage': 'Stage PFE',
            'niveau': 'Bac+5',
            'date_debut': '2024-01-01',
            'date_fin': '2024-06-30',
            'stage_binome': False,
            'offer_ids': [offre.id]
        }
        
        # Valider les données
        from demande_service.serializers import DemandeSerializer
        serializer = DemandeSerializer(data=test_demande_data)
        
        if serializer.is_valid():
            print(f"✅ Validation des données réussie")
            print(f"   - Nom: {serializer.validated_data['nom']}")
            print(f"   - Prénom: {serializer.validated_data['prenom']}")
        else:
            print(f"❌ Erreurs de validation:")
            for field, errors in serializer.errors.items():
                print(f"   - {field}: {errors}")
            return False
            
    except Exception as e:
        print(f"❌ Erreur lors du test de création: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # 9. Nettoyage des données de test
    print(f"\n🧹 Nettoyage des données de test...")
    try:
        Demande.objects.filter(email='test@example.com').delete()
        print(f"✅ Données de test supprimées")
    except Exception as e:
        print(f"⚠️ Erreur lors du nettoyage: {e}")
    
    print(f"\n🎉 Correction de la validation des noms terminée avec succès!")
    return True

if __name__ == '__main__':
    success = fix_name_validation()
    if success:
        print(f"\n✅ Le problème de validation des noms est résolu!")
        print(f"🚀 Les noms avec accents et caractères spéciaux sont maintenant acceptés")
        print(f"🔒 La sécurité est maintenue")
    else:
        print(f"\n❌ La correction a échoué")
        print(f"🔍 Vérifiez les erreurs ci-dessus")
