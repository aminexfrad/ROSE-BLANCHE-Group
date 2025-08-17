#!/usr/bin/env python3
"""
Test script pour vérifier que l'admin des offres fonctionne
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stagebloom.settings')
django.setup()

from shared.models import OffreStage, Entreprise
from demande_service.models import DemandeOffre

def test_admin_functionality():
    """Tester la fonctionnalité de l'admin"""
    
    print("🧪 Test de l'admin des offres...")
    
    # 1. Vérifier l'état actuel
    total_offres = OffreStage.objects.count()
    total_demande_offres = DemandeOffre.objects.count()
    
    print(f"📊 État actuel:")
    print(f"   - Offres: {total_offres}")
    print(f"   - Relations DemandeOffre: {total_demande_offres}")
    
    if total_offres == 0:
        print("✅ Aucune offre à tester!")
        return
    
    # 2. Tester la suppression d'une offre
    print(f"\n🧪 Test de suppression d'offre...")
    
    # Prendre la première offre
    first_offre = OffreStage.objects.first()
    print(f"   - Offre à tester: {first_offre.reference} - {first_offre.title}")
    
    # Compter les relations
    relations_count = DemandeOffre.objects.filter(offre=first_offre).count()
    print(f"   - Relations trouvées: {relations_count}")
    
    # 3. Tester la suppression
    try:
        print("   - Tentative de suppression...")
        first_offre.delete()
        print("   ✅ Suppression réussie!")
        
        # Vérifier
        remaining_offres = OffreStage.objects.count()
        remaining_relations = DemandeOffre.objects.count()
        
        print(f"   - Offres restantes: {remaining_offres}")
        print(f"   - Relations restantes: {remaining_relations}")
        
    except Exception as e:
        print(f"   ❌ Erreur lors de la suppression: {e}")
    
    print("\n✅ Test terminé!")

if __name__ == "__main__":
    test_admin_functionality()
