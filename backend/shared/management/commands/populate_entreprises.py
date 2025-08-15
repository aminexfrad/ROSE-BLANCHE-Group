"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from shared.models import Entreprise, Stage, OffreStage
from auth_service.models import User


class Command(BaseCommand):
    help = 'Populate Entreprise model with sample data and link existing records'

    def handle(self, *args, **options):
        self.stdout.write('Starting to populate entreprises...')
        
        with transaction.atomic():
            # Create sample companies
            entreprises = []
            
            # Rose Blanche Group (from existing data)
            rose_blanche, created = Entreprise.objects.get_or_create(
                nom='Rose Blanche Group',
                defaults={
                    'description': 'Entreprise leader dans le secteur agricole et agroalimentaire',
                    'secteur_activite': 'Agriculture et Agroalimentaire',
                    'ville': 'Casablanca',
                    'pays': 'Maroc',
                    'telephone': '+212 5 22 30 00 00',
                    'email': 'contact@roseblanche.ma',
                    'site_web': 'https://www.roseblanche.ma',
                    'is_active': True
                }
            )
            entreprises.append(rose_blanche)
            if created:
                self.stdout.write(f'Created entreprise: {rose_blanche.nom}')
            else:
                self.stdout.write(f'Found existing entreprise: {rose_blanche.nom}')
            
            # Create additional sample companies
            sample_companies = [
                {
                    'nom': 'TechMaroc Solutions',
                    'description': 'Entreprise spécialisée dans le développement de solutions technologiques innovantes',
                    'secteur_activite': 'Technologie et Développement',
                    'ville': 'Rabat',
                    'pays': 'Maroc',
                    'telephone': '+212 5 37 70 00 00',
                    'email': 'contact@techmaroc.ma',
                    'site_web': 'https://www.techmaroc.ma'
                },
                {
                    'nom': 'GreenEnergy Maroc',
                    'description': 'Entreprise leader dans les énergies renouvelables et le développement durable',
                    'secteur_activite': 'Énergies Renouvelables',
                    'ville': 'Marrakech',
                    'pays': 'Maroc',
                    'telephone': '+212 5 24 30 00 00',
                    'email': 'info@greenenergy.ma',
                    'site_web': 'https://www.greenenergy.ma'
                },
                {
                    'nom': 'FinancePlus',
                    'description': 'Institution financière spécialisée dans le financement des PME',
                    'secteur_activite': 'Finance et Banque',
                    'ville': 'Casablanca',
                    'pays': 'Maroc',
                    'telephone': '+212 5 22 40 00 00',
                    'email': 'contact@financeplus.ma',
                    'site_web': 'https://www.financeplus.ma'
                }
            ]
            
            for company_data in sample_companies:
                entreprise, created = Entreprise.objects.get_or_create(
                    nom=company_data['nom'],
                    defaults={
                        **company_data,
                        'is_active': True
                    }
                )
                entreprises.append(entreprise)
                if created:
                    self.stdout.write(f'Created entreprise: {entreprise.nom}')
                else:
                    self.stdout.write(f'Found existing entreprise: {entreprise.nom}')
            
            # Link existing stages to companies
            self.stdout.write('Linking existing stages to companies...')
            
            # Get stages without company_entreprise
            stages_without_company = Stage.objects.filter(company_entreprise__isnull=True)
            
            for stage in stages_without_company:
                # Try to match by company name
                company_name = stage.company_name or stage.company if hasattr(stage, 'company') else None
                
                if company_name:
                    # Try to find matching company
                    matching_company = None
                    for entreprise in entreprises:
                        if entreprise.nom.lower() in company_name.lower() or company_name.lower() in entreprise.nom.lower():
                            matching_company = entreprise
                            break
                    
                    if matching_company:
                        stage.company_entreprise = matching_company
                        stage.save()
                        self.stdout.write(f'Linked stage "{stage.title}" to company "{matching_company.nom}"')
                    else:
                        # Create a new company for this stage
                        new_company = Entreprise.objects.create(
                            nom=company_name,
                            description=f'Entreprise créée automatiquement pour le stage: {stage.title}',
                            secteur_activite='À définir',
                            ville='À définir',
                            pays='Maroc',
                            is_active=True
                        )
                        stage.company_entreprise = new_company
                        stage.save()
                        entreprises.append(new_company)
                        self.stdout.write(f'Created new company "{new_company.nom}" for stage "{stage.title}"')
                else:
                    # Assign to Rose Blanche Group as default
                    stage.company_entreprise = rose_blanche
                    stage.save()
                    self.stdout.write(f'Assigned stage "{stage.title}" to default company "{rose_blanche.nom}"')
            
            # Link existing offres to companies
            self.stdout.write('Linking existing offres to companies...')
            
            offres_without_company = OffreStage.objects.filter(entreprise__isnull=True)
            
            for offre in offres_without_company:
                # Assign to Rose Blanche Group as default
                offre.entreprise = rose_blanche
                offre.save()
                self.stdout.write(f'Assigned offre "{offre.title}" to default company "{rose_blanche.nom}"')
            
            # Create sample RH users for each company
            self.stdout.write('Creating sample RH users for companies...')
            
            for entreprise in entreprises:
                # Check if company already has RH users
                existing_rh = User.objects.filter(role='rh', entreprise=entreprise).first()
                
                if not existing_rh:
                    # Create a sample RH user
                    rh_user = User.objects.create_user(
                        email=f'rh@{entreprise.nom.lower().replace(" ", "").replace(".", "")}.ma',
                        password='rh123456',
                        nom=f'Responsable RH {entreprise.nom}',
                        prenom='Manager',
                        role='rh',
                        entreprise=entreprise,
                        telephone='+212 6 00 00 000',
                        departement='Ressources Humaines'
                    )
                    self.stdout.write(f'Created RH user for {entreprise.nom}: {rh_user.email}')
                else:
                    self.stdout.write(f'RH user already exists for {entreprise.nom}: {existing_rh.email}')
            
            self.stdout.write(self.style.SUCCESS('Successfully populated entreprises and linked existing records!'))
            self.stdout.write(f'Total companies created: {len(entreprises)}')
            self.stdout.write(f'Total stages linked: {Stage.objects.filter(company_entreprise__isnull=False).count()}')
            self.stdout.write(f'Total offres linked: {OffreStage.objects.filter(entreprise__isnull=False).count()}')
            self.stdout.write(f'Total RH users created: {User.objects.filter(role="rh").count()}')
