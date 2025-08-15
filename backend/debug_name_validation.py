#!/usr/bin/env python3
"""
Script pour diagnostiquer et corriger le problème de validation des noms
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

def debug_name_validation():
    """Diagnostic de la validation des noms"""
    
    print("🔍 Diagnostic de la validation des noms")
    print("=" * 50)
    
    # 1. Tester le pattern actuel
    print("\n📋 Pattern actuel:")
    current_pattern = r'^[a-zA-ZÀ-ÿ\s\-\.]{2,50}$'
    print(f"   Regex: {current_pattern}")
    
    # 2. Tester avec différents types de noms
    test_names = [
        # Noms français courants
        "Martin",
        "Dupont",
        "Bernard",
        "Thomas",
        "Robert",
        "Richard",
        "Petit",
        "Durand",
        "Leroy",
        "Moreau",
        
        # Noms avec accents
        "François",
        "André",
        "René",
        "José",
        "Thérèse",
        "Cécile",
        "Émilie",
        "Étienne",
        "Hélène",
        "Béatrice",
        
        # Noms composés
        "Jean-Pierre",
        "Marie-Claire",
        "Pierre-Louis",
        "Anne-Marie",
        "Jean-Paul",
        
        # Noms avec espaces
        "Van der Berg",
        "De la Cruz",
        "Le Blanc",
        "Du Pont",
        
        # Noms internationaux
        "O'Connor",
        "McDonald",
        "O'Brien",
        "D'Angelo",
        "St-Pierre",
        
        # Noms avec apostrophes
        "L'Évêque",
        "D'Artagnan",
        "O'Reilly",
        
        # Noms avec points
        "St. John",
        "St. Pierre",
        
        # Noms avec tirets
        "Jean-Baptiste",
        "Marie-Louise",
        "Pierre-Emmanuel",
        
        # Noms courts et longs
        "Li",
        "Wu",
        "Nguyen",
        "Rodriguez",
        "Constantinopoulos",
        
        # Noms avec caractères spéciaux
        "José María",
        "Jean-François",
        "Marie-Thérèse",
        "Pierre-André",
    ]
    
    print(f"\n🧪 Test de {len(test_names)} noms...")
    
    # Résultats
    valid_names = []
    invalid_names = []
    
    for name in test_names:
        try:
            result = SecurityValidator.validate_name(name, "nom")
            valid_names.append((name, result))
            print(f"   ✅ {name} -> {result}")
        except ValidationError as e:
            invalid_names.append((name, str(e)))
            print(f"   ❌ {name} -> {e}")
    
    # 3. Analyser les résultats
    print(f"\n📊 Résultats:")
    print(f"   - Noms valides: {len(valid_names)}")
    print(f"   - Noms invalides: {len(invalid_names)}")
    
    if invalid_names:
        print(f"\n❌ Noms rejetés:")
        for name, error in invalid_names:
            print(f"   - {name}: {error}")
    
    # 4. Identifier les problèmes du pattern
    print(f"\n🔍 Analyse du pattern:")
    
    # Tester le pattern directement
    pattern = re.compile(current_pattern)
    
    # Exemples de noms qui échouent
    failing_examples = []
    for name in test_names:
        if not pattern.match(name):
            failing_examples.append(name)
    
    if failing_examples:
        print(f"   - Noms rejetés par le regex: {len(failing_examples)}")
        for name in failing_examples[:10]:  # Afficher les 10 premiers
            print(f"     * {name}")
        if len(failing_examples) > 10:
            print(f"     ... et {len(failing_examples) - 10} autres")
    
    # 5. Proposer une correction
    print(f"\n💡 Proposition de correction:")
    
    # Nouveau pattern plus permissif
    new_pattern = r'^[a-zA-ZÀ-ÿ\u00C0-\u017F\u0180-\u024F\u1E00-\u1EFF\s\-\'\.]{2,50}$'
    print(f"   Nouveau regex: {new_pattern}")
    
    # Tester le nouveau pattern
    new_pattern_compiled = re.compile(new_pattern)
    new_valid_count = 0
    
    for name in test_names:
        if new_pattern_compiled.match(name):
            new_valid_count += 1
    
    print(f"   - Noms acceptés avec le nouveau pattern: {new_valid_count}/{len(test_names)}")
    
    # 6. Tester la validation avec le nouveau pattern
    print(f"\n🧪 Test avec le nouveau pattern...")
    
    # Sauvegarder l'ancien pattern
    old_pattern = SecurityValidator.NAME_PATTERN
    
    # Remplacer temporairement le pattern
    SecurityValidator.NAME_PATTERN = new_pattern_compiled
    
    new_valid_names = []
    new_invalid_names = []
    
    for name in test_names:
        try:
            result = SecurityValidator.validate_name(name, "nom")
            new_valid_names.append((name, result))
            print(f"   ✅ {name} -> {result}")
        except ValidationError as e:
            new_invalid_names.append((name, str(e)))
            print(f"   ❌ {name} -> {e}")
    
    # Restaurer l'ancien pattern
    SecurityValidator.NAME_PATTERN = old_pattern
    
    # 7. Résumé des améliorations
    print(f"\n📈 Améliorations:")
    print(f"   - Avant: {len(valid_names)}/{len(test_names)} noms acceptés")
    print(f"   - Après: {len(new_valid_names)}/{len(test_names)} noms acceptés")
    print(f"   - Gain: +{len(new_valid_names) - len(valid_names)} noms acceptés")
    
    # 8. Recommandations
    print(f"\n🎯 Recommandations:")
    if len(new_valid_names) > len(valid_names):
        print(f"   ✅ Le nouveau pattern améliore significativement la validation")
        print(f"   📝 Mettre à jour le SecurityValidator avec le nouveau pattern")
        print(f"   🔒 Maintenir la sécurité tout en améliorant l'expérience utilisateur")
    else:
        print(f"   ⚠️ Le nouveau pattern n'améliore pas significativement la validation")
        print(f"   🔍 Analyser plus en détail les cas d'échec")
    
    return len(new_valid_names) > len(valid_names)

if __name__ == '__main__':
    success = debug_name_validation()
    if success:
        print(f"\n✅ La correction du pattern de validation des noms est recommandée!")
    else:
        print(f"\n❌ Aucune amélioration significative détectée")
