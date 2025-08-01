"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta
from shared.models import OffreStage

class Command(BaseCommand):
    help = 'Create sample internship offers for testing'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample internship offers...')
        
        # Sample internship offers data
        offres_data = [
            {
                'titre': 'Développeur Full Stack',
                'entreprise': 'Rose Blanche Group',
                'description': 'Nous recherchons un stagiaire pour développer des applications web modernes avec React et Django.',
                'specialite': 'Informatique',
                'niveau': 'Bac+4',
                'localisation': 'Tunis',
                'duree': 6,
                'remuneration': 3000,
                'contact_nom': 'Ahmed Benali',
                'contact_email': 'ahmed.benali@roseblanche.com',
                'contact_telephone': '06 12 34 56 78',
                'is_featured': True,
                'status': 'open'
            },
            {
                'titre': 'Data Scientist',
                'entreprise': 'Rose Blanche Group',
                'description': 'Stage en science des données avec Python, machine learning et analyse de données.',
                'specialite': 'Informatique',
                'niveau': 'Bac+5',
                'localisation': 'Sfax',
                'duree': 4,
                'remuneration': 4000,
                'contact_nom': 'Fatima Zahra',
                'contact_email': 'fatima.zahra@roseblanche.com',
                'contact_telephone': '06 98 76 54 32',
                'is_featured': True,
                'status': 'open'
            },
            {
                'titre': 'Ingénieur DevOps',
                'entreprise': 'Rose Blanche Group',
                'description': 'Stage en DevOps avec Docker, Kubernetes et AWS.',
                'specialite': 'Informatique',
                'niveau': 'Bac+4',
                'localisation': 'Sousse',
                'duree': 5,
                'remuneration': 3500,
                'contact_nom': 'Karim Mansouri',
                'contact_email': 'karim.mansouri@roseblanche.com',
                'contact_telephone': '06 55 44 33 22',
                'is_featured': False,
                'status': 'open'
            },
            {
                'titre': 'Développeur Mobile',
                'entreprise': 'Rose Blanche Group',
                'description': 'Développement d\'applications mobiles avec React Native et Flutter.',
                'specialite': 'Informatique',
                'niveau': 'Bac+3',
                'localisation': 'Monastir',
                'duree': 3,
                'remuneration': 2500,
                'contact_nom': 'Sara Alami',
                'contact_email': 'sara.alami@roseblanche.com',
                'contact_telephone': '06 11 22 33 44',
                'is_featured': False,
                'status': 'open'
            },
            {
                'titre': 'Ingénieur Civil',
                'entreprise': 'Rose Blanche Group',
                'description': 'Stage en génie civil avec AutoCAD et gestion de projets de construction.',
                'specialite': 'Génie Civil',
                'niveau': 'Bac+4',
                'localisation': 'Hammamet',
                'duree': 6,
                'remuneration': 3000,
                'contact_nom': 'Hassan Tazi',
                'contact_email': 'hassan.tazi@roseblanche.com',
                'contact_telephone': '06 77 88 99 00',
                'is_featured': True,
                'status': 'open'
            }
        ]
        
        created_count = 0
        for offre_data in offres_data:
            offre, created = OffreStage.objects.get_or_create(
                titre=offre_data['titre'],
                entreprise=offre_data['entreprise'],
                defaults=offre_data
            )
            if created:
                created_count += 1
                self.stdout.write(f"Created: {offre.titre} at {offre.entreprise}")
        
        self.stdout.write(
            self.style.SUCCESS(f'Created {created_count} new internship offers')
        )
        self.stdout.write(f'Total offers in database: {OffreStage.objects.count()}') 