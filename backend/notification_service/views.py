"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Q
from .services import NotificationService
from .role_notifications import RoleNotificationHelper
from shared.models import Notification
from shared.serializers import NotificationSerializer

User = get_user_model()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_notifications(request):
    """
    Get notifications for the authenticated user
    """
    try:
        notifications = Notification.objects.filter(
            recipient=request.user
        ).order_by('-created_at')
        
        # Apply filters if provided
        notification_type = request.query_params.get('type')
        if notification_type:
            notifications = notifications.filter(notification_type=notification_type)
        
        is_read = request.query_params.get('is_read')
        if is_read is not None:
            is_read_bool = is_read.lower() == 'true'
            notifications = notifications.filter(is_read=is_read_bool)
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        start = (page - 1) * page_size
        end = start + page_size
        
        paginated_notifications = notifications[start:end]
        
        serializer = NotificationSerializer(paginated_notifications, many=True)
        
        return Response({
            'notifications': serializer.data,
            'total_count': notifications.count(),
            'page': page,
            'page_size': page_size,
            'has_next': end < notifications.count(),
            'has_previous': page > 1
        })
        
    except Exception as e:
        return Response(
            {'error': f'Error retrieving notifications: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unread_count(request):
    """
    Get unread notification count for the authenticated user
    """
    try:
        count = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).count()
        
        return Response({'unread_count': count})
        
    except Exception as e:
        return Response(
            {'error': f'Error retrieving unread count: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    """
    Mark a notification as read
    """
    try:
        notification = get_object_or_404(
            Notification, 
            id=notification_id, 
            recipient=request.user
        )
        
        notification.is_read = True
        notification.save()
        
        return Response({'message': 'Notification marked as read'})
        
    except Exception as e:
        return Response(
            {'error': f'Error marking notification as read: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    """
    Mark all notifications as read for the authenticated user
    """
    try:
        Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(is_read=True)
        
        return Response({'message': 'All notifications marked as read'})
        
    except Exception as e:
        return Response(
            {'error': f'Error marking notifications as read: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_notification(request, notification_id):
    """
    Delete a notification
    """
    try:
        notification = get_object_or_404(
            Notification, 
            id=notification_id, 
            recipient=request.user
        )
        
        notification.delete()
        
        return Response({'message': 'Notification deleted'})
        
    except Exception as e:
        return Response(
            {'error': f'Error deleting notification: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_all_notifications(request):
    """
    Clear all notifications for the authenticated user
    """
    try:
        Notification.objects.filter(recipient=request.user).delete()
        
        return Response({'message': 'All notifications cleared'})
        
    except Exception as e:
        return Response(
            {'error': f'Error clearing notifications: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Role-based notification endpoints (admin/RH only)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_role_notification(request):
    """
    Send notification to users with specific roles (admin/RH only)
    """
    try:
        # Check permissions
        if request.user.role not in ['admin', 'rh']:
            return Response(
                {'error': 'Insufficient permissions'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get request data
        target_roles = request.data.get('target_roles', [])
        title = request.data.get('title')
        message = request.data.get('message')
        notification_type = request.data.get('notification_type', 'info')
        
        if not all([target_roles, title, message]):
            return Response(
                {'error': 'Missing required fields: target_roles, title, message'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate roles
        valid_roles = ['stagiaire', 'tuteur', 'rh', 'admin']
        if not all(role in valid_roles for role in target_roles):
            return Response(
                {'error': f'Invalid roles. Valid roles: {valid_roles}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Send role notifications
        helper = RoleNotificationHelper()
        notifications = helper.notification_service.send_role_notifications(
            target_roles=target_roles,
            title=title,
            message=message,
            notification_type=notification_type
        )
        
        return Response({
            'message': f'Notifications sent to {len(notifications)} users',
            'target_roles': target_roles,
            'notifications_count': len(notifications)
        })
        
    except Exception as e:
        return Response(
            {'error': f'Error sending role notifications: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_broadcast_notification(request):
    """
    Send broadcast notification to all users (admin only)
    """
    try:
        # Check permissions
        if request.user.role != 'admin':
            return Response(
                {'error': 'Insufficient permissions'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get request data
        message = request.data.get('message')
        level = request.data.get('level', 'info')
        
        if not message:
            return Response(
                {'error': 'Missing required field: message'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Send broadcast
        notification_service = NotificationService()
        notification_service.send_broadcast(message=message, level=level)
        
        return Response({
            'message': 'Broadcast notification sent',
            'level': level
        })
        
    except Exception as e:
        return Response(
            {'error': f'Error sending broadcast: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notification_statistics(request):
    """
    Get notification statistics for the authenticated user
    """
    try:
        user_notifications = Notification.objects.filter(recipient=request.user)
        
        total_count = user_notifications.count()
        unread_count = user_notifications.filter(is_read=False).count()
        read_count = user_notifications.filter(is_read=True).count()
        
        # Count by type
        type_counts = {}
        for notification_type in ['info', 'success', 'warning', 'error']:
            type_counts[notification_type] = user_notifications.filter(
                notification_type=notification_type
            ).count()
        
        # Recent activity (last 7 days)
        from django.utils import timezone
        from datetime import timedelta
        
        week_ago = timezone.now() - timedelta(days=7)
        recent_count = user_notifications.filter(
            created_at__gte=week_ago
        ).count()
        
        return Response({
            'total_count': total_count,
            'unread_count': unread_count,
            'read_count': read_count,
            'type_counts': type_counts,
            'recent_count': recent_count
        })
        
    except Exception as e:
        return Response(
            {'error': f'Error retrieving statistics: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_notifications(request):
    """
    Search notifications by title or message
    """
    try:
        query = request.query_params.get('q', '')
        if not query:
            return Response(
                {'error': 'Search query required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        notifications = Notification.objects.filter(
            recipient=request.user
        ).filter(
            Q(title__icontains=query) | Q(message__icontains=query)
        ).order_by('-created_at')
        
        serializer = NotificationSerializer(notifications, many=True)
        
        return Response({
            'notifications': serializer.data,
            'total_count': notifications.count(),
            'query': query
        })
        
    except Exception as e:
        return Response(
            {'error': f'Error searching notifications: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Admin endpoints for system-wide notification management
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_system_notification_stats(request):
    """
    Get system-wide notification statistics (admin only)
    """
    try:
        # Check permissions
        if request.user.role != 'admin':
            return Response(
                {'error': 'Insufficient permissions'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        total_notifications = Notification.objects.count()
        total_users = User.objects.filter(is_active=True).count()
        
        # Count by role
        role_counts = {}
        for role in ['stagiaire', 'tuteur', 'rh', 'admin']:
            role_users = User.objects.filter(role=role, is_active=True)
            role_notifications = Notification.objects.filter(
                recipient__in=role_users
            ).count()
            role_counts[role] = {
                'user_count': role_users.count(),
                'notification_count': role_notifications
            }
        
        return Response({
            'total_notifications': total_notifications,
            'total_users': total_users,
            'role_counts': role_counts
        })
        
    except Exception as e:
        return Response(
            {'error': f'Error retrieving system stats: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
