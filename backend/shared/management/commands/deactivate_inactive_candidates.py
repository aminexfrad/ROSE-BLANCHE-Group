"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from datetime import timedelta
from auth_service.models import User
from shared.models import Candidat


class Command(BaseCommand):
    help = 'Deactivate candidate accounts that have been inactive for more than 1 year'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deactivated without actually deactivating',
        )
        parser.add_argument(
            '--days',
            type=int,
            default=365,
            help='Number of days of inactivity before deactivation (default: 365)',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force deactivation without confirmation',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        days = options['days']
        force = options['force']

        # Calculate the cutoff date
        cutoff_date = timezone.now() - timedelta(days=days)

        self.stdout.write(
            self.style.SUCCESS(f'Checking for candidates inactive for more than {days} days...')
        )
        self.stdout.write(f'Cutoff date: {cutoff_date.strftime("%Y-%m-%d %H:%M:%S")}')

        # Find inactive candidates
        inactive_candidates = User.objects.filter(
            role=User.Role.CANDIDAT,
            is_active=True,
            last_login__lt=cutoff_date
        ).select_related('candidat_profile').order_by('last_login')

        if not inactive_candidates.exists():
            self.stdout.write(
                self.style.SUCCESS('No inactive candidates found.')
            )
            return

        self.stdout.write(f'\nFound {inactive_candidates.count()} inactive candidates:')
        self.stdout.write('-' * 80)
        
        for user in inactive_candidates:
            last_login = user.last_login.strftime("%Y-%m-%d %H:%M:%S") if user.last_login else "Never"
            days_inactive = (timezone.now() - user.last_login).days if user.last_login else "Unknown"
            
            self.stdout.write(
                f'{user.email:<30} | {user.get_full_name():<25} | '
                f'Last login: {last_login} | Days inactive: {days_inactive}'
            )

        if dry_run:
            self.stdout.write(
                self.style.WARNING('\nDRY RUN - No accounts were actually deactivated.')
            )
            return

        if not force:
            confirm = input(f'\nAre you sure you want to deactivate {inactive_candidates.count()} accounts? (yes/no): ')
            if confirm.lower() not in ['yes', 'y']:
                self.stdout.write(self.style.WARNING('Operation cancelled.'))
                return

        # Proceed with deactivation
        deactivated_count = 0
        
        try:
            with transaction.atomic():
                for user in inactive_candidates:
                    # Deactivate the user account
                    user.is_active = False
                    user.save(update_fields=['is_active'])
                    
                    # Deactivate the candidat profile if it exists
                    if hasattr(user, 'candidat_profile'):
                        candidat = user.candidat_profile
                        candidat.is_active = False
                        candidat.save(update_fields=['is_active'])
                    
                    deactivated_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'✓ Deactivated: {user.email}')
                    )

            self.stdout.write(
                self.style.SUCCESS(f'\nSuccessfully deactivated {deactivated_count} candidate accounts.')
            )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'\nError during deactivation: {str(e)}')
            )
            raise

        # Show summary
        self.stdout.write('\n' + '=' * 80)
        self.stdout.write('DEACTIVATION SUMMARY')
        self.stdout.write('=' * 80)
        self.stdout.write(f'Total candidates checked: {User.objects.filter(role=User.Role.CANDIDAT).count()}')
        self.stdout.write(f'Active candidates remaining: {User.objects.filter(role=User.Role.CANDIDAT, is_active=True).count()}')
        self.stdout.write(f'Inactive candidates: {User.objects.filter(role=User.Role.CANDIDAT, is_active=False).count()}')
        self.stdout.write(f'Accounts deactivated in this run: {deactivated_count}')
