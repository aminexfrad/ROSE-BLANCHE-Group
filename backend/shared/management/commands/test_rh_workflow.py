from django.core.management.base import BaseCommand
from django.conf import settings
from shared.utils import MailService
from demande_service.models import Demande
from auth_service.models import User
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Test RH decision workflow by creating sample demandes and testing email functionality'

    def add_arguments(self, parser):
        parser.add_argument(
            '--test-acceptance',
            action='store_true',
            help='Test acceptance email workflow'
        )
        parser.add_argument(
            '--test-rejection',
            action='store_true',
            help='Test rejection email workflow'
        )
        parser.add_argument(
            '--email',
            type=str,
            default='test@example.com',
            help='Email address to send test emails to'
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('Testing RH decision workflow...')
        )
        
        test_email = options['email']
        
        # Create a test demande
        demande = self.create_test_demande(test_email)
        
        if options['test_acceptance']:
            self.test_acceptance_workflow(demande)
        elif options['test_rejection']:
            self.test_rejection_workflow(demande)
        else:
            # Test both workflows
            self.test_acceptance_workflow(demande)
            self.test_rejection_workflow(demande)
    
    def create_test_demande(self, email):
        """Create a test demande for testing"""
        demande, created = Demande.objects.get_or_create(
            email=email,
            defaults={
                'nom': 'Test',
                'prenom': 'Candidat',
                'telephone': '0123456789',
                'cin': '12345678',
                'institut': 'Institut Test',
                'specialite': 'Informatique',
                'type_stage': 'Stage PFE',
                'niveau': '5ème année',
                'date_debut': '2024-06-01',
                'date_fin': '2024-08-31',
                'stage_binome': False,
                'status': 'pending'
            }
        )
        
        if created:
            self.stdout.write(
                self.style.SUCCESS(f'✅ Created test demande for {email}')
        else:
            self.stdout.write(
                self.style.WARNING(f'⚠️ Using existing demande for {email}')
            )
        
        return demande
    
    def test_acceptance_workflow(self, demande):
        """Test acceptance email workflow"""
        self.stdout.write(
            self.style.SUCCESS('\n📧 Testing acceptance email workflow...')
        )
        
        try:
            # Generate a test password
            import secrets
            import string
            password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
            
            # Send acceptance email
            success = MailService.send_acceptance_email(demande, password)
            
            if success:
                self.stdout.write(
                    self.style.SUCCESS('✅ Acceptance email sent successfully!')
                )
                self.stdout.write(
                    f'Email sent to: {demande.email}'
                )
                self.stdout.write(
                    f'Generated password: {password}'
                )
            else:
                self.stdout.write(
                    self.style.ERROR('❌ Failed to send acceptance email')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error testing acceptance workflow: {str(e)}')
            )
    
    def test_rejection_workflow(self, demande):
        """Test rejection email workflow"""
        self.stdout.write(
            self.style.SUCCESS('\n📧 Testing rejection email workflow...')
        )
        
        try:
            # Test rejection reason
            raison = "Nous regrettons de vous informer que votre candidature ne correspond pas aux critères actuels de notre entreprise. Nous vous encourageons à postuler à de futures opportunités."
            
            # Send rejection email
            success = MailService.send_rejection_email(demande, raison)
            
            if success:
                self.stdout.write(
                    self.style.SUCCESS('✅ Rejection email sent successfully!')
                )
                self.stdout.write(
                    f'Email sent to: {demande.email}'
                )
                self.stdout.write(
                    f'Rejection reason: {raison[:50]}...'
                )
            else:
                self.stdout.write(
                    self.style.ERROR('❌ Failed to send rejection email')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error testing rejection workflow: {str(e)}')
            )
    
    def cleanup_test_data(self, demande):
        """Clean up test data"""
        try:
            demande.delete()
            self.stdout.write(
                self.style.SUCCESS('✅ Test data cleaned up')
            )
        except Exception as e:
            self.stdout.write(
                self.style.WARNING(f'⚠️ Could not clean up test data: {str(e)}')
            ) 