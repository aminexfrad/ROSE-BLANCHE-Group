#!/usr/bin/env python3
"""
Test script pour vérifier que la population automatique des champs entreprise et référence PFE fonctionne
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from demande_service.models import Demande, DemandeOffre
from shared.models import OffreStage, Entreprise

def test_demande_auto_population():
    """Test de la population automatique des champs entreprise et PFE reference"""
    
    print("🧪 Test de la population automatique des champs Demande")
    print("=" * 60)
    
    try:
        # 1. Vérifier l'état actuel des demandes
        print("\n1. État actuel des demandes:")
        total_demandes = Demande.objects.count()
        demandes_with_entreprise = Demande.objects.filter(entreprise__isnull=False).count()
        demandes_with_pfe_ref = Demande.objects.filter(pfe_reference__isnull=False).exclude(pfe_reference='').count()
        
        print(f"   📊 Total demandes: {total_demandes}")
        print(f"   🏢 Demandes avec entreprise: {demandes_with_entreprise}/{total_demandes}")
        print(f"   📋 Demandes avec référence PFE: {demandes_with_pfe_ref}/{total_demandes}")
        
        # 2. Vérifier les offres disponibles
        print("\n2. Offres disponibles:")
        total_offres = OffreStage.objects.count()
        offres_with_entreprise = OffreStage.objects.filter(entreprise__isnull=False).count()
        offres_with_ref = OffreStage.objects.filter(reference__isnull=False).exclude(reference='Inconnu').count()
        
        print(f"   📊 Total offres: {total_offres}")
        print(f"   🏢 Offres avec entreprise: {offres_with_entreprise}/{total_offres}")
        print(f"   📋 Offres avec référence: {offres_with_ref}/{total_offres}")
        
        # 3. Vérifier les relations DemandeOffre
        print("\n3. Relations DemandeOffre:")
        total_demande_offres = DemandeOffre.objects.count()
        demande_offres_with_entreprise = DemandeOffre.objects.filter(entreprise__isnull=False).count()
        
        print(f"   📊 Total relations: {total_demande_offres}")
        print(f"   🏢 Relations avec entreprise: {demande_offres_with_entreprise}/{total_demande_offres}")
        
        # 4. Test de la population automatique
        print("\n4. Test de la population automatique:")
        
        # Trouver une demande sans entreprise qui a des offres
        demande_to_test = Demande.objects.filter(
            entreprise__isnull=True,
            offres__isnull=False
        ).first()
        
        if demande_to_test:
            print(f"   🔍 Test avec demande {demande_to_test.id}: {demande_to_test.prenom} {demande_to_test.nom}")
            print(f"      - Entreprise actuelle: {demande_to_test.entreprise}")
            print(f"      - Référence PFE actuelle: {demande_to_test.pfe_reference}")
            print(f"      - Nombre d'offres: {demande_to_test.offres.count()}")
            
            # Vérifier la première offre
            first_offre = demande_to_test.offres.first()
            if first_offre:
                print(f"      - Première offre: {first_offre.reference} - {first_offre.entreprise}")
                
                # Déclencher la mise à jour
                print(f"      - Déclenchement de la mise à jour...")
                demande_to_test.update_fields_from_offres()
                
                # Recharger la demande
                demande_to_test.refresh_from_db()
                print(f"      - Après mise à jour:")
                print(f"        * Entreprise: {demande_to_test.entreprise}")
                print(f"        * Référence PFE: {demande_to_test.pfe_reference}")
                
                if demande_to_test.entreprise:
                    print(f"        ✅ Entreprise mise à jour: {demande_to_test.entreprise.nom}")
                else:
                    print(f"        ❌ Entreprise toujours vide")
                
                if demande_to_test.pfe_reference and demande_to_test.pfe_reference != '':
                    print(f"        ✅ Référence PFE mise à jour: {demande_to_test.pfe_reference}")
                else:
                    print(f"        ❌ Référence PFE toujours vide")
        else:
            print(f"   ℹ️  Aucune demande sans entreprise trouvée pour le test")
        
        # 5. Test des signaux
        print("\n5. Test des signaux:")
        
        # Créer une nouvelle relation DemandeOffre pour tester les signaux
        test_demande = Demande.objects.filter(offres__isnull=False).first()
        test_offre = OffreStage.objects.filter(entreprise__isnull=False).first()
        
        if test_demande and test_offre:
            print(f"   🔍 Test des signaux avec:")
            print(f"      - Demande: {test_demande.id} (entreprise: {test_demande.entreprise})")
            print(f"      - Offre: {test_offre.reference} (entreprise: {test_offre.entreprise})")
            
            # Créer une nouvelle relation (ceci devrait déclencher le signal)
            try:
                demande_offre = DemandeOffre.objects.create(
                    demande=test_demande,
                    offre=test_offre,
                    status='pending'
                )
                print(f"      ✅ DemandeOffre créée: {demande_offre.id}")
                
                # Vérifier si les champs ont été mis à jour
                test_demande.refresh_from_db()
                print(f"      - Après création DemandeOffre:")
                print(f"        * Entreprise: {test_demande.entreprise}")
                print(f"        * Référence PFE: {test_demande.pfe_reference}")
                
                # Nettoyer
                demande_offre.delete()
                print(f"      🧹 DemandeOffre de test supprimée")
                
            except Exception as e:
                print(f"      ❌ Erreur lors de la création: {str(e)}")
        else:
            print(f"   ℹ️  Impossible de tester les signaux - données insuffisantes")
        
        # 6. Résumé et recommandations
        print("\n" + "=" * 60)
        print("📋 RÉSUMÉ ET RECOMMANDATIONS")
        print("=" * 60)
        
        # Recompter après les tests
        final_demandes_with_entreprise = Demande.objects.filter(entreprise__isnull=False).count()
        final_demandes_with_pfe_ref = Demande.objects.filter(pfe_reference__isnull=False).exclude(pfe_reference='').count()
        
        print(f"✅ Demandes avec entreprise: {final_demandes_with_entreprise}/{total_demandes}")
        print(f"✅ Demandes avec référence PFE: {final_demandes_with_pfe_ref}/{total_demandes}")
        
        if final_demandes_with_entreprise < total_demandes:
            print(f"\n⚠️  {total_demandes - final_demandes_with_entreprise} demandes n'ont toujours pas d'entreprise")
            print(f"   Causes possibles:")
            print(f"   - Les offres sélectionnées n'ont pas d'entreprise assignée")
            print(f"   - Les signaux ne fonctionnent pas correctement")
            print(f"   - Problème dans la logique de mise à jour")
        
        if final_demandes_with_pfe_ref < total_demandes:
            print(f"\n⚠️  {total_demandes - final_demandes_with_pfe_ref} demandes n'ont toujours pas de référence PFE")
            print(f"   Causes possibles:")
            print(f"   - Les offres sélectionnées n'ont pas de référence valide")
            print(f"   - Les références sont 'Inconnu' (valeur par défaut)")
            print(f"   - Problème dans la logique de mise à jour")
        
        if final_demandes_with_entreprise == total_demandes and final_demandes_with_pfe_ref == total_demandes:
            print(f"\n🎉 TOUTES LES DEMANDES ONT ÉTÉ CORRECTEMENT REMPLIES!")
            print(f"   Le système de population automatique fonctionne parfaitement.")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERREUR LORS DES TESTS: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚀 Démarrage des tests de population automatique...")
    success = test_demande_auto_population()
    
    if success:
        print(f"\n✅ Tests terminés avec succès!")
        sys.exit(0)
    else:
        print(f"\n❌ Tests terminés avec des erreurs!")
        sys.exit(1)
