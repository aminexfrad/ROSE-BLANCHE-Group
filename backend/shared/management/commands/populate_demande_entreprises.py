"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from demande_service.models import Demande, DemandeOffre
from shared.models import Entreprise


class Command(BaseCommand):
    help = 'Populate entreprise field for existing demandes based on their offers'

    def handle(self, *args, **options):
        self.stdout.write('Starting to populate entreprise field for demandes...')
        
        with transaction.atomic():
            # Get all demandes without entreprise
            demandes_without_entreprise = Demande.objects.filter(entreprise__isnull=True)
            self.stdout.write(f'Found {demandes_without_entreprise.count()} demandes without entreprise')
            
            updated_count = 0
            for demande in demandes_without_entreprise:
                # Try to get entreprise from the first offer
                first_offre = demande.offres.first()
                if first_offre and first_offre.entreprise:
                    demande.entreprise = first_offre.entreprise
                    demande.save(update_fields=['entreprise'])
                    updated_count += 1
                    self.stdout.write(f'Updated demande {demande.id} with entreprise: {first_offre.entreprise.nom}')
                else:
                    self.stdout.write(f'Demande {demande.id} has no offers or offers without entreprise')
            
            # Update DemandeOffre records
            self.stdout.write('Updating DemandeOffre records...')
            demande_offres_without_entreprise = DemandeOffre.objects.filter(entreprise__isnull=True)
            self.stdout.write(f'Found {demande_offres_without_entreprise.count()} DemandeOffre records without entreprise')
            
            offre_updated_count = 0
            for demande_offre in demande_offres_without_entreprise:
                if demande_offre.offre and demande_offre.offre.entreprise:
                    demande_offre.entreprise = demande_offre.offre.entreprise
                    demande_offre.save(update_fields=['entreprise'])
                    offre_updated_count += 1
                    self.stdout.write(f'Updated DemandeOffre {demande_offre.id} with entreprise: {demande_offre.offre.entreprise.nom}')
                else:
                    self.stdout.write(f'DemandeOffre {demande_offre.id} has no offre or offre without entreprise')
            
            self.stdout.write(self.style.SUCCESS('Successfully populated entreprise fields!'))
            self.stdout.write(f'Updated {updated_count} demandes')
            self.stdout.write(f'Updated {offre_updated_count} DemandeOffre records')
            
            # Show final statistics
            total_demandes = Demande.objects.count()
            demandes_with_entreprise = Demande.objects.filter(entreprise__isnull=False).count()
            total_demande_offres = DemandeOffre.objects.count()
            demande_offres_with_entreprise = DemandeOffre.objects.filter(entreprise__isnull=False).count()
            
            self.stdout.write(f'\nFinal Statistics:')
            self.stdout.write(f'Demandes: {demandes_with_entreprise}/{total_demandes} have entreprise')
            self.stdout.write(f'DemandeOffres: {demande_offres_with_entreprise}/{total_demande_offres} have entreprise')
