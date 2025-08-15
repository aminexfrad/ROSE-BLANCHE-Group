#!/usr/bin/env python3
"""
Script pour corriger les demandes qui n'ont pas d'entreprise assignée
Assigne automatiquement l'entreprise à partir des offres sélectionnées
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from demande_service.models import Demande
from shared.models import OffreStage

def fix_demande_entreprise():
    """Corriger les demandes sans entreprise"""
    
    print("🔧 Correction des demandes sans entreprise")
    print("=" * 60)
    
    # 1. Identifier les demandes sans entreprise
    demandes_sans_entreprise = Demande.objects.filter(entreprise__isnull=True)
    print(f"📋 Demandes sans entreprise: {demandes_sans_entreprise.count()}")
    
    if demandes_sans_entreprise.count() == 0:
        print("✅ Toutes les demandes ont déjà une entreprise assignée")
        return True
    
    # 2. Traiter chaque demande
    demandes_corrigees = 0
    
    for demande in demandes_sans_entreprise:
        print(f"\n🔍 Traitement de la demande {demande.id}: {demande.prenom} {demande.nom}")
        print(f"   - Email: {demande.email}")
        print(f"   - Offres: {demande.offres.count()}")
        
        # Vérifier si la demande a des offres
        if demande.offres.exists():
            # Prendre la première offre pour déterminer l'entreprise
            premiere_offre = demande.offres.first()
            entreprise = premiere_offre.entreprise
            
            if entreprise:
                # Assigner l'entreprise à la demande
                demande.entreprise = entreprise
                demande.save()
                
                print(f"   ✅ Entreprise assignée: {entreprise.nom}")
                demandes_corrigees += 1
                
                # Afficher les détails de l'offre
                print(f"   📝 Offre: {premiere_offre.title}")
                print(f"   🏢 Entreprise: {entreprise.nom} ({entreprise.secteur_activite})")
                
            else:
                print(f"   ❌ L'offre n'a pas d'entreprise")
                
        else:
            print(f"   ❌ Aucune offre associée à cette demande")
    
    # 3. Vérifier le résultat
    print(f"\n📊 Résumé de la correction:")
    print(f"   - Demandes traitées: {demandes_sans_entreprise.count()}")
    print(f"   - Demandes corrigées: {demandes_corrigees}")
    
    # Vérifier s'il reste des demandes sans entreprise
    demandes_restantes = Demande.objects.filter(entreprise__isnull=True).count()
    print(f"   - Demandes restantes sans entreprise: {demandes_restantes}")
    
    if demandes_restantes == 0:
        print(f"   ✅ Toutes les demandes ont maintenant une entreprise!")
    else:
        print(f"   ⚠️ {demandes_restantes} demandes n'ont toujours pas d'entreprise")
    
    # 4. Afficher quelques exemples de demandes corrigées
    if demandes_corrigees > 0:
        print(f"\n📋 Exemples de demandes corrigées:")
        demandes_corrigees_objects = Demande.objects.filter(entreprise__isnull=False).order_by('-updated_at')[:3]
        
        for demande in demandes_corrigees_objects:
            print(f"   - {demande.prenom} {demande.nom} -> {demande.entreprise.nom}")
    
    return demandes_restantes == 0

if __name__ == '__main__':
    success = fix_demande_entreprise()
    if success:
        print(f"\n🎉 Correction terminée avec succès!")
        print(f"🚀 Les demandes devraient maintenant apparaître dans la page RH")
    else:
        print(f"\n⚠️ Correction partielle - Vérifiez les demandes restantes")
