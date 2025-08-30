"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from datetime import date, timedelta
from shared.models import Entreprise, Stage
from auth_service.models import User
from demande_service.models import Demande


class Command(BaseCommand):
    help = 'Create test stagiaires for KPI evaluation testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--entreprise',
            type=str,
            help='Nom de l\'entreprise pour créer les stagiaires',
            default='Rose Blanche Group'
        )
        parser.add_argument(
            '--count',
            type=int,
            help='Nombre de stagiaires à créer',
            default=5
        )

    def handle(self, *args, **options):
        entreprise_name = options['entreprise']
        count = options['count']
        
        self.stdout.write(f'Creating {count} test stagiaires for {entreprise_name}...')
        
        with transaction.atomic():
            # Get or create the entreprise
            entreprise, created = Entreprise.objects.get_or_create(
                nom=entreprise_name,
                defaults={
                    'description': f'Entreprise de test pour {entreprise_name}',
                    'secteur_activite': 'Technologie',
                    'ville': 'Tunis',
                    'pays': 'Tunisie',
                    'is_active': True
                }
            )
            
            if created:
                self.stdout.write(f'Created entreprise: {entreprise.nom}')
            else:
                self.stdout.write(f'Found existing entreprise: {entreprise.nom}')
            
            # Sample stagiaires data
            stagiaires_data = [
                {
                    'nom': 'Benali',
                    'prenom': 'Ahmed',
                    'email': 'ahmed.benali@test.com',
                    'specialite': 'Développement Web',
                    'institut': 'ESPRIT'
                },
                {
                    'nom': 'Zahra',
                    'prenom': 'Fatima',
                    'email': 'fatima.zahra@test.com',
                    'specialite': 'Data Science',
                    'institut': 'INSAT'
                },
                {
                    'nom': 'Mansouri',
                    'prenom': 'Karim',
                    'email': 'karim.mansouri@test.com',
                    'specialite': 'DevOps',
                    'institut': 'ENIT'
                },
                {
                    'nom': 'Alami',
                    'prenom': 'Sara',
                    'email': 'sara.alami@test.com',
                    'specialite': 'Développement Mobile',
                    'institut': 'ISG'
                },
                {
                    'nom': 'Tazi',
                    'prenom': 'Hassan',
                    'email': 'hassan.tazi@test.com',
                    'specialite': 'Génie Civil',
                    'institut': 'ENIT'
                }
            ]
            
            created_count = 0
            for i, stagiaire_data in enumerate(stagiaires_data[:count]):
                # Check if stagiaire already exists
                existing_stagiaire = User.objects.filter(email=stagiaire_data['email']).first()
                if existing_stagiaire:
                    self.stdout.write(f'Stagiaire {stagiaire_data["prenom"]} {stagiaire_data["nom"]} already exists')
                    continue
                
                # Create stagiaire user
                stagiaire = User.objects.create_user(
                    email=stagiaire_data['email'],
                    password='stagiaire123',
                    nom=stagiaire_data['nom'],
                    prenom=stagiaire_data['prenom'],
                    role='stagiaire',
                    entreprise=entreprise,
                    telephone=f'+216 9{str(i+1).zfill(8)}',
                    institut=stagiaire_data['institut'],
                    specialite=stagiaire_data['specialite']
                )
                
                # Create demande
                demande = Demande.objects.create(
                    nom=stagiaire.nom,
                    prenom=stagiaire.prenom,
                    email=stagiaire.email,
                    telephone=stagiaire.telephone,
                    institut=stagiaire.institut,
                    specialite=stagiaire.specialite,
                    type_stage='Stage PFE',
                    niveau='Bac+4',
                    date_debut=timezone.now().date(),
                    date_fin=(timezone.now() + timedelta(days=90)).date(),
                    stage_binome=False,
                    status='approved',
                    user_created=stagiaire,
                    entreprise=entreprise
                )
                
                # Create stage
                stage = Stage.objects.create(
                    demande=demande,
                    stagiaire=stagiaire,
                    title=f"Stage {stagiaire.prenom} {stagiaire.nom}",
                    description=f"Stage de {stagiaire.specialite}",
                    company_entreprise=entreprise,
                    company_name=entreprise.nom,
                    location="Tunis",
                    start_date=demande.date_debut,
                    end_date=demande.date_fin,
                    status='active',
                    progress=30 + (i * 10)  # Different progress for each stagiaire
                )
                
                created_count += 1
                self.stdout.write(f'Created stagiaire: {stagiaire.prenom} {stagiaire.nom} ({stagiaire.email})')
                self.stdout.write(f'  - Stage: {stage.title}')
                self.stdout.write(f'  - Progress: {stage.progress}%')
            
            self.stdout.write(self.style.SUCCESS(f'Successfully created {created_count} test stagiaires!'))
            self.stdout.write(f'Entreprise: {entreprise.nom}')
            self.stdout.write(f'Total stagiaires in company: {User.objects.filter(role="stagiaire", entreprise=entreprise).count()}')
