"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

import json
import logging
from typing import List, Dict, Any, Optional
from django.contrib.auth import get_user_model
from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import NotificationEvent, NotificationTemplate, WebSocketConnection
from shared.models import Notification as SharedNotification

User = get_user_model()
logger = logging.getLogger(__name__)


class NotificationService:
    """
    Service class for handling notification operations
    """
    
    def __init__(self):
        self.channel_layer = get_channel_layer()
    
    def create_event(self, event_type: str, event_data: Dict[str, Any], 
                    source_user: Optional[User] = None, 
                    target_users: Optional[List[User]] = None,
                    target_roles: Optional[List[str]] = None) -> NotificationEvent:
        """
        Create a notification event with optional role-based targeting
        """
        try:
            event = NotificationEvent.objects.create(
                event_type=event_type,
                event_data=event_data,
                source_user=source_user
            )
            
            if target_users:
                event.target_users.set(target_users)
            
            # Store target roles in event data for processing
            if target_roles:
                event.event_data['target_roles'] = target_roles
                event.save()
            
            logger.info(f"Created notification event: {event_type}")
            return event
            
        except Exception as e:
            logger.error(f"Error creating notification event: {e}")
            raise
    
    def process_event(self, event: NotificationEvent) -> List[SharedNotification]:
        """
        Process a notification event and create notifications
        """
        try:
            notifications = []
            
            # Get target users
            target_users = list(event.target_users.all())
            
            if not target_users:
                # If no specific targets, determine based on event type and roles
                target_users = self._get_target_users_for_event(event)
            
            # Create notifications for each target user
            for user in target_users:
                notification = self._create_notification_from_event(event, user)
                if notification:
                    notifications.append(notification)
            
            # Mark event as processed
            event.mark_processed()
            
            # Send real-time notifications
            self._send_real_time_notifications(notifications)
            
            logger.info(f"Processed event {event.id}: {len(notifications)} notifications created")
            return notifications
            
        except Exception as e:
            logger.error(f"Error processing notification event: {e}")
            raise
    
    def send_notification(self, recipient: User, title: str, message: str, 
                         notification_type: str = 'info', **kwargs) -> SharedNotification:
        """
        Send a direct notification to a user
        """
        try:
            notification = SharedNotification.objects.create(
                recipient=recipient,
                title=title,
                message=message,
                notification_type=notification_type,
                **kwargs
            )
            
            # Send real-time notification
            self._send_real_time_notification(notification)
            
            return notification
            
        except Exception as e:
            logger.error(f"Error sending notification: {e}")
            raise
    
    def send_bulk_notifications(self, recipients: List[User], title: str, message: str,
                               notification_type: str = 'info', **kwargs) -> List[SharedNotification]:
        """
        Send notifications to multiple users
        """
        try:
            notifications = []
            for recipient in recipients:
                notification = self.send_notification(
                    recipient, title, message, notification_type, **kwargs
                )
                notifications.append(notification)
            
            return notifications
            
        except Exception as e:
            logger.error(f"Error sending bulk notifications: {e}")
            raise
    
    def send_role_notifications(self, target_roles: List[str], title: str, message: str,
                               notification_type: str = 'info', **kwargs) -> List[SharedNotification]:
        """
        Send notifications to all users with specific roles
        """
        try:
            # Get users with target roles
            target_users = User.objects.filter(role__in=target_roles, is_active=True)
            
            # Send notifications
            notifications = self.send_bulk_notifications(
                target_users, title, message, notification_type, **kwargs
            )
            
            # Send real-time notifications to role groups
            self._send_role_broadcast(target_roles, title, message, notification_type)
            
            logger.info(f"Sent role notifications to {len(notifications)} users in roles: {target_roles}")
            return notifications
            
        except Exception as e:
            logger.error(f"Error sending role notifications: {e}")
            raise
    
    def send_broadcast(self, message: str, level: str = 'info', 
                      target_roles: Optional[List[str]] = None) -> None:
        """
        Send broadcast message to all connected users or specific roles
        """
        try:
            broadcast_data = {
                'type': 'broadcast_message',
                'message': message,
                'level': level,
                'timestamp': timezone.now().isoformat()
            }
            
            if target_roles:
                # Send to specific role groups
                for role in target_roles:
                    async_to_sync(self.channel_layer.group_send)(
                        f"role_{role}",
                        broadcast_data
                    )
            else:
                # Send to broadcast group (admin/RH only)
                async_to_sync(self.channel_layer.group_send)(
                    "broadcast",
                    broadcast_data
                )
            
            logger.info(f"Sent broadcast message: {message}")
            
        except Exception as e:
            logger.error(f"Error sending broadcast: {e}")
            raise
    
    def _get_target_users_for_event(self, event: NotificationEvent) -> List[User]:
        """
        Determine target users based on event type and target roles
        """
        event_data = event.event_data
        target_roles = event_data.get('target_roles', [])
        
        # If specific roles are specified, filter by those roles
        if target_roles:
            return list(User.objects.filter(role__in=target_roles, is_active=True))
        
        # Otherwise, determine based on event type
        if event.event_type == NotificationEvent.EventType.SYSTEM:
            # System events go to all active users
            return list(User.objects.filter(is_active=True))
        
        elif event.event_type == NotificationEvent.EventType.STAGE_UPDATE:
            # Stage updates go to stage participants
            stage_id = event_data.get('stage_id')
            if stage_id:
                from shared.models import Stage
                try:
                    stage = Stage.objects.get(id=stage_id)
                    users = []
                    if stage.stagiaire:
                        users.append(stage.stagiaire)
                    if stage.tuteur:
                        users.append(stage.tuteur)
                    return users
                except Stage.DoesNotExist:
                    pass
        
        elif event.event_type == NotificationEvent.EventType.DOCUMENT_UPLOAD:
            # Document uploads go to stage participants and RH
            stage_id = event_data.get('stage_id')
            users = []
            
            if stage_id:
                from shared.models import Stage
                try:
                    stage = Stage.objects.get(id=stage_id)
                    if stage.stagiaire:
                        users.append(stage.stagiaire)
                    if stage.tuteur:
                        users.append(stage.tuteur)
                except Stage.DoesNotExist:
                    pass
            
            # Add RH users for document oversight
            rh_users = User.objects.filter(role='rh', is_active=True)
            users.extend(rh_users)
            return users
        
        elif event.event_type == NotificationEvent.EventType.EVALUATION:
            # Evaluation events go to evaluator and evaluated
            evaluator_id = event_data.get('evaluator_id')
            evaluated_id = event_data.get('evaluated_id')
            
            users = []
            if evaluator_id:
                try:
                    evaluator = User.objects.get(id=evaluator_id)
                    users.append(evaluator)
                except User.DoesNotExist:
                    pass
            
            if evaluated_id:
                try:
                    evaluated = User.objects.get(id=evaluated_id)
                    users.append(evaluated)
                except User.DoesNotExist:
                    pass
            
            return users
        
        elif event.event_type == NotificationEvent.EventType.SURVEY:
            # Survey events go to target stagiaires and RH team
            survey_id = event_data.get('survey_id')
            users = []
            
            if survey_id:
                from shared.models import Survey
                try:
                    survey = Survey.objects.get(id=survey_id)
                    target_stagiaires = survey.get_target_stagiaires()
                    users.extend(target_stagiaires)
                except Survey.DoesNotExist:
                    pass
            
            # Add RH users for survey management
            rh_users = User.objects.filter(role='rh', is_active=True)
            users.extend(rh_users)
            return users
        
        elif event.event_type == NotificationEvent.EventType.KPI_ALERT:
            # KPI alerts go to RH team and relevant tuteurs
            stage_id = event_data.get('stage_id')
            users = list(User.objects.filter(role='rh', is_active=True))
            
            if stage_id:
                from shared.models import Stage
                try:
                    stage = Stage.objects.get(id=stage_id)
                    if stage.tuteur:
                        users.append(stage.tuteur)
                except Stage.DoesNotExist:
                    pass
            
            return users
        
        elif event.event_type == NotificationEvent.EventType.TESTIMONIAL:
            # Testimonial events go to RH team and stage participants
            stage_id = event_data.get('stage_id')
            users = list(User.objects.filter(role='rh', is_active=True))
            
            if stage_id:
                from shared.models import Stage
                try:
                    stage = Stage.objects.get(id=stage_id)
                    if stage.stagiaire:
                        users.append(stage.stagiaire)
                    if stage.tuteur:
                        users.append(stage.tuteur)
                except Stage.DoesNotExist:
                    pass
            
            return users
        
        elif event.event_type == NotificationEvent.EventType.DEMANDE:
            # Demande events go to RH team and relevant users
            users = list(User.objects.filter(role='rh', is_active=True))
            
            # Add specific users if mentioned in event data
            user_id = event_data.get('user_id')
            if user_id:
                try:
                    user = User.objects.get(id=user_id)
                    users.append(user)
                except User.DoesNotExist:
                    pass
            
            return users
        
        return []
    
    def _create_notification_from_event(self, event: NotificationEvent, 
                                      user: User) -> Optional[SharedNotification]:
        """
        Create notification from event using templates
        """
        try:
            # Try to find a template for this event type
            template_name = f"{event.event_type}_notification"
            
            try:
                template = NotificationTemplate.objects.get(
                    name=template_name,
                    is_active=True
                )
                title, message = template.render(event.event_data)
            except NotificationTemplate.DoesNotExist:
                # Use default template
                title = f"New {event.event_type.replace('_', ' ').title()}"
                message = f"A new {event.event_type.replace('_', ' ')} event has occurred."
            
            # Determine notification type based on event type
            notification_type = self._get_notification_type_for_event(event)
            
            return SharedNotification.objects.create(
                recipient=user,
                title=title,
                message=message,
                notification_type=notification_type,
                related_stage=event.event_data.get('stage'),
                related_step=event.event_data.get('step'),
                related_document=event.event_data.get('document')
            )
            
        except Exception as e:
            logger.error(f"Error creating notification from event: {e}")
            return None
    
    def _get_notification_type_for_event(self, event: NotificationEvent) -> str:
        """
        Determine notification type based on event type
        """
        event_type_to_notification_type = {
            NotificationEvent.EventType.SYSTEM: 'info',
            NotificationEvent.EventType.USER_ACTION: 'info',
            NotificationEvent.EventType.STAGE_UPDATE: 'info',
            NotificationEvent.EventType.DOCUMENT_UPLOAD: 'info',
            NotificationEvent.EventType.EVALUATION: 'info',
            NotificationEvent.EventType.SURVEY: 'info',
            NotificationEvent.EventType.TESTIMONIAL: 'success',
            NotificationEvent.EventType.DEMANDE: 'info',
            NotificationEvent.EventType.KPI_ALERT: 'warning',
        }
        
        return event_type_to_notification_type.get(event.event_type, 'info')
    
    def _send_real_time_notifications(self, notifications: List[SharedNotification]) -> None:
        """
        Send real-time notifications for multiple notifications
        """
        for notification in notifications:
            self._send_real_time_notification(notification)
    
    def _send_real_time_notification(self, notification: SharedNotification) -> None:
        """
        Send real-time notification to user's WebSocket
        """
        try:
            notification_data = {
                'type': 'notification_message',
                'notification': {
                    'id': notification.id,
                    'title': notification.title,
                    'message': notification.message,
                    'notification_type': notification.notification_type,
                    'is_read': notification.is_read,
                    'created_at': notification.created_at.isoformat()
                }
            }
            
            # Send to user's personal group
            async_to_sync(self.channel_layer.group_send)(
                f"user_{notification.recipient.id}",
                notification_data
            )
            
        except Exception as e:
            logger.error(f"Error sending real-time notification: {e}")
    
    def _send_role_broadcast(self, target_roles: List[str], title: str, message: str, 
                            notification_type: str) -> None:
        """
        Send real-time broadcast to role-based groups
        """
        try:
            broadcast_data = {
                'type': 'role_notification',
                'title': title,
                'message': message,
                'notification_type': notification_type,
                'target_roles': target_roles,
                'timestamp': timezone.now().isoformat()
            }
            
            for role in target_roles:
                async_to_sync(self.channel_layer.group_send)(
                    f"role_{role}",
                    broadcast_data
                )
                
        except Exception as e:
            logger.error(f"Error sending role broadcast: {e}")


# Global notification service instance
notification_service = NotificationService()
