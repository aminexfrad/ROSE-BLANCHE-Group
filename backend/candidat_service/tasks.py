"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

import logging
from datetime import datetime, timedelta
from django.utils import timezone
from celery import shared_task
from django.db import transaction
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string

from auth_service.models import User
from shared.models import Candidat

logger = logging.getLogger(__name__)

@shared_task
def deactivate_inactive_candidate_accounts():
    """
    Deactivate candidate accounts that have been inactive for more than 1 year.
    This task should be run periodically (e.g., daily or weekly).
    """
    try:
        # Calculate the cutoff date (1 year ago)
        cutoff_date = timezone.now() - timedelta(days=365)
        
        # Find candidates who haven't logged in for more than 1 year
        inactive_candidates = User.objects.filter(
            role=User.Role.CANDIDAT,
            is_active=True,
            last_login__lt=cutoff_date
        ).select_related('candidat_profile')
        
        deactivated_count = 0
        notification_emails = []
        
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
                notification_emails.append({
                    'email': user.email,
                    'nom': user.nom,
                    'prenom': user.prenom
                })
                
                logger.info(f"Deactivated inactive candidate account: {user.email}")
        
        # Send notification emails to deactivated candidates
        if notification_emails and settings.EMAIL_HOST:
            send_deactivation_notifications(notification_emails)
        
        logger.info(f"Successfully deactivated {deactivated_count} inactive candidate accounts")
        return {
            'status': 'success',
            'deactivated_count': deactivated_count,
            'message': f'Deactivated {deactivated_count} inactive candidate accounts'
        }
        
    except Exception as e:
        logger.error(f"Error deactivating inactive candidate accounts: {str(e)}")
        return {
            'status': 'error',
            'error': str(e),
            'message': 'Failed to deactivate inactive candidate accounts'
        }

@shared_task
def send_deactivation_notifications(notification_emails):
    """
    Send notification emails to deactivated candidates.
    """
    try:
        for notification in notification_emails:
            try:
                # Send email notification
                subject = "Votre compte candidat a été désactivé"
                
                # Render email template
                context = {
                    'nom': notification['nom'],
                    'prenom': notification['prenom'],
                    'site_url': settings.SITE_URL
                }
                
                html_message = render_to_string(
                    'emails/candidat_account_deactivated.html', 
                    context
                )
                plain_message = render_to_string(
                    'emails/candidat_account_deactivated.txt', 
                    context
                )
                
                send_mail(
                    subject=subject,
                    message=plain_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[notification['email']],
                    html_message=html_message,
                    fail_silently=False
                )
                
                logger.info(f"Sent deactivation notification to {notification['email']}")
                
            except Exception as e:
                logger.error(f"Failed to send deactivation notification to {notification['email']}: {str(e)}")
                
    except Exception as e:
        logger.error(f"Error sending deactivation notifications: {str(e)}")

@shared_task
def check_candidate_activity():
    """
    Check candidate activity and log statistics.
    This task can be run more frequently to monitor activity.
    """
    try:
        now = timezone.now()
        
        # Get statistics
        total_candidates = User.objects.filter(role=User.Role.CANDIDAT).count()
        active_candidates = User.objects.filter(role=User.Role.CANDIDAT, is_active=True).count()
        inactive_candidates = total_candidates - active_candidates
        
        # Check recent activity (last 30 days)
        thirty_days_ago = now - timedelta(days=30)
        recently_active = User.objects.filter(
            role=User.Role.CANDIDAT,
            last_login__gte=thirty_days_ago
        ).count()
        
        # Check accounts approaching deactivation (11 months old)
        eleven_months_ago = now - timedelta(days=335)  # ~11 months
        approaching_deactivation = User.objects.filter(
            role=User.Role.CANDIDAT,
            is_active=True,
            last_login__lt=eleven_months_ago
        ).count()
        
        logger.info(f"Candidate activity check - Total: {total_candidates}, "
                   f"Active: {active_candidates}, Inactive: {inactive_candidates}, "
                   f"Recently active (30d): {recently_active}, "
                   f"Approaching deactivation: {approaching_deactivation}")
        
        return {
            'status': 'success',
            'total_candidates': total_candidates,
            'active_candidates': active_candidates,
            'inactive_candidates': inactive_candidates,
            'recently_active': recently_active,
            'approaching_deactivation': approaching_deactivation
        }
        
    except Exception as e:
        logger.error(f"Error checking candidate activity: {str(e)}")
        return {
            'status': 'error',
            'error': str(e)
        }

@shared_task
def send_deactivation_warnings():
    """
    Send warning emails to candidates whose accounts are approaching deactivation (11 months old).
    """
    try:
        # Calculate the warning date (11 months ago)
        warning_date = timezone.now() - timedelta(days=335)  # ~11 months
        
        # Find candidates approaching deactivation
        candidates_to_warn = User.objects.filter(
            role=User.Role.CANDIDAT,
            is_active=True,
            last_login__lt=warning_date
        ).select_related('candidat_profile')
        
        warning_count = 0
        
        for user in candidates_to_warn:
            try:
                # Calculate days until deactivation
                days_until_deactivation = 365 - (timezone.now() - user.last_login).days
                
                # Send warning email
                subject = "Avertissement : Votre compte candidat sera bientôt désactivé"
                
                context = {
                    'nom': user.nom,
                    'prenom': user.prenom,
                    'days_until_deactivation': days_until_deactivation,
                    'site_url': settings.SITE_URL
                }
                
                html_message = render_to_string(
                    'emails/candidat_deactivation_warning.html', 
                    context
                )
                plain_message = render_to_string(
                    'emails/candidat_deactivation_warning.txt', 
                    context
                )
                
                send_mail(
                    subject=subject,
                    message=plain_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    html_message=html_message,
                    fail_silently=False
                )
                
                warning_count += 1
                logger.info(f"Sent deactivation warning to {user.email}")
                
            except Exception as e:
                logger.error(f"Failed to send warning to {user.email}: {str(e)}")
        
        logger.info(f"Successfully sent {warning_count} deactivation warnings")
        return {
            'status': 'success',
            'warning_count': warning_count,
            'message': f'Sent {warning_count} deactivation warnings'
        }
        
    except Exception as e:
        logger.error(f"Error sending deactivation warnings: {str(e)}")
        return {
            'status': 'error',
            'error': str(e)
        }
