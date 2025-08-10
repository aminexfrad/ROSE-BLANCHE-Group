"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from shared.models import Stage, Document, Testimonial, Survey, Notification as SharedNotification
from .services import notification_service
from .models import NotificationEvent
from django.utils import timezone

User = get_user_model()


@receiver(post_save, sender=Stage)
def stage_created_or_updated(sender, instance, created, **kwargs):
    """Handle stage creation and updates"""
    if created:
        # New stage created
        event_data = {
            'stage_id': instance.id,
            'stage_title': instance.title,
            'stagiaire_name': instance.stagiaire.get_full_name(),
            'tuteur_name': instance.tuteur.get_full_name() if instance.tuteur else 'Non assigné'
        }
        
        # Notify stagiaire and tuteur
        target_users = [instance.stagiaire]
        if instance.tuteur:
            target_users.append(instance.tuteur)
        
        event = notification_service.create_event(
            event_type=NotificationEvent.EventType.STAGE_UPDATE,
            event_data=event_data,
            source_user=instance.created_by if hasattr(instance, 'created_by') else None,
            target_users=target_users
        )
        notification_service.process_event(event)
    
    elif instance.tracker.has_changed('status'):
        # Stage status changed
        event_data = {
            'stage_id': instance.id,
            'stage_title': instance.title,
            'old_status': instance.tracker.previous('status'),
            'new_status': instance.status,
            'stagiaire_name': instance.stagiaire.get_full_name()
        }
        
        target_users = [instance.stagiaire]
        if instance.tuteur:
            target_users.append(instance.tuteur)
        
        event = notification_service.create_event(
            event_type=NotificationEvent.EventType.STAGE_UPDATE,
            event_data=event_data,
            target_users=target_users
        )
        notification_service.process_event(event)


@receiver(post_save, sender=Document)
def document_uploaded(sender, instance, created, **kwargs):
    """Handle document uploads"""
    if created:
        event_data = {
            'document_id': instance.id,
            'document_name': instance.name,
            'document_type': instance.document_type,
            'stage_title': instance.stage.title if instance.stage else None,
            'uploaded_by': instance.uploaded_by.get_full_name()
        }
        
        # Notify stage participants
        target_users = []
        if instance.stage:
            target_users.append(instance.stage.stagiaire)
            if instance.stage.tuteur:
                target_users.append(instance.stage.tuteur)
        
        if target_users:
            event = notification_service.create_event(
                event_type=NotificationEvent.EventType.DOCUMENT_UPLOAD,
                event_data=event_data,
                source_user=instance.uploaded_by,
                target_users=target_users
            )
            notification_service.process_event(event)


@receiver(post_save, sender=Testimonial)
def testimonial_submitted(sender, instance, created, **kwargs):
    """Handle testimonial submissions"""
    if created:
        event_data = {
            'testimonial_id': instance.id,
            'author_name': instance.author.get_full_name(),
            'stage_title': instance.stage.title if instance.stage else None,
            'content_preview': instance.content[:100] + '...' if len(instance.content) > 100 else instance.content
        }
        
        # Notify RH team
        rh_users = User.objects.filter(role='rh', is_active=True)
        
        event = notification_service.create_event(
            event_type=NotificationEvent.EventType.TESTIMONIAL,
            event_data=event_data,
            source_user=instance.author,
            target_users=list(rh_users)
        )
        notification_service.process_event(event)


@receiver(post_save, sender=Survey)
def survey_created_or_updated(sender, instance, created, **kwargs):
    """Handle survey creation and updates"""
    if created:
        event_data = {
            'survey_id': instance.id,
            'survey_title': instance.title,
            'target_type': instance.target_type,
            'created_by': instance.created_by.get_full_name()
        }
        
        # Notify target stagiaires
        target_stagiaires = instance.get_target_stagiaires()
        
        event = notification_service.create_event(
            event_type=NotificationEvent.EventType.SURVEY,
            event_data=event_data,
            source_user=instance.created_by,
            target_users=list(target_stagiaires)
        )
        notification_service.process_event(event)


@receiver(post_save, sender=User)
def user_registered(sender, instance, created, **kwargs):
    """Handle new user registration"""
    if created and instance.role == 'stagiaire':
        event_data = {
            'user_id': instance.id,
            'user_name': instance.get_full_name(),
            'email': instance.email,
            'institut': instance.institut if hasattr(instance, 'institut') else None,
            'specialite': instance.specialite if hasattr(instance, 'specialite') else None
        }
        
        # Notify RH team
        rh_users = User.objects.filter(role='rh', is_active=True)
        
        event = notification_service.create_event(
            event_type=NotificationEvent.EventType.USER_ACTION,
            event_data=event_data,
            source_user=instance,
            target_users=list(rh_users)
        )
        notification_service.process_event(event)


# Custom signal for KPI alerts
def trigger_kpi_alert(stagiaire, survey, score, threshold_type):
    """Trigger KPI alert notification"""
    event_data = {
        'stagiaire_id': stagiaire.id,
        'stagiaire_name': stagiaire.get_full_name(),
        'survey_id': survey.id,
        'survey_title': survey.title,
        'score': score,
        'threshold_type': threshold_type,
        'threshold_value': survey.kpi_threshold_critical if threshold_type == 'critical' else survey.kpi_threshold_warning
    }
    
    # Notify RH team
    rh_users = User.objects.filter(role='rh', is_active=True)
    
    event = notification_service.create_event(
        event_type=NotificationEvent.EventType.KPI_ALERT,
        event_data=event_data,
        target_users=list(rh_users)
    )
    notification_service.process_event(event)


# Custom signal for system maintenance
def trigger_system_maintenance(message, level='info', target_roles=None):
    """Trigger system maintenance notification"""
    event_data = {
        'message': message,
        'level': level,
        'timestamp': timezone.now().isoformat()
    }
    
    if target_roles:
        target_users = User.objects.filter(role__in=target_roles, is_active=True)
    else:
        target_users = User.objects.filter(is_active=True)
    
    event = notification_service.create_event(
        event_type=NotificationEvent.EventType.SYSTEM,
        event_data=event_data,
        target_users=list(target_users)
    )
    notification_service.process_event(event)
