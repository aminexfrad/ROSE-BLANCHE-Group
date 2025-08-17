from django.core.management.base import BaseCommand
from django.db import transaction
from shared.models import OffreStage
from demande_service.models import DemandeOffre

class Command(BaseCommand):
    help = 'Nettoyer toutes les offres de stage et leurs relations'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Forcer la suppression sans confirmation',
        )

    def handle(self, *args, **options):
        # Compter les éléments
        total_offres = OffreStage.objects.count()
        total_demande_offres = DemandeOffre.objects.count()
        
        if total_offres == 0:
            self.stdout.write(
                self.style.SUCCESS('✅ Aucune offre à supprimer!')
            )
            return
        
        self.stdout.write(f"📊 État actuel:")
        self.stdout.write(f"   - Offres: {total_offres}")
        self.stdout.write(f"   - Relations DemandeOffre: {total_demande_offres}")
        
        # Demander confirmation sauf si --force
        if not options['force']:
            self.stdout.write(
                self.style.WARNING(f"\n⚠️  ATTENTION: Vous êtes sur le point de supprimer {total_offres} offres!")
            )
            self.stdout.write("   Cela supprimera aussi toutes les relations avec les demandes.")
            
            confirmation = input("   Tapez 'OUI' pour confirmer: ")
            if confirmation != "OUI":
                self.stdout.write(
                    self.style.ERROR('❌ Opération annulée')
                )
                return
        
        # Nettoyer avec transaction
        try:
            with transaction.atomic():
                self.stdout.write("\n🧹 Suppression des relations DemandeOffre...")
                DemandeOffre.objects.all().delete()
                self.stdout.write(
                    self.style.SUCCESS(f"   ✅ {total_demande_offres} relations supprimées")
                )
                
                self.stdout.write("🧹 Suppression des offres...")
                OffreStage.objects.all().delete()
                self.stdout.write(
                    self.style.SUCCESS(f"   ✅ {total_offres} offres supprimées")
                )
                
                self.stdout.write(
                    self.style.SUCCESS("\n✅ Nettoyage terminé avec succès!")
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Erreur lors du nettoyage: {e}")
            )
            self.stdout.write("🔒 Transaction annulée - aucune donnée n'a été supprimée")
            return
        
        # Vérifier le résultat
        remaining_offres = OffreStage.objects.count()
        remaining_demande_offres = DemandeOffre.objects.count()
        
        self.stdout.write(f"\n📊 État après nettoyage:")
        self.stdout.write(f"   - Offres restantes: {remaining_offres}")
        self.stdout.write(f"   - Relations restantes: {remaining_demande_offres}")
        
        if remaining_offres == 0 and remaining_demande_offres == 0:
            self.stdout.write(
                self.style.SUCCESS("🎉 Toutes les offres ont été supprimées avec succès!")
            )
        else:
            self.stdout.write(
                self.style.WARNING("⚠️  Certaines offres n'ont pas pu être supprimées")
            )
