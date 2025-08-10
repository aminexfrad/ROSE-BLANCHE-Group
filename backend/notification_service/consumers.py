"""
© 2025 Mohamed Amine FRAD. All rights reserved.
Unauthorized use, reproduction, or modification of this code is strictly prohibited.
Intellectual Property – Protected by international copyright law.
"""

import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import WebSocketConnection, Notification
from shared.models import Notification as SharedNotification

User = get_user_model()
logger = logging.getLogger(__name__)


class NotificationConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time notifications
    """
    
    async def connect(self):
        """Handle WebSocket connection"""
        try:
            # Get user from scope (set by authentication middleware)
            self.user = self.scope.get('user')
            
            if not self.user or not self.user.is_authenticated:
                await self.close(code=4001)  # Unauthorized
                return
            
            # Accept the connection
            await self.accept()
            
            # Generate unique connection ID
            self.connection_id = f"{self.user.id}_{timezone.now().timestamp()}"
            
            # Store connection in database
            await self.store_connection()
            
            # Join user's personal notification group
            await self.channel_layer.group_add(
                f"user_{self.user.id}",
                self.channel_name
            )
            
            # Join role-based groups
            await self.channel_layer.group_add(
                f"role_{self.user.role}",
                self.channel_name
            )
            
            # Send connection confirmation
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'connection_id': self.connection_id,
                'user_id': self.user.id,
                'user_role': self.user.role,
                'timestamp': timezone.now().isoformat()
            }))
            
            logger.info(f"WebSocket connected: {self.user.username} ({self.connection_id}) - Role: {self.user.role}")
            
        except Exception as e:
            logger.error(f"WebSocket connection error: {e}")
            await self.close(code=4000)  # Internal error
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        try:
            # Remove from groups
            if hasattr(self, 'user') and self.user:
                await self.channel_layer.group_discard(
                    f"user_{self.user.id}",
                    self.channel_name
                )
                await self.channel_layer.group_discard(
                    f"role_{self.user.role}",
                    self.channel_name
                )
            
            # Mark connection as inactive
            if hasattr(self, 'connection_id'):
                await self.deactivate_connection()
            
            logger.info(f"WebSocket disconnected: {getattr(self, 'user', 'Unknown')} (code: {close_code})")
            
        except Exception as e:
            logger.error(f"WebSocket disconnection error: {e}")
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'ping':
                # Handle ping for connection health check
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': timezone.now().isoformat()
                }))
            
            elif message_type == 'get_notifications':
                # Send current notifications
                await self.send_notifications()
            
            elif message_type == 'mark_read':
                # Mark notification as read
                notification_id = data.get('notification_id')
                if notification_id:
                    await self.mark_notification_read(notification_id)
            
            elif message_type == 'get_unread_count':
                # Get unread notification count
                count = await self.get_unread_count()
                await self.send(text_data=json.dumps({
                    'type': 'unread_count',
                    'count': count,
                    'timestamp': timezone.now().isoformat()
                }))
            
            else:
                logger.warning(f"Unknown message type: {message_type}")
                
        except json.JSONDecodeError:
            logger.error("Invalid JSON received")
        except Exception as e:
            logger.error(f"Error handling message: {e}")
    
    async def notification_message(self, event):
        """Handle notification message from channel layer"""
        try:
            await self.send(text_data=json.dumps(event))
        except Exception as e:
            logger.error(f"Error sending notification message: {e}")
    
    async def role_notification(self, event):
        """Handle role-based notification from channel layer"""
        try:
            # Only send if user is in the target roles
            target_roles = event.get('target_roles', [])
            if self.user.role in target_roles:
                await self.send(text_data=json.dumps(event))
        except Exception as e:
            logger.error(f"Error sending role notification: {e}")
    
    async def system_message(self, event):
        """Handle system message from channel layer"""
        try:
            await self.send(text_data=json.dumps(event))
        except Exception as e:
            logger.error(f"Error sending system message: {e}")
    
    @database_sync_to_async
    def store_connection(self):
        """Store WebSocket connection in database"""
        try:
            WebSocketConnection.objects.create(
                user=self.user,
                connection_id=self.connection_id,
                is_active=True
            )
        except Exception as e:
            logger.error(f"Error storing connection: {e}")
    
    @database_sync_to_async
    def deactivate_connection(self):
        """Mark connection as inactive"""
        try:
            WebSocketConnection.objects.filter(
                connection_id=self.connection_id
            ).update(is_active=False)
        except Exception as e:
            logger.error(f"Error deactivating connection: {e}")
    
    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        """Mark notification as read"""
        try:
            notification = SharedNotification.objects.get(
                id=notification_id,
                recipient=self.user
            )
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save()
            
            # Send confirmation
            return True
            
        except SharedNotification.DoesNotExist:
            logger.warning(f"Notification {notification_id} not found for user {self.user.id}")
            return False
    
    @database_sync_to_async
    def get_user_notifications(self):
        """Get user's notifications"""
        return list(SharedNotification.objects.filter(
            recipient=self.user
        ).order_by('-created_at')[:50])  # Limit to 50 most recent
    
    @database_sync_to_async
    def get_unread_count(self):
        """Get unread notification count for user"""
        return SharedNotification.objects.filter(
            recipient=self.user,
            is_read=False
        ).count()
    
    async def send_notifications(self):
        """Send current notifications to client"""
        try:
            notifications = await self.get_user_notifications()
            
            await self.send(text_data=json.dumps({
                'type': 'notifications_list',
                'notifications': [
                    {
                        'id': n.id,
                        'title': n.title,
                        'message': n.message,
                        'notification_type': n.notification_type,
                        'is_read': n.is_read,
                        'read_at': n.read_at.isoformat() if n.read_at else None,
                        'created_at': n.created_at.isoformat()
                    }
                    for n in notifications
                ],
                'timestamp': timezone.now().isoformat()
            }))
            
        except Exception as e:
            logger.error(f"Error sending notifications list: {e}")


class BroadcastConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for broadcast messages (admin/system level)
    """
    
    async def connect(self):
        """Handle WebSocket connection for broadcast"""
        try:
            self.user = self.scope.get('user')
            
            if not self.user or not self.user.is_authenticated:
                await self.close(code=4001)
                return
            
            # Only allow admin users for broadcast
            if self.user.role not in ['admin', 'rh']:
                await self.close(code=4003)  # Forbidden
                return
            
            await self.accept()
            
            # Join broadcast group
            await self.channel_layer.group_add(
                "broadcast",
                self.channel_name
            )
            
            await self.send(text_data=json.dumps({
                'type': 'broadcast_connected',
                'user_id': self.user.id,
                'user_role': self.user.role,
                'timestamp': timezone.now().isoformat()
            }))
            
        except Exception as e:
            logger.error(f"Broadcast connection error: {e}")
            await self.close(code=4000)
    
    async def disconnect(self, close_code):
        """Handle broadcast disconnection"""
        try:
            await self.channel_layer.group_discard(
                "broadcast",
                self.channel_name
            )
        except Exception as e:
            logger.error(f"Broadcast disconnection error: {e}")
    
    async def broadcast_message(self, event):
        """Send broadcast message"""
        try:
            await self.send(text_data=json.dumps({
                'type': 'broadcast',
                'message': event['message'],
                'level': event.get('level', 'info'),
                'sender': event.get('sender'),
                'timestamp': timezone.now().isoformat()
            }))
        except Exception as e:
            logger.error(f"Error sending broadcast: {e}")
    
    async def role_notification(self, event):
        """Handle role-based notification from channel layer"""
        try:
            # Only send if user is in the target roles
            target_roles = event.get('target_roles', [])
            if self.user.role in target_roles:
                await self.send(text_data=json.dumps(event))
        except Exception as e:
            logger.error(f"Error sending role notification: {e}")
