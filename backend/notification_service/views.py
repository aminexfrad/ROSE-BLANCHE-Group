"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Q
from .models import NotificationEvent, NotificationTemplate, WebSocketConnection
from .services import notification_service
from shared.models import Notification as SharedNotification
from shared.serializers import NotificationSerializer

User = get_user_model()


class NotificationEventListView(generics.ListAPIView):
    """List notification events (admin/RH only)"""
    permission_classes = [IsAuthenticated]
    serializer_class = None  # We'll handle serialization manually
    
    def get_queryset(self):
        if self.request.user.role not in ['admin', 'rh']:
            return NotificationEvent.objects.none()
        return NotificationEvent.objects.all().order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        events_data = []
        for event in queryset:
            event_data = {
                'id': event.id,
                'event_type': event.event_type,
                'event_data': event.event_data,
                'source_user': {
                    'id': event.source_user.id,
                    'name': event.source_user.get_full_name(),
                    'role': event.source_user.role
                } if event.source_user else None,
                'target_users_count': event.target_users.count(),
                'processed': event.processed,
                'created_at': event.created_at.isoformat(),
                'processed_at': event.processed_at.isoformat() if event.processed_at else None
            }
            events_data.append(event_data)
        
        return Response({
            'results': events_data,
            'count': len(events_data)
        })


class NotificationTemplateListView(generics.ListCreateAPIView):
    """List and create notification templates (admin/RH only)"""
    permission_classes = [IsAuthenticated]
    serializer_class = None
    
    def get_queryset(self):
        if self.request.user.role not in ['admin', 'rh']:
            return NotificationTemplate.objects.none()
        return NotificationTemplate.objects.all().order_by('name')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        templates_data = []
        for template in queryset:
            template_data = {
                'id': template.id,
                'name': template.name,
                'title_template': template.title_template,
                'message_template': template.message_template,
                'notification_type': template.notification_type,
                'is_active': template.is_active,
                'created_at': template.created_at.isoformat(),
                'updated_at': template.updated_at.isoformat()
            }
            templates_data.append(template_data)
        
        return Response({
            'results': templates_data,
            'count': len(templates_data)
        })
    
    def create(self, request, *args, **kwargs):
        if request.user.role not in ['admin', 'rh']:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            template = NotificationTemplate.objects.create(
                name=request.data.get('name'),
                title_template=request.data.get('title_template'),
                message_template=request.data.get('message_template'),
                notification_type=request.data.get('notification_type', 'info'),
                is_active=request.data.get('is_active', True)
            )
            
            return Response({
                'id': template.id,
                'name': template.name,
                'title_template': template.title_template,
                'message_template': template.message_template,
                'notification_type': template.notification_type,
                'is_active': template.is_active,
                'created_at': template.created_at.isoformat()
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class NotificationTemplateDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete notification templates (admin/RH only)"""
    permission_classes = [IsAuthenticated]
    queryset = NotificationTemplate.objects.all()
    serializer_class = None
    
    def get_queryset(self):
        if self.request.user.role not in ['admin', 'rh']:
            return NotificationTemplate.objects.none()
        return NotificationTemplate.objects.all()
    
    def retrieve(self, request, *args, **kwargs):
        template = self.get_object()
        
        template_data = {
            'id': template.id,
            'name': template.name,
            'title_template': template.title_template,
            'message_template': template.message_template,
            'notification_type': template.notification_type,
            'is_active': template.is_active,
            'created_at': template.created_at.isoformat(),
            'updated_at': template.updated_at.isoformat()
        }
        
        return Response(template_data)
    
    def update(self, request, *args, **kwargs):
        template = self.get_object()
        
        try:
            if 'name' in request.data:
                template.name = request.data['name']
            if 'title_template' in request.data:
                template.title_template = request.data['title_template']
            if 'message_template' in request.data:
                template.message_template = request.data['message_template']
            if 'notification_type' in request.data:
                template.notification_type = request.data['notification_type']
            if 'is_active' in request.data:
                template.is_active = request.data['is_active']
            
            template.save()
            
            return Response({
                'id': template.id,
                'name': template.name,
                'title_template': template.title_template,
                'message_template': template.message_template,
                'notification_type': template.notification_type,
                'is_active': template.is_active,
                'updated_at': template.updated_at.isoformat()
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class WebSocketConnectionListView(generics.ListAPIView):
    """List active WebSocket connections (admin/RH only)"""
    permission_classes = [IsAuthenticated]
    serializer_class = None
    
    def get_queryset(self):
        if self.request.user.role not in ['admin', 'rh']:
            return WebSocketConnection.objects.none()
        return WebSocketConnection.objects.filter(is_active=True).order_by('-last_activity')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        connections_data = []
        for connection in queryset:
            connection_data = {
                'id': connection.id,
                'user': {
                    'id': connection.user.id,
                    'name': connection.user.get_full_name(),
                    'role': connection.user.role
                },
                'connection_id': connection.connection_id,
                'is_active': connection.is_active,
                'last_activity': connection.last_activity.isoformat(),
                'created_at': connection.created_at.isoformat()
            }
            connections_data.append(connection_data)
        
        return Response({
            'results': connections_data,
            'count': len(connections_data)
        })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_test_notification(request):
    """Send a test notification (admin/RH only)"""
    if request.user.role not in ['admin', 'rh']:
        return Response(
            {'error': 'Permission denied'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        recipient_id = request.data.get('recipient_id')
        title = request.data.get('title', 'Test Notification')
        message = request.data.get('message', 'This is a test notification')
        notification_type = request.data.get('notification_type', 'info')
        
        if recipient_id:
            recipient = User.objects.get(id=recipient_id)
        else:
            recipient = request.user
        
        notification = notification_service.send_notification(
            recipient=recipient,
            title=title,
            message=message,
            notification_type=notification_type
        )
        
        return Response({
            'success': True,
            'notification_id': notification.id,
            'message': 'Test notification sent successfully'
        })
        
    except User.DoesNotExist:
        return Response(
            {'error': 'Recipient not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_broadcast_message(request):
    """Send broadcast message (admin/RH only)"""
    if request.user.role not in ['admin', 'rh']:
        return Response(
            {'error': 'Permission denied'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        message = request.data.get('message')
        level = request.data.get('level', 'info')
        target_roles = request.data.get('target_roles', [])
        
        if not message:
            return Response(
                {'error': 'Message is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        notification_service.send_broadcast(
            message=message,
            level=level,
            target_roles=target_roles if target_roles else None
        )
        
        return Response({
            'success': True,
            'message': 'Broadcast message sent successfully'
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_stats(request):
    """Get notification statistics (admin/RH only)"""
    if request.user.role not in ['admin', 'rh']:
        return Response(
            {'error': 'Permission denied'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        # Total notifications
        total_notifications = SharedNotification.objects.count()
        
        # Unread notifications
        unread_notifications = SharedNotification.objects.filter(is_read=False).count()
        
        # Notifications by type
        notifications_by_type = {}
        for notification_type in ['info', 'success', 'warning', 'error']:
            count = SharedNotification.objects.filter(
                notification_type=notification_type
            ).count()
            notifications_by_type[notification_type] = count
        
        # Recent events
        recent_events = NotificationEvent.objects.filter(
            created_at__gte=timezone.now() - timezone.timedelta(days=7)
        ).count()
        
        # Active connections
        active_connections = WebSocketConnection.objects.filter(is_active=True).count()
        
        return Response({
            'total_notifications': total_notifications,
            'unread_notifications': unread_notifications,
            'notifications_by_type': notifications_by_type,
            'recent_events': recent_events,
            'active_connections': active_connections
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
