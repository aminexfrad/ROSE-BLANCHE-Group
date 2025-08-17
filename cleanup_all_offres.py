#!/usr/bin/env python3
"""
Script sécurisé pour nettoyer toutes les offres de stage
Ce script supprime d'abord les relations, puis les offres
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stagebloom.settings')
django.setup()

from django.db import transaction
from shared.models import OffreStage
from demande_service.models import DemandeOffre, Demande

def cleanup_all_offres():
    """Nettoyer toutes les offres de stage de manière sécurisée"""
    
    print("🧹 Nettoyage des offres de stage...")
    
    # 1. Compter les éléments existants
    total_offres = OffreStage.objects.count()
    total_demande_offres = DemandeOffre.objects.count()
    total_demandes = Demande.objects.count()
    
    print(f"📊 État actuel:")
    print(f"   - Offres: {total_offres}")
    print(f"   - Relations DemandeOffre: {total_demande_offres}")
    print(f"   - Demandes: {total_demandes}")
    
    if total_offres == 0:
        print("✅ Aucune offre à supprimer!")
        return
    
    # 2. Demander confirmation
    print(f"\n⚠️  ATTENTION: Vous êtes sur le point de supprimer {total_offres} offres!")
    print("   Cela supprimera aussi toutes les relations avec les demandes.")
    
    confirmation = input("   Tapez 'OUI' pour confirmer: ")
    if confirmation != "OUI":
        print("❌ Opération annulée")
        return
    
    # 3. Nettoyer avec transaction pour la sécurité
    try:
        with transaction.atomic():
            print("\n🧹 Suppression des relations DemandeOffre...")
            DemandeOffre.objects.all().delete()
            print(f"   ✅ {total_demande_offres} relations supprimées")
            
            print("🧹 Suppression des offres...")
            OffreStage.objects.all().delete()
            print(f"   ✅ {total_offres} offres supprimées")
            
            print("\n✅ Nettoyage terminé avec succès!")
            
    except Exception as e:
        print(f"❌ Erreur lors du nettoyage: {e}")
        print("🔒 Transaction annulée - aucune donnée n'a été supprimée")
        return
    
    # 4. Vérifier le résultat
    remaining_offres = OffreStage.objects.count()
    remaining_demande_offres = DemandeOffre.objects.count()
    
    print(f"\n📊 État après nettoyage:")
    print(f"   - Offres restantes: {remaining_offres}")
    print(f"   - Relations restantes: {remaining_demande_offres}")
    
    if remaining_offres == 0 and remaining_demande_offres == 0:
        print("🎉 Toutes les offres ont été supprimées avec succès!")
    else:
        print("⚠️  Certaines offres n'ont pas pu être supprimées")

if __name__ == "__main__":
    cleanup_all_offres()
