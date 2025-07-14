"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

#!/usr/bin/env python
import os
import sys
import django
import requests
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stagebloom.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from shared.models import OffreStage

def create_sample_offres():
    print("Creating sample internship offers...")
    
    # Sample internship offers data
    offres_data = [
        {
            'titre': 'Développeur Full Stack',
            'entreprise': 'TechCorp',
            'description': 'Nous recherchons un stagiaire pour développer des applications web modernes avec React et Django.',
            'specialite': 'Informatique',
            'niveau': 'Bac+4',
            'localisation': 'Casablanca',
            'duree': 6,
            'remuneration': 3000,
            'contact_nom': 'Ahmed Benali',
            'contact_email': 'ahmed.benali@techcorp.com',
            'contact_telephone': '06 12 34 56 78',
            'is_featured': True,
            'status': 'open'
        },
        {
            'titre': 'Data Scientist',
            'entreprise': 'DataLab',
            'description': 'Stage en science des données avec Python, machine learning et analyse de données.',
            'specialite': 'Informatique',
            'niveau': 'Bac+5',
            'localisation': 'Rabat',
            'duree': 4,
            'remuneration': 4000,
            'contact_nom': 'Fatima Zahra',
            'contact_email': 'fatima.zahra@datalab.com',
            'contact_telephone': '06 98 76 54 32',
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
            print(f"Created: {offre.titre} at {offre.entreprise}")
    
    print(f"Created {created_count} new internship offers")
    print(f"Total offers in database: {OffreStage.objects.count()}")

def test_api():
    print("\nTesting API endpoint...")
    try:
        response = requests.get('http://localhost:8000/api/offres-stage/')
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Number of offers returned: {data.get('count', 0)}")
            print("API is working correctly!")
        else:
            print("API returned an error")
            
    except requests.exceptions.ConnectionError:
        print("Could not connect to server. Make sure Django server is running on port 8000")
    except Exception as e:
        print(f"Error testing API: {e}")

if __name__ == '__main__':
    create_sample_offres()
    test_api() 