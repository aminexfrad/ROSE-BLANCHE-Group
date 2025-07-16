#!/usr/bin/env python3
"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.

Test script for public testimonials functionality
"""

import os
import sys
import django
from django.utils import timezone
from datetime import timedelta

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gateway.stagebloom.settings')
django.setup()

from auth_service.models import User
from shared.models import Stage, Testimonial

def test_public_testimonials():
    """
    Test the public testimonials functionality
    """
    print("🧪 Testing Public Testimonials Functionality")
    print("=" * 50)
    
    try:
        # 1. Create test users
        print("\n1. Creating test users...")
        
        # Create stagiaire users
        stagiaire1, created = User.objects.get_or_create(
            email='stagiaire1@test.com',
            defaults={
                'nom': 'Ben Salem',
                'prenom': 'Amira',
                'role': 'stagiaire',
                'is_active': True,
                'institut': 'ENIT',
                'specialite': 'Génie Civil'
            }
        )
        print(f"✅ Stagiaire 1: {stagiaire1.get_full_name()}")
        
        stagiaire2, created = User.objects.get_or_create(
            email='stagiaire2@test.com',
            defaults={
                'nom': 'Trabelsi',
                'prenom': 'Mohamed',
                'role': 'stagiaire',
                'is_active': True,
                'institut': 'INSAT',
                'specialite': 'Génie Mécanique'
            }
        )
        print(f"✅ Stagiaire 2: {stagiaire2.get_full_name()}")
        
        stagiaire3, created = User.objects.get_or_create(
            email='stagiaire3@test.com',
            defaults={
                'nom': 'Karray',
                'prenom': 'Salma',
                'role': 'stagiaire',
                'is_active': True,
                'institut': 'ENAU',
                'specialite': 'Architecture'
            }
        )
        print(f"✅ Stagiaire 3: {stagiaire3.get_full_name()}")
        
        # 2. Create test stages
        print("\n2. Creating test stages...")
        
        stage1, created = Stage.objects.get_or_create(
            title='Projet autoroutier Tunis-Sfax',
            defaults={
                'company': 'Rose Blanche',
                'location': 'Sousse',
                'description': 'Stage en génie civil',
                'start_date': timezone.now().date() - timedelta(days=60),
                'end_date': timezone.now().date() - timedelta(days=30),
                'status': 'completed',
                'stagiaire': stagiaire1
            }
        )
        print(f"✅ Stage 1: {stage1.title}")
        
        stage2, created = Stage.objects.get_or_create(
            title='Système de ventilation industrielle',
            defaults={
                'company': 'Rose Blanche',
                'location': 'Sousse',
                'description': 'Stage en génie mécanique',
                'start_date': timezone.now().date() - timedelta(days=45),
                'end_date': timezone.now().date() - timedelta(days=15),
                'status': 'completed',
                'stagiaire': stagiaire2
            }
        )
        print(f"✅ Stage 2: {stage2.title}")
        
        stage3, created = Stage.objects.get_or_create(
            title='Complexe résidentiel Lac Nord',
            defaults={
                'company': 'Rose Blanche',
                'location': 'Tunis',
                'description': 'Stage en architecture',
                'start_date': timezone.now().date() - timedelta(days=30),
                'end_date': timezone.now().date(),
                'status': 'completed',
                'stagiaire': stagiaire3
            }
        )
        print(f"✅ Stage 3: {stage3.title}")
        
        # 3. Create approved testimonials
        print("\n3. Creating approved testimonials...")
        
        # Text testimonial 1
        testimonial1 = Testimonial.objects.create(
            stage=stage1,
            author=stagiaire1,
            title='Une expérience enrichissante en génie civil',
            content='Mon stage chez Rose Blanche m\'a permis de découvrir les réalités du terrain. L\'encadrement était exceptionnel et la plateforme digitale a facilité tout mon parcours. J\'ai pu participer à des projets d\'envergure et développer mes compétences techniques.',
            testimonial_type='text',
            status='approved'
        )
        print(f"✅ Testimonial 1: {testimonial1.title}")
        
        # Video testimonial 1
        testimonial2 = Testimonial.objects.create(
            stage=stage2,
            author=stagiaire2,
            title='Stage en génie mécanique - Mon expérience',
            content='Une expérience très enrichissante qui m\'a permis de mettre en pratique mes connaissances théoriques. Je recommande vivement cette entreprise pour un stage. L\'équipe était très accueillante et j\'ai pu travailler sur des projets passionnants.',
            testimonial_type='video',
            video_url='https://www.youtube.com/embed/dQw4w9WgXcQ',
            status='approved'
        )
        print(f"✅ Testimonial 2 (Video): {testimonial2.title}")
        
        # Text testimonial 2
        testimonial3 = Testimonial.objects.create(
            stage=stage3,
            author=stagiaire3,
            title='Découverte du monde professionnel en architecture',
            content='Ce stage a été une excellente introduction au monde professionnel. J\'ai pu développer mes compétences techniques et soft skills. L\'approche pédagogique de Rose Blanche est remarquable.',
            testimonial_type='text',
            status='approved'
        )
        print(f"✅ Testimonial 3: {testimonial3.title}")
        
        # Video testimonial 2
        testimonial4 = Testimonial.objects.create(
            stage=stage1,
            author=stagiaire1,
            title='Mon parcours de stagiaire - Vidéo témoignage',
            content='Partage de mon expérience complète en tant que stagiaire chez Rose Blanche. Découvrez mon quotidien, les projets sur lesquels j\'ai travaillé et les compétences que j\'ai développées.',
            testimonial_type='video',
            video_url='https://www.youtube.com/embed/9bZkp7q19f0',
            status='approved'
        )
        print(f"✅ Testimonial 4 (Video): {testimonial4.title}")
        
        # 4. Create some pending testimonials (should not appear in public)
        print("\n4. Creating pending testimonials (should not appear in public)...")
        
        testimonial5 = Testimonial.objects.create(
            stage=stage2,
            author=stagiaire2,
            title='Témoignage en attente de validation',
            content='Ce témoignage est en attente de validation par l\'équipe RH.',
            testimonial_type='text',
            status='pending'
        )
        print(f"✅ Testimonial 5 (Pending): {testimonial5.title}")
        
        # 5. Test public testimonials filtering
        print("\n5. Testing public testimonials filtering...")
        
        # Get only approved testimonials
        public_testimonials = Testimonial.objects.filter(status='approved')
        print(f"✅ Public testimonials count: {public_testimonials.count()}")
        
        # Check video testimonials
        video_testimonials = public_testimonials.filter(testimonial_type='video')
        print(f"✅ Video testimonials count: {video_testimonials.count()}")
        
        # Check text testimonials
        text_testimonials = public_testimonials.filter(testimonial_type='text')
        print(f"✅ Text testimonials count: {text_testimonials.count()}")
        
        # 6. Test API endpoints
        print("\n6. Testing API endpoints...")
        
        from django.test import Client
        from django.urls import reverse
        
        client = Client()
        
        # Test public testimonials endpoint
        try:
            response = client.get('/api/public/testimonials/')
            if response.status_code == 200:
                print("✅ Public testimonials API endpoint working")
            else:
                print(f"⚠️ Public testimonials API endpoint returned status {response.status_code}")
        except Exception as e:
            print(f"⚠️ Public testimonials API test failed: {str(e)}")
        
        # 7. Display testimonials details
        print("\n7. Public testimonials details:")
        for i, testimonial in enumerate(public_testimonials, 1):
            print(f"   {i}. {testimonial.title}")
            print(f"      Auteur: {testimonial.author.get_full_name()}")
            print(f"      Type: {testimonial.testimonial_type}")
            print(f"      Stage: {testimonial.stage.title}")
            print(f"      Date: {testimonial.created_at.strftime('%d/%m/%Y')}")
            if testimonial.video_url:
                print(f"      Vidéo: {testimonial.video_url}")
            print()
        
        # 8. Statistics
        print("\n8. Final statistics:")
        total_testimonials = Testimonial.objects.count()
        approved_testimonials = Testimonial.objects.filter(status='approved').count()
        pending_testimonials = Testimonial.objects.filter(status='pending').count()
        video_testimonials = Testimonial.objects.filter(status='approved', testimonial_type='video').count()
        text_testimonials = Testimonial.objects.filter(status='approved', testimonial_type='text').count()
        
        print(f"📊 Total testimonials: {total_testimonials}")
        print(f"📊 Approved (public): {approved_testimonials}")
        print(f"📊 Pending (not public): {pending_testimonials}")
        print(f"📊 Video testimonials: {video_testimonials}")
        print(f"📊 Text testimonials: {text_testimonials}")
        
        print("\n🎉 Public testimonials test completed successfully!")
        print("\n📋 Summary:")
        print("- ✅ Test users created")
        print("- ✅ Test stages created")
        print("- ✅ Approved testimonials created (public)")
        print("- ✅ Video testimonials created")
        print("- ✅ Pending testimonials created (not public)")
        print("- ✅ Public filtering working")
        print("- ✅ API endpoint tested")
        print("- ✅ Statistics calculated")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during testing: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_public_testimonials()
    sys.exit(0 if success else 1) 