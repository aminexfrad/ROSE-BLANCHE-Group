from django.core.management.base import BaseCommand
from django.conf import settings
from shared.utils import MailService
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Test email configuration by sending a test email via Mailtrap'

    def add_arguments(self, parser):
        parser.add_argument(
            '--recipient',
            type=str,
            default=None,
            help='Email address to send test email to (defaults to DEFAULT_FROM_EMAIL)'
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('Testing email configuration...')
        )
        
        # Get recipient email
        recipient = options['recipient'] or settings.DEFAULT_FROM_EMAIL
        
        if not recipient:
            self.stdout.write(
                self.style.ERROR('No recipient email specified. Please set DEFAULT_FROM_EMAIL in settings or use --recipient option.')
            )
            return
        
        try:
            # Test basic email configuration
            success = MailService.test_email_configuration()
            
            if success:
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Email configuration test successful!')
                )
                self.stdout.write(
                    f'Test email sent to: {recipient}'
                )
                self.stdout.write(
                    'Check your Mailtrap inbox to verify the email was received.'
                )
            else:
                self.stdout.write(
                    self.style.ERROR('❌ Email configuration test failed!')
                )
                self.stdout.write(
                    'Please check your Mailtrap credentials and SMTP settings.'
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error testing email configuration: {str(e)}')
            )
            self.stdout.write(
                'Please verify your Mailtrap settings in .env file:'
            )
            self.stdout.write(
                '- EMAIL_HOST=smtp.mailtrap.io'
            )
            self.stdout.write(
                '- EMAIL_PORT=2525'
            )
            self.stdout.write(
                '- EMAIL_HOST_USER=your-mailtrap-username'
            )
            self.stdout.write(
                '- EMAIL_HOST_PASSWORD=your-mailtrap-password'
            ) 