"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from typing import List, Dict, Any, Optional
from django.contrib.auth import get_user_model
from .services import NotificationService
from .models import NotificationEvent

User = get_user_model()


class RoleNotificationHelper:
    """
    Helper class for sending role-based notifications
    """
    
    def __init__(self):
        self.notification_service = NotificationService()
    
    def notify_stagiaires(self, title: str, message: str, 
                         notification_type: str = 'info', **kwargs) -> List:
        """
        Send notification to all stagiaires
        """
        return self.notification_service.send_role_notifications(
            target_roles=['stagiaire'],
            title=title,
            message=message,
            notification_type=notification_type,
            **kwargs
        )
    
    def notify_tuteurs(self, title: str, message: str, 
                      notification_type: str = 'info', **kwargs) -> List:
        """
        Send notification to all tuteurs
        """
        return self.notification_service.send_role_notifications(
            target_roles=['tuteur'],
            title=title,
            message=message,
            notification_type=notification_type,
            **kwargs
        )
    
    def notify_rh_team(self, title: str, message: str, 
                       notification_type: str = 'info', **kwargs) -> List:
        """
        Send notification to RH team
        """
        return self.notification_service.send_role_notifications(
            target_roles=['rh'],
            title=title,
            message=message,
            notification_type=notification_type,
            **kwargs
        )
    
    def notify_admin_team(self, title: str, message: str, 
                          notification_type: str = 'info', **kwargs) -> List:
        """
        Send notification to admin team
        """
        return self.notification_service.send_role_notifications(
            target_roles=['admin'],
            title=title,
            message=message,
            notification_type=notification_type,
            **kwargs
        )
    
    def notify_management_team(self, title: str, message: str, 
                              notification_type: str = 'info', **kwargs) -> List:
        """
        Send notification to management team (admin + RH)
        """
        return self.notification_service.send_role_notifications(
            target_roles=['admin', 'rh'],
            title=title,
            message=message,
            notification_type=notification_type,
            **kwargs
        )
    
    def notify_stage_participants(self, stage_id: int, title: str, message: str, 
                                 notification_type: str = 'info', **kwargs) -> List:
        """
        Send notification to stage participants (stagiaire and tuteur)
        """
        from shared.models import Stage
        
        try:
            stage = Stage.objects.get(id=stage_id)
            users = []
            
            if stage.stagiaire:
                users.append(stage.stagiaire)
            if stage.tuteur:
                users.append(stage.tuteur)
            
            if users:
                return self.notification_service.send_bulk_notifications(
                    users, title, message, notification_type, **kwargs
                )
            
        except Stage.DoesNotExist:
            pass
        
        return []
    
    def notify_survey_participants(self, survey_id: int, title: str, message: str, 
                                  notification_type: str = 'info', **kwargs) -> List:
        """
        Send notification to survey participants
        """
        from shared.models import Survey
        
        try:
            survey = Survey.objects.get(id=survey_id)
            target_stagiaires = survey.get_target_stagiaires()
            
            if target_stagiaires:
                return self.notification_service.send_bulk_notifications(
                    target_stagiaires, title, message, notification_type, **kwargs
                )
            
        except Survey.DoesNotExist:
            pass
        
        return []
    
    def create_stage_event(self, event_type: str, stage_id: int, 
                          event_data: Dict[str, Any], source_user: Optional[User] = None) -> NotificationEvent:
        """
        Create a stage-related notification event
        """
        # Add stage_id to event data
        event_data['stage_id'] = stage_id
        
        # Determine target roles based on event type
        target_roles = self._get_target_roles_for_stage_event(event_type)
        
        return self.notification_service.create_event(
            event_type=event_type,
            event_data=event_data,
            source_user=source_user,
            target_roles=target_roles
        )
    
    def create_survey_event(self, event_type: str, survey_id: int, 
                           event_data: Dict[str, Any], source_user: Optional[User] = None) -> NotificationEvent:
        """
        Create a survey-related notification event
        """
        # Add survey_id to event data
        event_data['survey_id'] = survey_id
        
        # Determine target roles based on event type
        target_roles = self._get_target_roles_for_survey_event(event_type)
        
        return self.notification_service.create_event(
            event_type=event_type,
            event_data=event_data,
            source_user=source_user,
            target_roles=target_roles
        )
    
    def create_evaluation_event(self, event_type: str, evaluator_id: int, evaluated_id: int,
                               event_data: Dict[str, Any], source_user: Optional[User] = None) -> NotificationEvent:
        """
        Create an evaluation-related notification event
        """
        # Add evaluation data to event data
        event_data['evaluator_id'] = evaluator_id
        event_data['evaluated_id'] = evaluated_id
        
        return self.notification_service.create_event(
            event_type=event_type,
            event_data=event_data,
            source_user=source_user
        )
    
    def _get_target_roles_for_stage_event(self, event_type: str) -> List[str]:
        """
        Determine target roles for stage events
        """
        if event_type == NotificationEvent.EventType.STAGE_UPDATE:
            return ['stagiaire', 'tuteur']
        elif event_type == NotificationEvent.EventType.DOCUMENT_UPLOAD:
            return ['stagiaire', 'tuteur', 'rh']
        elif event_type == NotificationEvent.EventType.EVALUATION:
            return ['stagiaire', 'tuteur']
        elif event_type == NotificationEvent.EventType.TESTIMONIAL:
            return ['stagiaire', 'tuteur', 'rh']
        else:
            return ['stagiaire', 'tuteur']
    
    def _get_target_roles_for_survey_event(self, event_type: str) -> List[str]:
        """
        Determine target roles for survey events
        """
        if event_type == NotificationEvent.EventType.SURVEY:
            return ['stagiaire', 'rh']
        elif event_type == NotificationEvent.EventType.KPI_ALERT:
            return ['rh', 'tuteur']
        else:
            return ['stagiaire', 'rh']


