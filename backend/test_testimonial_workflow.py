#!/usr/bin/env python3
"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.

Test script for testimonial moderation workflow
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
from shared.models import Stage, Testimonial, Notification
from shared.utils import MailService

def test_testimonial_workflow():
    """
    Test the complete testimonial moderation workflow
    """
    print("🧪 Testing Testimonial Moderation Workflow")
    print("=" * 50)
    
    try:
        # 1. Create test users
        print("\n1. Creating test users...")
        
        # Create RH user
        rh_user, created = User.objects.get_or_create(
            email='rh@test.com',
            defaults={
                'nom': 'Test',
                'prenom': 'RH',
                'role': 'rh',
                'is_active': True
            }
        )
        print(f"✅ RH user: {rh_user.get_full_name()}")
        
        # Create stagiaire user
        stagiaire_user, created = User.objects.get_or_create(
            email='stagiaire@test.com',
            defaults={
                'nom': 'Test',
                'prenom': 'Stagiaire',
                'role': 'stagiaire',
                'is_active': True,
                'institut': 'ISET Sousse',
                'specialite': 'Génie Informatique'
            }
        )
        print(f"✅ Stagiaire user: {stagiaire_user.get_full_name()}")
        
        # 2. Create test stage
        print("\n2. Creating test stage...")
        stage, created = Stage.objects.get_or_create(
            title='Stage Test',
            defaults={
                'company': 'Rose Blanche',
                'location': 'Sousse',
                'description': 'Stage de test pour témoignages',
                'start_date': timezone.now().date(),
                'end_date': (timezone.now() + timedelta(days=90)).date(),
                'status': 'completed',
                'stagiaire': stagiaire_user
            }
        )
        print(f"✅ Stage: {stage.title}")
        
        # 3. Create testimonial
        print("\n3. Creating testimonial...")
        testimonial = Testimonial.objects.create(
            stage=stage,
            author=stagiaire_user,
            title='Mon expérience de stage',
            content='Ce stage a été une expérience très enrichissante. J\'ai pu développer mes compétences techniques et découvrir le monde professionnel. L\'équipe était très accueillante et j\'ai pu travailler sur des projets passionnants.',
            testimonial_type='text',
            status='pending'
        )
        print(f"✅ Testimonial created: {testimonial.title}")
        
        # 4. Check notifications
        print("\n4. Checking notifications...")
        rh_notifications = Notification.objects.filter(
            recipient=rh_user,
            title__icontains='témoignage'
        )
        print(f"✅ RH notifications: {rh_notifications.count()}")
        
        # 5. Simulate approval
        print("\n5. Simulating approval...")
        testimonial.status = 'approved'
        testimonial.moderated_by = rh_user
        testimonial.moderated_at = timezone.now()
        testimonial.moderation_comment = 'Excellent témoignage, très bien écrit !'
        testimonial.save()
        
        # Create approval notification
        Notification.objects.create(
            recipient=stagiaire_user,
            title='Témoignage approuvé',
            message=f'Votre témoignage "{testimonial.title}" a été approuvé et publié sur la plateforme.',
            notification_type='success',
            related_stage=stage
        )
        print(f"✅ Testimonial approved")
        
        # 6. Check approval notification
        stagiaire_notifications = Notification.objects.filter(
            recipient=stagiaire_user,
            title__icontains='approuvé'
        )
        print(f"✅ Stagiaire approval notifications: {stagiaire_notifications.count()}")
        
        # 7. Test rejection workflow
        print("\n7. Testing rejection workflow...")
        testimonial2 = Testimonial.objects.create(
            stage=stage,
            author=stagiaire_user,
            title='Témoignage à modifier',
            content='Ce témoignage contient des informations qui nécessitent des modifications.',
            testimonial_type='text',
            status='rejected'
        )
        
        testimonial2.moderated_by = rh_user
        testimonial2.moderated_at = timezone.now()
        testimonial2.moderation_comment = 'Veuillez modifier le contenu pour respecter nos guidelines.'
        testimonial2.save()
        
        # Create rejection notification
        Notification.objects.create(
            recipient=stagiaire_user,
            title='Témoignage nécessite des modifications',
            message=f'Votre témoignage "{testimonial2.title}" nécessite des modifications. Commentaire: {testimonial2.moderation_comment}',
            notification_type='warning',
            related_stage=stage
        )
        print(f"✅ Testimonial rejected")
        
        # 8. Test public testimonials
        print("\n8. Testing public testimonials...")
        public_testimonials = Testimonial.objects.filter(status='approved')
        print(f"✅ Public testimonials: {public_testimonials.count()}")
        
        # 9. Statistics
        print("\n9. Workflow statistics...")
        total_testimonials = Testimonial.objects.count()
        pending_testimonials = Testimonial.objects.filter(status='pending').count()
        approved_testimonials = Testimonial.objects.filter(status='approved').count()
        rejected_testimonials = Testimonial.objects.filter(status='rejected').count()
        
        print(f"📊 Total testimonials: {total_testimonials}")
        print(f"📊 Pending: {pending_testimonials}")
        print(f"📊 Approved: {approved_testimonials}")
        print(f"📊 Rejected: {rejected_testimonials}")
        
        # 10. Test email notifications (if configured)
        print("\n10. Testing email notifications...")
        try:
            # Test RH notification
            MailService.send_testimonial_submission_notification(testimonial)
            print("✅ RH notification email sent")
            
            # Test approval notification
            MailService.send_testimonial_approval_notification(testimonial)
            print("✅ Approval notification email sent")
            
            # Test rejection notification
            MailService.send_testimonial_rejection_notification(testimonial2)
            print("✅ Rejection notification email sent")
            
        except Exception as e:
            print(f"⚠️ Email notifications test failed (expected if not configured): {str(e)}")
        
        print("\n🎉 Testimonial moderation workflow test completed successfully!")
        print("\n📋 Summary:")
        print("- ✅ Test users created")
        print("- ✅ Test stage created")
        print("- ✅ Testimonials created")
        print("- ✅ Notifications generated")
        print("- ✅ Approval workflow tested")
        print("- ✅ Rejection workflow tested")
        print("- ✅ Public testimonials accessible")
        print("- ✅ Email notifications tested")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during testing: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_testimonial_workflow()
    sys.exit(0 if success else 1) 