# Convenience functions for common notification scenarios
def notify_new_stage_created(stage_id: int, source_user: Optional[User] = None):
    """
    Notify when a new stage is created
    """
    helper = RoleNotificationHelper()
    event = helper.create_stage_event(
        event_type=NotificationEvent.EventType.STAGE_UPDATE,
        stage_id=stage_id,
        event_data={
            'action': 'stage_created',
            'message': 'Nouveau stage créé'
        },
        source_user=source_user
    )
    return helper.notification_service.process_event(event)


def notify_document_uploaded(stage_id: int, document_title: str, source_user: Optional[User] = None):
    """
    Notify when a document is uploaded
    """
    helper = RoleNotificationHelper()
    event = helper.create_stage_event(
        event_type=NotificationEvent.EventType.DOCUMENT_UPLOAD,
        stage_id=stage_id,
        event_data={
            'action': 'document_uploaded',
            'document_title': document_title,
            'message': f'Nouveau document uploadé: {document_title}'
        },
        source_user=source_user
    )
    return helper.notification_service.process_event(event)


def notify_survey_available(survey_id: int, survey_title: str, source_user: Optional[User] = None):
    """
    Notify when a new survey is available
    """
    helper = RoleNotificationHelper()
    event = helper.create_survey_event(
        event_type=NotificationEvent.EventType.SURVEY,
        survey_id=survey_id,
        event_data={
            'action': 'survey_available',
            'survey_title': survey_title,
            'message': f'Nouveau sondage disponible: {survey_title}'
        },
        source_user=source_user
    )
    return helper.notification_service.process_event(event)


def notify_kpi_alert(stage_id: int, alert_message: str, alert_level: str = 'warning', source_user: Optional[User] = None):
    """
    Notify when a KPI alert is triggered
    """
    helper = RoleNotificationHelper()
    event = helper.create_stage_event(
        event_type=NotificationEvent.EventType.KPI_ALERT,
        stage_id=stage_id,
        event_data={
            'action': 'kpi_alert',
            'alert_message': alert_message,
            'alert_level': alert_level,
            'message': f'Alerte KPI: {alert_message}'
        },
        source_user=source_user
    )
    return helper.notification_service.process_event(event)


def notify_testimonial_submitted(stage_id: int, testimonial_title: str, source_user: Optional[User] = None):
    """
    Notify when a testimonial is submitted
    """
    helper = RoleNotificationHelper()
    event = helper.create_stage_event(
        event_type=NotificationEvent.EventType.TESTIMONIAL,
        stage_id=stage_id,
        event_data={
            'action': 'testimonial_submitted',
            'testimonial_title': testimonial_title,
            'message': f'Nouveau témoignage soumis: {testimonial_title}'
        },
        source_user=source_user
    )
    return helper.notification_service.process_event(event)


def notify_evaluation_completed(stage_id: int, evaluator_id: int, evaluated_id: int, 
                               evaluation_type: str, source_user: Optional[User] = None):
    """
    Notify when an evaluation is completed
    """
    helper = RoleNotificationHelper()
    event = helper.create_evaluation_event(
        event_type=NotificationEvent.EventType.EVALUATION,
        evaluator_id=evaluator_id,
        evaluated_id=evaluated_id,
        event_data={
            'action': 'evaluation_completed',
            'evaluation_type': evaluation_type,
            'stage_id': stage_id,
            'message': f'Évaluation {evaluation_type} terminée'
        },
        source_user=source_user
    )
    return helper.notification_service.process_event(event)
